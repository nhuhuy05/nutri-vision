-- ==============================================================================
-- FIX: Update handle_meal_logs_upsert trigger to safely handle foreign keys
-- and support direct INSERTs from Supabase Client.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_meal_logs_upsert()
RETURNS TRIGGER AS $$
DECLARE
  v_meal_id TEXT;
  v_valid_food_id TEXT;
BEGIN
  v_meal_id := 'meal_' || NEW.id;

  -- 1. Kiểm tra an toàn: chỉ gán food_id nếu món ăn đã tồn tại trong bảng foods
  SELECT id INTO v_valid_food_id FROM public.foods WHERE id = NEW.food_id LIMIT 1;

  -- 2. Upsert bảng meals
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

  -- 3. Upsert bảng meal_items (dùng v_valid_food_id an toàn tuyệt đối)
  INSERT INTO public.meal_items (
    id, meal_id, user_id, food_id, food_name, serving_label, serving_qty,
    weight_grams, calories, protein, carbs, fat, created_at, updated_at
  ) VALUES (
    NEW.id,
    v_meal_id,
    NEW.user_id,
    v_valid_food_id,
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
    food_id = v_valid_food_id,
    food_name = EXCLUDED.food_name,
    serving_qty = EXCLUDED.serving_qty,
    calories = EXCLUDED.calories,
    protein = EXCLUDED.protein,
    carbs = EXCLUDED.carbs,
    fat = EXCLUDED.fat,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gán lại trigger cho view meal_logs
DROP TRIGGER IF EXISTS trg_meal_logs_upsert ON public.meal_logs;
CREATE TRIGGER trg_meal_logs_upsert
  INSTEAD OF INSERT OR UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_meal_logs_upsert();

-- ==============================================================================
-- SEED: 14 món ăn Việt Nam mẫu vào bảng foods trên Supabase
-- ==============================================================================
INSERT INTO public.foods (
  id, source, created_by, name, name_en, name_normalized, category_code, ai_class_label,
  calories_100g, protein_100g, carbs_100g, fat_100g, fiber_100g, sugar_100g, sodium_mg_100g, seed_version
) VALUES
  ('pho-bo', 'seed', NULL, 'Phở bò tái nạm', 'Beef Pho', 'pho bo tai nam', 'soup', 'pho-bo', 100, 6.2, 12.9, 2.7, 0, 0, 0, 1),
  ('pho-ga', 'seed', NULL, 'Phở gà ta', 'Chicken Pho', 'pho ga ta', 'soup', 'pho-ga', 95.2, 6.2, 13.1, 2.1, 0, 0, 0, 1),
  ('bun-bo-hue', 'seed', NULL, 'Bún bò Huế', 'Hue Spicy Beef Noodle', 'bun bo hue', 'soup', 'bun-bo-hue', 104, 6.0, 12.4, 3.2, 0, 0, 0, 1),
  ('com-tam-suon-bi-cha', 'seed', NULL, 'Cơm tấm sườn bì chả', 'Broken Rice with Grilled Pork & Egg Meatloaf', 'com tam suon bi cha', 'rice', 'com-tam-suon-bi-cha', 170, 8.5, 20.5, 6.0, 0, 0, 0, 1),
  ('banh-mi-thit', 'seed', NULL, 'Bánh mì thịt pate chả', 'Vietnamese Baguette Sandwich', 'banh mi thit pate cha', 'main_dish', 'banh-mi-thit', 205, 9.0, 24.0, 8.0, 0, 0, 0, 1),
  ('banh-mi-op-la', 'seed', NULL, 'Bánh mì ốp la (2 trứng)', 'Fried Egg Baguette', 'banh mi op la (2 trung)', 'main_dish', 'banh-mi-op-la', 189.5, 8.4, 22.1, 7.4, 0, 0, 0, 1),
  ('bun-cha', 'seed', NULL, 'Bún chả Hà Nội', 'Hanoi Grilled Pork with Vermicelli', 'bun cha ha noi', 'soup', 'bun-cha', 122.2, 6.9, 14.4, 4.0, 0, 0, 0, 1),
  ('goi-cuon', 'seed', NULL, 'Gỏi cuốn tôm thịt (2 cuốn)', 'Fresh Spring Rolls (2 pcs)', 'goi cuon tom thit (2 cuon)', 'snack', 'goi-cuon', 100, 7.5, 13.8, 1.9, 0, 0, 0, 1),
  ('cha-gio', 'seed', NULL, 'Chả giò / Nem rán (3 cuốn)', 'Fried Spring Rolls (3 pcs)', 'cha gio / nem ran (3 cuon)', 'main_dish', 'cha-gio', 220, 9.3, 16.0, 13.3, 0, 0, 0, 1),
  ('com-ga-xoi-mo', 'seed', NULL, 'Cơm gà xối mỡ', 'Crispy Fried Chicken Rice', 'com ga xoi mo', 'rice', 'com-ga-xoi-mo', 171.4, 8.6, 20.2, 6.2, 0, 0, 0, 1),
  ('canh-chua-ca', 'seed', NULL, 'Canh chua cá lóc', 'Sweet & Sour Fish Soup', 'canh chua ca loc', 'soup', 'canh-chua-ca', 60, 6.0, 5.0, 1.7, 0, 0, 0, 1),
  ('thit-kho-tau', 'seed', NULL, 'Thịt kho tàu nước dừa', 'Caramelized Pork Belly with Eggs', 'thit kho tau nuoc dua', 'main_dish', 'thit-kho-tau', 237.5, 13.8, 5.0, 18.1, 0, 0, 0, 1),
  ('bo-kho', 'seed', NULL, 'Bò kho bánh mì / hủ tiếu', 'Beef Stew', 'bo kho banh mi / hu tieu', 'soup', 'bo-kho', 124.4, 7.8, 11.6, 5.1, 0, 0, 0, 1),
  ('ca-phe-sua-da', 'seed', NULL, 'Cà phê sữa đá', 'Vietnamese Iced Coffee with Condensed Milk', 'ca phe sua da', 'drink', 'ca-phe-sua-da', 70, 1.5, 11.5, 2.0, 0, 0, 0, 1)
ON CONFLICT (id) DO NOTHING;

