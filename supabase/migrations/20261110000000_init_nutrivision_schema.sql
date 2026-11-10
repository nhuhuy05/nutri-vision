-- ==============================================================================
-- NUTRIVISION DATABASE SCHEMA (PostgreSQL / Supabase)
-- Cloud Architecture with Row Level Security (RLS) & Offline-First Sync Support
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- FUNCTION: Automatically update updated_at timestamp
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. TABLE: user_profiles (1-1 với Supabase Auth auth.users, tích hợp cài đặt)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  email TEXT,
  name TEXT NOT NULL DEFAULT 'Người dùng NutriVision',
  avatar_url TEXT,
  gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  bmr_basis TEXT NOT NULL DEFAULT 'male' CHECK (bmr_basis IN ('male', 'female', 'average')),
  birth_year INTEGER CHECK (birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)),
  height_cm NUMERIC(5, 2) CHECK (height_cm IS NULL OR height_cm > 0),
  start_weight_kg NUMERIC(5, 2) CHECK (start_weight_kg IS NULL OR start_weight_kg > 0),
  target_weight_kg NUMERIC(5, 2) CHECK (target_weight_kg IS NULL OR target_weight_kg > 0),
  goal_type TEXT CHECK (goal_type IS NULL OR goal_type IN ('fat_loss', 'maintenance', 'muscle_gain')),
  activity_level TEXT CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'very_active')),
  diet_preference TEXT NOT NULL DEFAULT 'none' CHECK (diet_preference IN ('none', 'vegetarian', 'vegan', 'keto', 'low_carb')),
  allergies_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  bmr NUMERIC(7, 2),
  tdee NUMERIC(7, 2),
  is_onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,

  -- Cài đặt người dùng tích hợp trực tiếp
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  language TEXT NOT NULL DEFAULT 'vi',
  unit_weight TEXT NOT NULL DEFAULT 'kg' CHECK (unit_weight IN ('kg', 'lb')),
  unit_height TEXT NOT NULL DEFAULT 'cm' CHECK (unit_height IN ('cm', 'ft')),
  unit_water TEXT NOT NULL DEFAULT 'ml' CHECK (unit_water IN ('ml', 'oz')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  week_starts_on INTEGER NOT NULL DEFAULT 1 CHECK (week_starts_on IN (0, 1)),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Trigger: auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Người dùng NutriVision'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 2. TABLE: nutrition_goals (Lịch sử mục tiêu dinh dưỡng)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  calories NUMERIC(7, 2) NOT NULL CHECK (calories > 0),
  protein_g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  fat_g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  water_ml NUMERIC(6, 2) NOT NULL DEFAULT 2000,
  fiber_g NUMERIC(6, 2) NOT NULL DEFAULT 25,
  sodium_mg NUMERIC(7, 2) NOT NULL DEFAULT 2300,
  source TEXT NOT NULL DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_goals_user_eff ON public.nutrition_goals(user_id, effective_from DESC);

CREATE TRIGGER set_nutrition_goals_updated_at
  BEFORE UPDATE ON public.nutrition_goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 3. TABLE: foods (Kho thực phẩm & Món ăn, dinh dưỡng tính trên 100g)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.foods (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('seed', 'user', 'barcode', 'ai')),
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  name_normalized TEXT NOT NULL,
  category_code TEXT NOT NULL DEFAULT 'main_dish',
  ai_class_label TEXT,
  barcode TEXT,
  calories_100g NUMERIC(7, 2) NOT NULL CHECK (calories_100g >= 0),
  protein_100g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  carbs_100g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  fat_100g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  fiber_100g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  sugar_100g NUMERIC(6, 2) NOT NULL DEFAULT 0,
  sodium_mg_100g NUMERIC(7, 2) NOT NULL DEFAULT 0,
  seed_version INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CHECK ((source = 'seed' AND created_by IS NULL) OR (source <> 'seed' AND created_by IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_foods_barcode ON public.foods(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foods_ai_label ON public.foods(ai_class_label) WHERE ai_class_label IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category_code);
CREATE INDEX IF NOT EXISTS idx_foods_creator ON public.foods(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foods_normalized ON public.foods(name_normalized);

CREATE TRIGGER set_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 4. TABLE: food_servings (Khẩu phần định lượng của món ăn)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.food_servings (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  grams NUMERIC(7, 2) NOT NULL CHECK (grams > 0),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_servings_food ON public.food_servings(food_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_servings_default ON public.food_servings(food_id) WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE TRIGGER set_food_servings_updated_at
  BEFORE UPDATE ON public.food_servings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 5. TABLE: favorite_foods (Món ăn yêu thích của người dùng)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.favorite_foods (
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, food_id)
);

CREATE TRIGGER set_favorite_foods_updated_at
  BEFORE UPDATE ON public.favorite_foods
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 6. TABLE: ai_scan_history (Lịch sử nhận diện AI, tích hợp Top-K suggestions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_scan_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  image_uri TEXT NOT NULL,
  image_remote_path TEXT,
  engine TEXT NOT NULL CHECK (engine IN ('tflite', 'mlkit', 'cloud_llm')),
  model_version TEXT NOT NULL,
  labels_version TEXT,
  predicted_label TEXT,
  predicted_food_id TEXT REFERENCES public.foods(id),
  confidence_score NUMERIC(5, 4) CHECK (confidence_score IS NULL OR (confidence_score BETWEEN 0 AND 1)),
  candidates_json JSONB DEFAULT '[]'::jsonb,
  inference_ms INTEGER,
  confirmed_food_id TEXT REFERENCES public.foods(id),
  is_user_corrected BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'discarded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scan_user_time ON public.ai_scan_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_model ON public.ai_scan_history(model_version, status);

CREATE TRIGGER set_ai_scan_history_updated_at
  BEFORE UPDATE ON public.ai_scan_history
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 7. TABLE: meals (Bữa ăn)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.meals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  logged_at BIGINT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  note TEXT,
  photo_uri TEXT,
  photo_remote_path TEXT,
  logged_via TEXT NOT NULL DEFAULT 'manual' CHECK (logged_via IN ('manual', 'ai_camera', 'barcode', 'template')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, date) WHERE deleted_at IS NULL;

CREATE TRIGGER set_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 8. TABLE: meal_items (Món ăn trong bữa; snapshot dinh dưỡng)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.meal_items (
  id TEXT PRIMARY KEY,
  meal_id TEXT NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  food_id TEXT REFERENCES public.foods(id) ON DELETE SET NULL,
  food_name TEXT NOT NULL,
  serving_label TEXT,
  serving_qty NUMERIC(5, 2),
  weight_grams NUMERIC(7, 2) NOT NULL CHECK (weight_grams > 0),
  calories NUMERIC(7, 2) NOT NULL,
  protein NUMERIC(6, 2) NOT NULL DEFAULT 0,
  carbs NUMERIC(6, 2) NOT NULL DEFAULT 0,
  fat NUMERIC(6, 2) NOT NULL DEFAULT 0,
  fiber NUMERIC(6, 2) NOT NULL DEFAULT 0,
  sugar NUMERIC(6, 2) NOT NULL DEFAULT 0,
  sodium_mg NUMERIC(7, 2) NOT NULL DEFAULT 0,
  ai_scan_id TEXT REFERENCES public.ai_scan_history(id) ON DELETE SET NULL,
  ai_confidence NUMERIC(5, 4),
  is_user_edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_items_meal ON public.meal_items(meal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_items_food ON public.meal_items(user_id, food_id);

CREATE TRIGGER set_meal_items_updated_at
  BEFORE UPDATE ON public.meal_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 9. TABLE: water_logs (Theo dõi uống nước)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.water_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
  recorded_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_water_user_date ON public.water_logs(user_id, date) WHERE deleted_at IS NULL;

CREATE TRIGGER set_water_logs_updated_at
  BEFORE UPDATE ON public.water_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 10. TABLE: weight_logs (Theo dõi cân nặng)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  body_fat_percentage NUMERIC(5, 2) CHECK (body_fat_percentage IS NULL OR (body_fat_percentage BETWEEN 0 AND 100)),
  note TEXT,
  photo_uri TEXT,
  photo_remote_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_weight_user_date ON public.weight_logs(user_id, recorded_date) WHERE deleted_at IS NULL;

CREATE TRIGGER set_weight_logs_updated_at
  BEFORE UPDATE ON public.weight_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_servings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- 1. user_profiles
CREATE POLICY "Users can manage their own profile"
  ON public.user_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. nutrition_goals
CREATE POLICY "Users can manage their own goals"
  ON public.nutrition_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. foods (Món seed đọc công khai; món user quản lý bởi chủ sở hữu)
CREATE POLICY "Everyone can read seed foods or own foods"
  ON public.foods FOR SELECT
  USING (source = 'seed' OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own foods"
  ON public.foods FOR INSERT
  WITH CHECK (auth.uid() = created_by AND source <> 'seed');

CREATE POLICY "Users can update their own foods"
  ON public.foods FOR UPDATE
  USING (auth.uid() = created_by AND source <> 'seed')
  WITH CHECK (auth.uid() = created_by AND source <> 'seed');

CREATE POLICY "Users can delete their own foods"
  ON public.foods FOR DELETE
  USING (auth.uid() = created_by AND source <> 'seed');

-- 4. food_servings
CREATE POLICY "Everyone can read servings for accessible foods"
  ON public.food_servings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.foods f
      WHERE f.id = food_servings.food_id
      AND (f.source = 'seed' OR f.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage servings of their custom foods"
  ON public.food_servings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.foods f
      WHERE f.id = food_servings.food_id
      AND f.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.foods f
      WHERE f.id = food_servings.food_id
      AND f.created_by = auth.uid()
    )
  );

-- 5. favorite_foods
CREATE POLICY "Users can manage their favorite foods"
  ON public.favorite_foods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. ai_scan_history
CREATE POLICY "Users can manage their scan history"
  ON public.ai_scan_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. meals
CREATE POLICY "Users can manage their meals"
  ON public.meals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. meal_items
CREATE POLICY "Users can manage their meal items"
  ON public.meal_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. water_logs
CREATE POLICY "Users can manage their water logs"
  ON public.water_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. weight_logs
CREATE POLICY "Users can manage their weight logs"
  ON public.weight_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- COMPATIBILITY VIEW & TRIGGER: meal_logs (Hỗ trợ Sync từ client)
-- ==============================================================================
CREATE OR REPLACE VIEW public.meal_logs AS
SELECT
  mi.id AS id,
  m.user_id AS user_id,
  m.date AS date,
  m.meal_type AS meal_type,
  COALESCE(mi.food_id, '') AS food_id,
  mi.food_name AS food_name,
  COALESCE(mi.serving_qty, 1.0) AS portion_multiplier,
  mi.calories AS calories,
  mi.protein AS protein,
  mi.carbs AS carbs,
  mi.fat AS fat,
  m.photo_uri AS photo_uri,
  mi.created_at AS created_at,
  mi.updated_at AS updated_at
FROM public.meal_items mi
JOIN public.meals m ON mi.meal_id = m.id;

CREATE OR REPLACE FUNCTION public.handle_meal_logs_upsert()
RETURNS TRIGGER AS $$
DECLARE
  v_meal_id TEXT;
BEGIN
  v_meal_id := 'meal_' || NEW.id;

  INSERT INTO public.meals (
    id, user_id, date, logged_at, meal_type, photo_uri, logged_via, created_at, updated_at
  ) VALUES (
    v_meal_id,
    NEW.user_id,
    NEW.date,
    EXTRACT(EPOCH FROM COALESCE(NEW.created_at, NOW())) * 1000,
    NEW.meal_type,
    NEW.photo_uri,
    'manual',
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    meal_type = EXCLUDED.meal_type,
    photo_uri = EXCLUDED.photo_uri,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.meal_items (
    id, meal_id, user_id, food_id, food_name, serving_label, serving_qty,
    weight_grams, calories, protein, carbs, fat, created_at, updated_at
  ) VALUES (
    NEW.id,
    v_meal_id,
    NEW.user_id,
    NULLIF(NEW.food_id, ''),
    NEW.food_name,
    '1 khẩu phần',
    NEW.portion_multiplier,
    100,
    NEW.calories,
    NEW.protein,
    NEW.carbs,
    NEW.fat,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    food_name = EXCLUDED.food_name,
    serving_qty = EXCLUDED.serving_qty,
    calories = EXCLUDED.calories,
    protein = EXCLUDED.protein,
    carbs = EXCLUDED.carbs,
    fat = EXCLUDED.fat,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_meal_logs_upsert ON public.meal_logs;
CREATE TRIGGER trg_meal_logs_upsert
  INSTEAD OF INSERT OR UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_meal_logs_upsert();

