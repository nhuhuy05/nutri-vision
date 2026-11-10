import * as SQLite from 'expo-sqlite';
import { VIETNAMESE_FOODS_DATA } from '../seed/vietnameseFoods';
import { DEFAULT_GOALS } from '../../../../domain/constants/defaultGoals';

export function normalizeVietnameseText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

export function mapCategoryCode(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('nước') || cat.includes('bún') || cat.includes('canh') || cat.includes('phở')) {
    return 'soup';
  }
  if (cat.includes('cơm') || cat.includes('xôi')) {
    return 'rice';
  }
  if (cat.includes('vặt') || cat.includes('khai vị')) {
    return 'snack';
  }
  if (cat.includes('rau')) {
    return 'vegetable';
  }
  if (cat.includes('tráng miệng') || cat.includes('chè')) {
    return 'dessert';
  }
  if (cat.includes('uống') || cat.includes('cà phê') || cat.includes('trà')) {
    return 'drink';
  }
  return 'main_dish';
}

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    -- =====================================================================
    -- 1. user_profiles [SYNC] (Thông tin cá nhân, thể trạng & Cài đặt)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS user_profiles (
      id                      TEXT PRIMARY KEY,
      is_guest                INTEGER NOT NULL DEFAULT 0 CHECK (is_guest IN (0,1)),
      email                   TEXT,
      name                    TEXT,
      avatar_url              TEXT,
      gender                  TEXT CHECK (gender IS NULL OR gender IN ('male','female','other')),
      bmr_basis               TEXT NOT NULL DEFAULT 'male'
                              CHECK (bmr_basis IN ('male','female','average')),
      birth_year              INTEGER CHECK (birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)),
      height_cm               REAL CHECK (height_cm IS NULL OR height_cm > 0),
      start_weight_kg         REAL CHECK (start_weight_kg IS NULL OR start_weight_kg > 0),
      target_weight_kg        REAL CHECK (target_weight_kg IS NULL OR target_weight_kg > 0),
      goal_type               TEXT CHECK (goal_type IS NULL OR goal_type IN ('fat_loss','maintenance','muscle_gain')),
      activity_level          TEXT CHECK (activity_level IS NULL OR activity_level IN ('sedentary','light','moderate','very_active')),
      diet_preference         TEXT NOT NULL DEFAULT 'none'
                              CHECK (diet_preference IN ('none','vegetarian','vegan','keto','low_carb')),
      allergies_json          TEXT NOT NULL DEFAULT '[]',
      bmr                     REAL,
      tdee                    REAL,
      is_onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_onboarding_completed IN (0,1)),
      theme                   TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system','light','dark')),
      language                TEXT NOT NULL DEFAULT 'vi',
      unit_weight             TEXT NOT NULL DEFAULT 'kg' CHECK (unit_weight IN ('kg','lb')),
      unit_height             TEXT NOT NULL DEFAULT 'cm' CHECK (unit_height IN ('cm','ft')),
      unit_water              TEXT NOT NULL DEFAULT 'ml' CHECK (unit_water IN ('ml','oz')),
      timezone                TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
      week_starts_on          INTEGER NOT NULL DEFAULT 1 CHECK (week_starts_on IN (0,1)),
      created_at              INTEGER NOT NULL,
      updated_at              INTEGER NOT NULL,
      deleted_at              INTEGER,
      synced                  INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts           INTEGER NOT NULL DEFAULT 0,
      sync_error              TEXT
    );

    -- =====================================================================
    -- 2. nutrition_goals [SYNC] (Lịch sử mục tiêu dinh dưỡng)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS nutrition_goals (
      id             TEXT PRIMARY KEY,
      user_id        TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      effective_from TEXT NOT NULL,
      calories       REAL NOT NULL CHECK (calories > 0),
      protein_g      REAL NOT NULL,
      carbs_g        REAL NOT NULL,
      fat_g          REAL NOT NULL,
      water_ml       REAL NOT NULL DEFAULT 2000,
      fiber_g        REAL NOT NULL DEFAULT 25,
      sodium_mg      REAL NOT NULL DEFAULT 2300,
      source         TEXT NOT NULL DEFAULT 'auto' CHECK (source IN ('auto','manual')),
      created_at     INTEGER NOT NULL,
      updated_at     INTEGER NOT NULL,
      deleted_at     INTEGER,
      synced         INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts  INTEGER NOT NULL DEFAULT 0,
      sync_error     TEXT
    );

    -- =====================================================================
    -- 3. foods [SYNC chỉ với source <> 'seed'] (Dinh dưỡng tính trên 100g)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS foods (
      id               TEXT PRIMARY KEY,
      source           TEXT NOT NULL CHECK (source IN ('seed','user','barcode','ai')),
      created_by       TEXT REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      name             TEXT NOT NULL,
      name_en          TEXT,
      name_normalized  TEXT NOT NULL,
      category_code    TEXT NOT NULL DEFAULT 'main_dish',
      ai_class_label   TEXT,
      barcode          TEXT,
      calories_100g    REAL NOT NULL CHECK (calories_100g >= 0),
      protein_100g     REAL NOT NULL DEFAULT 0,
      carbs_100g       REAL NOT NULL DEFAULT 0,
      fat_100g         REAL NOT NULL DEFAULT 0,
      fiber_100g       REAL NOT NULL DEFAULT 0,
      sugar_100g       REAL NOT NULL DEFAULT 0,
      sodium_mg_100g   REAL NOT NULL DEFAULT 0,
      seed_version     INTEGER,
      created_at       INTEGER NOT NULL,
      updated_at       INTEGER NOT NULL,
      deleted_at       INTEGER,
      synced           INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts    INTEGER NOT NULL DEFAULT 0,
      sync_error       TEXT,
      CHECK ((source = 'seed' AND created_by IS NULL) OR (source <> 'seed' AND created_by IS NOT NULL))
    );

    -- =====================================================================
    -- 4. food_servings [SYNC chỉ với món của user] (Khẩu phần đa dạng)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS food_servings (
      id            TEXT PRIMARY KEY,
      food_id       TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
      label         TEXT NOT NULL,
      grams         REAL NOT NULL CHECK (grams > 0),
      is_default    INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)),
      sort_order    INTEGER NOT NULL DEFAULT 0,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL,
      deleted_at    INTEGER,
      synced        INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts INTEGER NOT NULL DEFAULT 0,
      sync_error    TEXT
    );

    -- =====================================================================
    -- 5. favorite_foods [SYNC]
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS favorite_foods (
      user_id       TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      food_id       TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL,
      deleted_at    INTEGER,
      synced        INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts INTEGER NOT NULL DEFAULT 0,
      sync_error    TEXT,
      PRIMARY KEY (user_id, food_id)
    );

    -- =====================================================================
    -- 6. ai_scan_history [SYNC] (Kèm candidates_json gọn gàng)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS ai_scan_history (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      image_uri           TEXT NOT NULL,
      image_remote_path   TEXT,
      engine              TEXT NOT NULL CHECK (engine IN ('tflite','mlkit','cloud_llm')),
      model_version       TEXT NOT NULL,
      labels_version      TEXT,
      predicted_label     TEXT,
      predicted_food_id   TEXT REFERENCES foods(id),
      confidence_score    REAL CHECK (confidence_score IS NULL OR (confidence_score BETWEEN 0 AND 1)),
      candidates_json     TEXT,
      inference_ms        INTEGER,
      confirmed_food_id   TEXT REFERENCES foods(id),
      is_user_corrected   INTEGER NOT NULL DEFAULT 0 CHECK (is_user_corrected IN (0,1)),
      status              TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','discarded','failed')),
      created_at          INTEGER NOT NULL,
      updated_at          INTEGER NOT NULL,
      deleted_at          INTEGER,
      synced              INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts       INTEGER NOT NULL DEFAULT 0,
      sync_error          TEXT
    );

    -- =====================================================================
    -- 7. meals [SYNC] (Bữa ăn)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS meals (
      id                TEXT PRIMARY KEY,
      user_id           TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      date              TEXT NOT NULL,
      logged_at         INTEGER NOT NULL,
      meal_type         TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
      note              TEXT,
      photo_uri         TEXT,
      photo_remote_path TEXT,
      logged_via        TEXT NOT NULL DEFAULT 'manual'
                        CHECK (logged_via IN ('manual','ai_camera','barcode','template')),
      created_at        INTEGER NOT NULL,
      updated_at        INTEGER NOT NULL,
      deleted_at        INTEGER,
      synced            INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts     INTEGER NOT NULL DEFAULT 0,
      sync_error        TEXT
    );

    -- =====================================================================
    -- 8. meal_items [SYNC] (Snapshot dinh dưỡng từng món)
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS meal_items (
      id              TEXT PRIMARY KEY,
      meal_id         TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
      user_id         TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      food_id         TEXT REFERENCES foods(id) ON DELETE SET NULL,
      food_name       TEXT NOT NULL,
      serving_label   TEXT,
      serving_qty     REAL,
      weight_grams    REAL NOT NULL CHECK (weight_grams > 0),
      calories        REAL NOT NULL,
      protein         REAL NOT NULL DEFAULT 0,
      carbs           REAL NOT NULL DEFAULT 0,
      fat             REAL NOT NULL DEFAULT 0,
      fiber           REAL NOT NULL DEFAULT 0,
      sugar           REAL NOT NULL DEFAULT 0,
      sodium_mg       REAL NOT NULL DEFAULT 0,
      ai_scan_id      TEXT REFERENCES ai_scan_history(id) ON DELETE SET NULL,
      ai_confidence   REAL,
      is_user_edited  INTEGER NOT NULL DEFAULT 0 CHECK (is_user_edited IN (0,1)),
      created_at      INTEGER NOT NULL,
      updated_at      INTEGER NOT NULL,
      deleted_at      INTEGER,
      synced          INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts   INTEGER NOT NULL DEFAULT 0,
      sync_error      TEXT
    );

    -- =====================================================================
    -- 9. water_logs [SYNC]
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS water_logs (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      date          TEXT NOT NULL,
      amount_ml     INTEGER NOT NULL CHECK (amount_ml > 0),
      recorded_at   INTEGER NOT NULL,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL,
      deleted_at    INTEGER,
      synced        INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts INTEGER NOT NULL DEFAULT 0,
      sync_error    TEXT
    );

    -- =====================================================================
    -- 10. weight_logs [SYNC]
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS weight_logs (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
      recorded_date       TEXT NOT NULL,
      weight_kg           REAL NOT NULL CHECK (weight_kg > 0),
      body_fat_percentage REAL CHECK (body_fat_percentage IS NULL OR (body_fat_percentage BETWEEN 0 AND 100)),
      note                TEXT,
      photo_uri           TEXT,
      photo_remote_path   TEXT,
      created_at          INTEGER NOT NULL,
      updated_at          INTEGER NOT NULL,
      deleted_at          INTEGER,
      synced              INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0,1)),
      sync_attempts       INTEGER NOT NULL DEFAULT 0,
      sync_error          TEXT
    );

    -- =====================================================================
    -- 11. sync_meta [LOCAL ONLY]
    -- =====================================================================
    CREATE TABLE IF NOT EXISTS sync_meta (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- =====================================================================
    -- INDEXES
    -- =====================================================================
    CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
    CREATE INDEX IF NOT EXISTS idx_goals_user_eff ON nutrition_goals(user_id, effective_from DESC);
    CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode) WHERE barcode IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_foods_ai_label ON foods(ai_class_label) WHERE ai_class_label IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category_code);
    CREATE INDEX IF NOT EXISTS idx_foods_creator ON foods(created_by) WHERE created_by IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_foods_unsynced ON foods(id) WHERE synced = 0;
    CREATE INDEX IF NOT EXISTS idx_foods_normalized ON foods(name_normalized);

    CREATE INDEX IF NOT EXISTS idx_servings_food ON food_servings(food_id);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_servings_default ON food_servings(food_id) WHERE is_default = 1 AND deleted_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_scan_user_time ON ai_scan_history(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_scan_model ON ai_scan_history(model_version, status);

    CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_meals_unsynced ON meals(id) WHERE synced = 0;

    CREATE INDEX IF NOT EXISTS idx_items_meal ON meal_items(meal_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_items_food ON meal_items(user_id, food_id);
    CREATE INDEX IF NOT EXISTS idx_items_unsync ON meal_items(id) WHERE synced = 0;

    CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_logs(user_id, date) WHERE deleted_at IS NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_weight_user_date ON weight_logs(user_id, recorded_date) WHERE deleted_at IS NULL;

    -- =====================================================================
    -- BACKWARD COMPATIBILITY VIEWS & TRIGGERS
    -- =====================================================================
    CREATE VIEW IF NOT EXISTS goals AS
    SELECT
      user_id,
      calories,
      protein_g AS protein,
      carbs_g AS carbs,
      fat_g AS fat,
      water_ml,
      fiber_g AS fiber_grams,
      sodium_mg,
      datetime(updated_at / 1000, 'unixepoch') AS updated_at
    FROM nutrition_goals;

    CREATE TRIGGER IF NOT EXISTS trg_goals_insert INSTEAD OF INSERT ON goals BEGIN
      INSERT OR REPLACE INTO nutrition_goals (
        id, user_id, effective_from, calories, protein_g, carbs_g, fat_g, water_ml, fiber_g, sodium_mg, source, created_at, updated_at, synced
      ) VALUES (
        'goal_' || new.user_id,
        new.user_id,
        date('now'),
        new.calories,
        new.protein,
        new.carbs,
        new.fat,
        new.water_ml,
        COALESCE(new.fiber_grams, 25),
        COALESCE(new.sodium_mg, 2300),
        'manual',
        strftime('%s', 'now') * 1000,
        strftime('%s', 'now') * 1000,
        0
      );
    END;

    CREATE VIEW IF NOT EXISTS meal_logs AS
    SELECT
      mi.id AS id,
      m.user_id AS user_id,
      m.date AS date,
      m.meal_type AS meal_type,
      COALESCE(mi.food_id, '') AS food_id,
      mi.food_name AS food_name,
      COALESCE(mi.serving_qty, 1.0) AS portion_multiplier,
      mi.serving_label AS serving_unit,
      mi.weight_grams AS actual_weight_grams,
      mi.calories AS calories,
      mi.protein AS protein,
      mi.carbs AS carbs,
      mi.fat AS fat,
      mi.fiber AS fiber,
      m.photo_uri AS photo_uri,
      m.note AS note,
      m.logged_via AS logged_via,
      datetime(mi.created_at / 1000, 'unixepoch') AS created_at,
      datetime(mi.updated_at / 1000, 'unixepoch') AS updated_at,
      CASE WHEN mi.deleted_at IS NOT NULL THEN datetime(mi.deleted_at / 1000, 'unixepoch') ELSE NULL END AS deleted_at,
      mi.synced AS synced
    FROM meal_items mi
    JOIN meals m ON mi.meal_id = m.id;
  `);

  // Setup FTS5 search (with graceful fallback if FTS5 is unavailable)
  try {
    await db.execAsync(`
      CREATE VIRTUAL TABLE IF NOT EXISTS foods_fts USING fts5(
        name_normalized,
        content = 'foods',
        content_rowid = 'rowid'
      );
      CREATE TRIGGER IF NOT EXISTS foods_ai AFTER INSERT ON foods BEGIN
        INSERT INTO foods_fts(rowid, name_normalized) VALUES (new.rowid, new.name_normalized);
      END;
      CREATE TRIGGER IF NOT EXISTS foods_ad AFTER DELETE ON foods BEGIN
        INSERT INTO foods_fts(foods_fts, rowid, name_normalized) VALUES ('delete', old.rowid, old.name_normalized);
      END;
      CREATE TRIGGER IF NOT EXISTS foods_au AFTER UPDATE OF name_normalized ON foods BEGIN
        INSERT INTO foods_fts(foods_fts, rowid, name_normalized) VALUES ('delete', old.rowid, old.name_normalized);
        INSERT INTO foods_fts(rowid, name_normalized) VALUES (new.rowid, new.name_normalized);
      END;
    `);
  } catch (err) {
    console.warn('FTS5 virtual table setup skipped or not supported in current environment:', err);
  }

  // Seed default Vietnamese foods (converted to per 100g) and food_servings
  const foodCount = await db.getFirstAsync<{ count: number }>(
    "SELECT count(*) as count FROM foods WHERE source = 'seed'"
  );
  if (!foodCount || foodCount.count === 0) {
    const nowMs = Date.now();
    for (const food of VIETNAMESE_FOODS_DATA) {
      const foodId = food.id.startsWith('food_')
        ? food.id
        : `food_${food.id.replace(/-/g, '_')}`;
      const weight = food.servingWeightGrams || 100;
      const cal100g = Math.round(((food.calories * 100) / weight) * 10) / 10;
      const protein100g = Math.round(((food.protein * 100) / weight) * 10) / 10;
      const carbs100g = Math.round(((food.carbs * 100) / weight) * 10) / 10;
      const fat100g = Math.round(((food.fat * 100) / weight) * 10) / 10;
      const categoryCode = mapCategoryCode(food.category);
      const normalizedName = normalizeVietnameseText(food.name);

      await db.runAsync(
        `INSERT OR REPLACE INTO foods (
          id, source, created_by, name, name_en, name_normalized, category_code,
          ai_class_label, barcode, calories_100g, protein_100g, carbs_100g, fat_100g,
          fiber_100g, sugar_100g, sodium_mg_100g, seed_version, created_at, updated_at,
          deleted_at, synced, sync_attempts, sync_error
        ) VALUES (?, 'seed', NULL, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 0, 0, 0, 1, ?, ?, NULL, 1, 0, NULL)`,
        [
          foodId,
          food.name,
          food.nameEn || '',
          normalizedName,
          categoryCode,
          food.name, // ai_class_label
          cal100g,
          protein100g,
          carbs100g,
          fat100g,
          nowMs,
          nowMs,
        ]
      );

      // Seed default serving
      await db.runAsync(
        `INSERT OR REPLACE INTO food_servings (
          id, food_id, label, grams, is_default, sort_order, created_at, updated_at,
          deleted_at, synced, sync_attempts, sync_error
        ) VALUES (?, ?, ?, ?, 1, 1, ?, ?, NULL, 1, 0, NULL)`,
        [
          `serving_${foodId}_default`,
          foodId,
          food.servingUnit,
          food.servingWeightGrams,
          nowMs,
          nowMs,
        ]
      );

      // Seed standard 100g serving
      await db.runAsync(
        `INSERT OR REPLACE INTO food_servings (
          id, food_id, label, grams, is_default, sort_order, created_at, updated_at,
          deleted_at, synced, sync_attempts, sync_error
        ) VALUES (?, ?, '100g', 100, 0, 2, ?, ?, NULL, 1, 0, NULL)`,
        [
          `serving_${foodId}_100g`,
          foodId,
          nowMs,
          nowMs,
        ]
      );
    }
  }

  // Seed default guest user and nutrition goals if empty
  const userCount = await db.getFirstAsync<{ count: number }>(
    'SELECT count(*) as count FROM user_profiles'
  );
  if (!userCount || userCount.count === 0) {
    const nowMs = Date.now();
    const guestIds = [
      'guest_user_id',
      'guest_user',
      'default_user',
      '00000000-0000-0000-0000-000000000001',
    ];

    for (const gid of guestIds) {
      await db.runAsync(
        `INSERT OR IGNORE INTO user_profiles (
          id, is_guest, email, name, avatar_url, gender, bmr_basis, birth_year,
          height_cm, start_weight_kg, target_weight_kg, goal_type, activity_level,
          diet_preference, allergies_json, bmr, tdee, is_onboarding_completed,
          theme, language, unit_weight, unit_height, unit_water, timezone, week_starts_on,
          created_at, updated_at, deleted_at, synced, sync_attempts, sync_error
        ) VALUES (?, 1, NULL, 'Khách', NULL, 'male', 'male', 2000, 170, 65, 65, 'maintenance', 'moderate', 'none', '[]', 1600, 2200, 0, 'system', 'vi', 'kg', 'cm', 'ml', 'Asia/Ho_Chi_Minh', 1, ?, ?, NULL, 0, 0, NULL)`,
        [gid, nowMs, nowMs]
      );

      await db.runAsync(
        `INSERT OR IGNORE INTO nutrition_goals (
          id, user_id, effective_from, calories, protein_g, carbs_g, fat_g,
          water_ml, fiber_g, sodium_mg, source, created_at, updated_at,
          deleted_at, synced, sync_attempts, sync_error
        ) VALUES (?, ?, '2026-01-01', ?, ?, ?, ?, ?, 25, 2300, 'auto', ?, ?, NULL, 0, 0, NULL)`,
        [
          `goal_${gid}`,
          gid,
          DEFAULT_GOALS.calories,
          DEFAULT_GOALS.protein,
          DEFAULT_GOALS.carbs,
          DEFAULT_GOALS.fat,
          DEFAULT_GOALS.waterMl,
          nowMs,
          nowMs,
        ]
      );
    }
  }
}
