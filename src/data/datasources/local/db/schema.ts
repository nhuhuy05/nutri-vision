import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';

export const foods = sqliteTable(
  'foods',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    nameEn: text('name_en'),
    category: text('category').notNull(),
    calories: real('calories').notNull(),
    protein: real('protein').notNull(),
    carbs: real('carbs').notNull(),
    fat: real('fat').notNull(),
    servingUnit: text('serving_unit').notNull(),
    servingWeightGrams: real('serving_weight_grams').notNull(),
    isCustom: integer('is_custom').notNull().default(0),
    createdBy: text('created_by'),
  },
  (table) => [
    index('idx_foods_name').on(table.name),
    index('idx_foods_category').on(table.category),
  ]
);

export const mealLogs = sqliteTable(
  'meal_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    date: text('date').notNull(),
    mealType: text('meal_type').notNull(),
    foodId: text('food_id').notNull(),
    foodName: text('food_name').notNull(),
    portionMultiplier: real('portion_multiplier').notNull(),
    calories: real('calories').notNull(),
    protein: real('protein').notNull(),
    carbs: real('carbs').notNull(),
    fat: real('fat').notNull(),
    photoUri: text('photo_uri'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
    synced: integer('synced').notNull().default(0),
  },
  (table) => [
    index('idx_meal_logs_date').on(table.date),
    index('idx_meal_logs_user_date').on(table.userId, table.date),
    index('idx_meal_logs_synced').on(table.synced),
  ]
);

export const goals = sqliteTable('goals', {
  userId: text('user_id').primaryKey(),
  calories: real('calories').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
  waterMl: real('water_ml').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  gender: text('gender'),
  birthYear: integer('birth_year'),
  heightCm: real('height_cm'),
  currentWeightKg: real('current_weight_kg'),
  targetWeightKg: real('target_weight_kg'),
  activityLevel: text('activity_level'),
  dietPreference: text('diet_preference'),
  bmr: real('bmr'),
  tdee: real('tdee'),
  avatarUrl: text('avatar_url'),
  updatedAt: text('updated_at').notNull(),
});

export const weightLogs = sqliteTable(
  'weight_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    weightKg: real('weight_kg').notNull(),
    recordedAt: text('recorded_at').notNull(),
    note: text('note'),
    synced: integer('synced').notNull().default(0),
  },
  (table) => [
    index('idx_weight_logs_user_date').on(table.userId, table.recordedAt),
  ]
);

export const syncMeta = sqliteTable('sync_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export type FoodSelect = typeof foods.$inferSelect;
export type FoodInsert = typeof foods.$inferInsert;
export type MealLogSelect = typeof mealLogs.$inferSelect;
export type MealLogInsert = typeof mealLogs.$inferInsert;
export type GoalSelect = typeof goals.$inferSelect;
export type GoalInsert = typeof goals.$inferInsert;
export type UserProfileSelect = typeof userProfiles.$inferSelect;
export type UserProfileInsert = typeof userProfiles.$inferInsert;
export type WeightLogSelect = typeof weightLogs.$inferSelect;
export type WeightLogInsert = typeof weightLogs.$inferInsert;
export type SyncMetaSelect = typeof syncMeta.$inferSelect;
export type SyncMetaInsert = typeof syncMeta.$inferInsert;

