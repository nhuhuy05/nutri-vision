import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  real,
  integer,
  index,
  uniqueIndex,
  primaryKey,
  check,
} from 'drizzle-orm/sqlite-core';

// =====================================================================
// 1. user_profiles  [SYNC] (Thông tin cá nhân, thể trạng & Cài đặt ứng dụng)
// =====================================================================
export const userProfiles = sqliteTable(
  'user_profiles',
  {
    id: text('id').primaryKey(), // auth.users.id; guest: UUID local, is_guest = 1
    isGuest: integer('is_guest').notNull().default(0),
    email: text('email'),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    gender: text('gender'), // 'male' | 'female' | 'other'
    bmrBasis: text('bmr_basis').notNull().default('male'), // 'male' | 'female' | 'average'
    birthYear: integer('birth_year'),
    heightCm: real('height_cm'),
    startWeightKg: real('start_weight_kg'), // Cân nặng khởi điểm onboarding
    targetWeightKg: real('target_weight_kg'),
    goalType: text('goal_type'), // 'fat_loss' | 'maintenance' | 'muscle_gain'
    activityLevel: text('activity_level'), // 'sedentary' | 'light' | 'moderate' | 'very_active'
    dietPreference: text('diet_preference').notNull().default('none'), // 'none' | 'vegetarian' | 'vegan' | 'keto' | 'low_carb'
    allergiesJson: text('allergies_json').notNull().default('[]'),
    bmr: real('bmr'),
    tdee: real('tdee'),
    isOnboardingCompleted: integer('is_onboarding_completed').notNull().default(0),

    // User settings tích hợp trực tiếp
    theme: text('theme').notNull().default('system'), // 'system' | 'light' | 'dark'
    language: text('language').notNull().default('vi'),
    unitWeight: text('unit_weight').notNull().default('kg'), // 'kg' | 'lb'
    unitHeight: text('unit_height').notNull().default('cm'), // 'cm' | 'ft'
    unitWater: text('unit_water').notNull().default('ml'), // 'ml' | 'oz'
    timezone: text('timezone').notNull().default('Asia/Ho_Chi_Minh'),
    weekStartsOn: integer('week_starts_on').notNull().default(1), // 0 = CN, 1 = T2

    // Metadata đồng bộ
    createdAt: integer('created_at').notNull(), // epoch ms
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_user_profiles_email').on(table.email),
    check('user_profiles_is_guest_check', sql`is_guest IN (0, 1)`),
    check('user_profiles_gender_check', sql`gender IS NULL OR gender IN ('male', 'female', 'other')`),
    check('user_profiles_bmr_basis_check', sql`bmr_basis IN ('male', 'female', 'average')`),
    check('user_profiles_birth_year_check', sql`birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)`),
    check('user_profiles_height_cm_check', sql`height_cm IS NULL OR height_cm > 0`),
    check('user_profiles_start_weight_kg_check', sql`start_weight_kg IS NULL OR start_weight_kg > 0`),
    check('user_profiles_target_weight_kg_check', sql`target_weight_kg IS NULL OR target_weight_kg > 0`),
    check('user_profiles_goal_type_check', sql`goal_type IS NULL OR goal_type IN ('fat_loss', 'maintenance', 'muscle_gain')`),
    check('user_profiles_activity_level_check', sql`activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'very_active')`),
    check('user_profiles_diet_preference_check', sql`diet_preference IN ('none', 'vegetarian', 'vegan', 'keto', 'low_carb')`),
    check('user_profiles_theme_check', sql`theme IN ('system', 'light', 'dark')`),
    check('user_profiles_unit_weight_check', sql`unit_weight IN ('kg', 'lb')`),
    check('user_profiles_unit_height_check', sql`unit_height IN ('cm', 'ft')`),
    check('user_profiles_unit_water_check', sql`unit_water IN ('ml', 'oz')`),
    check('user_profiles_week_starts_on_check', sql`week_starts_on IN (0, 1)`),
    check('user_profiles_onboarding_completed_check', sql`is_onboarding_completed IN (0, 1)`),
    check('user_profiles_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 2. nutrition_goals  [SYNC] (Lịch sử mục tiêu dinh dưỡng theo thời gian)
// =====================================================================
export const nutritionGoals = sqliteTable(
  'nutrition_goals',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    effectiveFrom: text('effective_from').notNull(), // 'YYYY-MM-DD'
    calories: real('calories').notNull(),
    proteinG: real('protein_g').notNull(),
    carbsG: real('carbs_g').notNull(),
    fatG: real('fat_g').notNull(),
    waterMl: real('water_ml').notNull().default(2000),
    fiberG: real('fiber_g').notNull().default(25),
    sodiumMg: real('sodium_mg').notNull().default(2300),
    source: text('source').notNull().default('auto'), // 'auto' | 'manual'
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_goals_user_eff').on(table.userId, table.effectiveFrom),
    check('nutrition_goals_cal_check', sql`calories > 0`),
    check('nutrition_goals_source_check', sql`source IN ('auto', 'manual')`),
    check('nutrition_goals_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 3. foods  [SYNC chỉ với source <> 'seed'] (Dinh dưỡng tính trên 100g)
// =====================================================================
export const foods = sqliteTable(
  'foods',
  {
    id: text('id').primaryKey(),
    source: text('source').notNull(), // 'seed' | 'user' | 'barcode' | 'ai'
    createdBy: text('created_by').references(() => userProfiles.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }), // NULL nếu seed
    name: text('name').notNull(),
    nameEn: text('name_en'),
    nameNormalized: text('name_normalized').notNull(), // bỏ dấu + lowercase phục vụ tìm kiếm
    categoryCode: text('category_code').notNull().default('main_dish'), // 'soup' | 'main_dish' | 'rice' | 'snack' | 'vegetable' | 'dessert' | 'drink'
    aiClassLabel: text('ai_class_label'),
    barcode: text('barcode'),
    calories100g: real('calories_100g').notNull(),
    protein100g: real('protein_100g').notNull().default(0),
    carbs100g: real('carbs_100g').notNull().default(0),
    fat100g: real('fat_100g').notNull().default(0),
    fiber100g: real('fiber_100g').notNull().default(0),
    sugar100g: real('sugar_100g').notNull().default(0),
    sodiumMg100g: real('sodium_mg_100g').notNull().default(0),
    seedVersion: integer('seed_version'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_foods_barcode').on(table.barcode),
    index('idx_foods_ai_label').on(table.aiClassLabel),
    index('idx_foods_category').on(table.categoryCode),
    index('idx_foods_creator').on(table.createdBy),
    index('idx_foods_unsynced').on(table.id).where(sql`synced = 0`),
    index('idx_foods_normalized').on(table.nameNormalized),
    check('foods_source_check', sql`source IN ('seed', 'user', 'barcode', 'ai')`),
    check('foods_cal_check', sql`calories_100g >= 0`),
    check('foods_synced_check', sql`synced IN (0, 1)`),
    check(
      'foods_source_creator_check',
      sql`(source = 'seed' AND created_by IS NULL) OR (source <> 'seed' AND created_by IS NOT NULL)`
    ),
  ]
);

// =====================================================================
// 4. food_servings  [SYNC chỉ với món của user] (Nhiều khẩu phần cho 1 món)
// =====================================================================
export const foodServings = sqliteTable(
  'food_servings',
  {
    id: text('id').primaryKey(),
    foodId: text('food_id')
      .notNull()
      .references(() => foods.id, { onDelete: 'cascade' }),
    label: text('label').notNull(), // '1 bát', '1 đĩa', '100g'
    grams: real('grams').notNull(),
    isDefault: integer('is_default').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_servings_food').on(table.foodId),
    uniqueIndex('uq_servings_default').on(table.foodId).where(sql`is_default = 1 AND deleted_at IS NULL`),
    check('servings_grams_check', sql`grams > 0`),
    check('servings_is_default_check', sql`is_default IN (0, 1)`),
    check('servings_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 5. favorite_foods  [SYNC] (Món ăn yêu thích)
// =====================================================================
export const favoriteFoods = sqliteTable(
  'favorite_foods',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    foodId: text('food_id')
      .notNull()
      .references(() => foods.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.foodId] }),
    check('favorite_foods_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 6. ai_scan_history  [SYNC] (Lịch sử scan camera AI + Top-K gợi ý json)
// =====================================================================
export const aiScanHistory = sqliteTable(
  'ai_scan_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    imageUri: text('image_uri').notNull(),
    imageRemotePath: text('image_remote_path'),
    engine: text('engine').notNull(), // 'tflite' | 'mlkit' | 'cloud_llm'
    modelVersion: text('model_version').notNull(),
    labelsVersion: text('labels_version'),
    predictedLabel: text('predicted_label'),
    predictedFoodId: text('predicted_food_id').references(() => foods.id),
    confidenceScore: real('confidence_score'),
    candidatesJson: text('candidates_json'), // JSON array: [{ rank: 1, label: '...', confidence: 0.95 }, ...]
    inferenceMs: integer('inference_ms'),
    confirmedFoodId: text('confirmed_food_id').references(() => foods.id),
    isUserCorrected: integer('is_user_corrected').notNull().default(0),
    status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'discarded' | 'failed'
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_scan_user_time').on(table.userId, table.createdAt),
    index('idx_scan_model').on(table.modelVersion, table.status),
    check('scan_engine_check', sql`engine IN ('tflite', 'mlkit', 'cloud_llm')`),
    check('scan_conf_check', sql`confidence_score IS NULL OR (confidence_score BETWEEN 0 AND 1)`),
    check('scan_user_corrected_check', sql`is_user_corrected IN (0, 1)`),
    check('scan_status_check', sql`status IN ('pending', 'confirmed', 'discarded', 'failed')`),
    check('scan_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 7. meals  [SYNC] (Bữa ăn: giờ ăn, ảnh, phân loại)
// =====================================================================
export const meals = sqliteTable(
  'meals',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    date: text('date').notNull(), // 'YYYY-MM-DD'
    loggedAt: integer('logged_at').notNull(), // epoch ms
    mealType: text('meal_type').notNull(), // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    note: text('note'),
    photoUri: text('photo_uri'),
    photoRemotePath: text('photo_remote_path'),
    loggedVia: text('logged_via').notNull().default('manual'), // 'manual' | 'ai_camera' | 'barcode' | 'template'
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_meals_user_date').on(table.userId, table.date).where(sql`deleted_at IS NULL`),
    index('idx_meals_unsynced').on(table.id).where(sql`synced = 0`),
    check('meals_type_check', sql`meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')`),
    check('meals_logged_via_check', sql`logged_via IN ('manual', 'ai_camera', 'barcode', 'template')`),
    check('meals_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 8. meal_items  [SYNC] (Snapshot dinh dưỡng từng món trong bữa ăn)
// =====================================================================
export const mealItems = sqliteTable(
  'meal_items',
  {
    id: text('id').primaryKey(),
    mealId: text('meal_id')
      .notNull()
      .references(() => meals.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    foodId: text('food_id').references(() => foods.id, { onDelete: 'set null' }),
    foodName: text('food_name').notNull(),
    servingLabel: text('serving_label'),
    servingQty: real('serving_qty'),
    weightGrams: real('weight_grams').notNull(),
    calories: real('calories').notNull(),
    protein: real('protein').notNull().default(0),
    carbs: real('carbs').notNull().default(0),
    fat: real('fat').notNull().default(0),
    fiber: real('fiber').notNull().default(0),
    sugar: real('sugar').notNull().default(0),
    sodiumMg: real('sodium_mg').notNull().default(0),
    aiScanId: text('ai_scan_id').references(() => aiScanHistory.id, { onDelete: 'set null' }),
    aiConfidence: real('ai_confidence'),
    isUserEdited: integer('is_user_edited').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_items_meal').on(table.mealId).where(sql`deleted_at IS NULL`),
    index('idx_items_food').on(table.userId, table.foodId),
    index('idx_items_unsync').on(table.id).where(sql`synced = 0`),
    check('meal_items_weight_check', sql`weight_grams > 0`),
    check('meal_items_user_edited_check', sql`is_user_edited IN (0, 1)`),
    check('meal_items_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 9. water_logs  [SYNC] (Theo dõi uống nước)
// =====================================================================
export const waterLogs = sqliteTable(
  'water_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    date: text('date').notNull(), // 'YYYY-MM-DD'
    amountMl: integer('amount_ml').notNull(),
    recordedAt: integer('recorded_at').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    index('idx_water_user_date').on(table.userId, table.date).where(sql`deleted_at IS NULL`),
    check('water_logs_amount_check', sql`amount_ml > 0`),
    check('water_logs_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 10. weight_logs  [SYNC] (Theo dõi cân nặng & mỡ)
// =====================================================================
export const weightLogs = sqliteTable(
  'weight_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    recordedDate: text('recorded_date').notNull(),
    weightKg: real('weight_kg').notNull(),
    bodyFatPercentage: real('body_fat_percentage'),
    note: text('note'),
    photoUri: text('photo_uri'),
    photoRemotePath: text('photo_remote_path'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
    synced: integer('synced').notNull().default(0),
    syncAttempts: integer('sync_attempts').notNull().default(0),
    syncError: text('sync_error'),
  },
  (table) => [
    uniqueIndex('uq_weight_user_date').on(table.userId, table.recordedDate).where(sql`deleted_at IS NULL`),
    check('weight_logs_kg_check', sql`weight_kg > 0`),
    check('weight_logs_body_fat_check', sql`body_fat_percentage IS NULL OR (body_fat_percentage BETWEEN 0 AND 100)`),
    check('weight_logs_synced_check', sql`synced IN (0, 1)`),
  ]
);

// =====================================================================
// 11. sync_meta  [LOCAL ONLY] (Quản lý cursor đồng bộ)
// =====================================================================
export const syncMeta = sqliteTable('sync_meta', {
  key: text('key').primaryKey(), // 'device_id', 'pull_cursor:meals', 'pull_cursor:foods', 'seed_version'
  value: text('value').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// =====================================================================
// TYPE INFERENCES & EXPORTS
// =====================================================================
export type UserProfileSelect = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;

export type NutritionGoalSelect = typeof nutritionGoals.$inferSelect;
export type NutritionGoalInsert = typeof nutritionGoals.$inferInsert;

export type FoodSelect = typeof foods.$inferSelect;
export type FoodInsert = typeof foods.$inferInsert;

export type FoodServingSelect = typeof foodServings.$inferSelect;
export type FoodServingInsert = typeof foodServings.$inferInsert;

export type FavoriteFoodSelect = typeof favoriteFoods.$inferSelect;
export type FavoriteFoodInsert = typeof favoriteFoods.$inferInsert;

export type AiScanHistorySelect = typeof aiScanHistory.$inferSelect;
export type AiScanHistoryInsert = typeof aiScanHistory.$inferInsert;

export type MealSelect = typeof meals.$inferSelect;
export type MealInsert = typeof meals.$inferInsert;

export type MealItemSelect = typeof mealItems.$inferSelect;
export type MealItemInsert = typeof mealItems.$inferInsert;

export type WaterLogSelect = typeof waterLogs.$inferSelect;
export type WaterLogInsert = typeof waterLogs.$inferInsert;

export type WeightLogSelect = typeof weightLogs.$inferSelect;
export type WeightLogInsert = typeof weightLogs.$inferInsert;

export type SyncMetaSelect = typeof syncMeta.$inferSelect;
export type SyncMetaInsert = typeof syncMeta.$inferInsert;

// Legacy compatibility aliases
export type GoalSelect = NutritionGoalSelect;
export type GoalInsert = NutritionGoalInsert;
export type MealLogSelect = MealItemSelect;
export type MealLogInsert = MealItemInsert;
