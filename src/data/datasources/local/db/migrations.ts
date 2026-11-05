import * as SQLite from 'expo-sqlite';
import { VIETNAMESE_FOODS_DATA } from '../seed/vietnameseFoods';
import { DEFAULT_GOALS } from '../../../../domain/constants/defaultGoals';

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      name_en TEXT,
      category TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      serving_unit TEXT NOT NULL,
      serving_weight_grams REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meal_logs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      portion_multiplier REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      photo_uri TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      deleted_at TEXT,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS goals (
      user_id TEXT PRIMARY KEY NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      water_ml REAL NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default Vietnamese foods if table is empty
  const countResult = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM foods');
  if (!countResult || countResult.count === 0) {
    for (const food of VIETNAMESE_FOODS_DATA) {
      await db.runAsync(
        `INSERT OR REPLACE INTO foods (id, name, name_en, category, calories, protein, carbs, fat, serving_unit, serving_weight_grams)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          food.id,
          food.name,
          food.nameEn || '',
          food.category,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          food.servingUnit,
          food.servingWeightGrams,
        ]
      );
    }
  }

  // Seed default goals if empty
  const goalCount = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM goals');
  if (!goalCount || goalCount.count === 0) {
    await db.runAsync(
      `INSERT OR REPLACE INTO goals (user_id, calories, protein, carbs, fat, water_ml, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'default_user',
        DEFAULT_GOALS.calories,
        DEFAULT_GOALS.protein,
        DEFAULT_GOALS.carbs,
        DEFAULT_GOALS.fat,
        DEFAULT_GOALS.waterMl,
        new Date().toISOString(),
      ]
    );
  }
}
