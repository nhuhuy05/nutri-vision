import * as SQLite from 'expo-sqlite';
import { FoodItem, MealLog } from '../types/nutrition';
import { VIETNAMESE_FOODS_DATA } from '../constants/vietnameseFoods';

const DB_NAME = 'nutrivision.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create tables for Foods, Meal Logs, and Sync Queue
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

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
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      operation TEXT NOT NULL,
      entity TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
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
}

export async function getAllFoods(): Promise<FoodItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    name_en: string;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_unit: string;
    serving_weight_grams: number;
  }>('SELECT * FROM foods ORDER BY name ASC');

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    category: r.category,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    servingUnit: r.serving_unit,
    servingWeightGrams: r.serving_weight_grams,
  }));
}

export async function searchFoods(keyword: string): Promise<FoodItem[]> {
  const db = await getDatabase();
  const pattern = `%${keyword.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    name_en: string;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving_unit: string;
    serving_weight_grams: number;
  }>(
    'SELECT * FROM foods WHERE LOWER(name) LIKE ? OR LOWER(name_en) LIKE ? OR LOWER(category) LIKE ?',
    [pattern, pattern, pattern]
  );

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    category: r.category,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    servingUnit: r.serving_unit,
    servingWeightGrams: r.serving_weight_grams,
  }));
}

export async function saveMealLog(log: MealLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO meal_logs 
     (id, user_id, date, meal_type, food_id, food_name, portion_multiplier, calories, protein, carbs, fat, photo_uri, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.id,
      log.userId,
      log.date,
      log.mealType,
      log.foodId,
      log.foodName,
      log.portionMultiplier,
      log.calories,
      log.protein,
      log.carbs,
      log.fat,
      log.photoUri || '',
      log.createdAt,
      log.synced ? 1 : 0,
    ]
  );
}

export async function getMealLogsByDate(date: string): Promise<MealLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    user_id: string;
    date: string;
    meal_type: string;
    food_id: string;
    food_name: string;
    portion_multiplier: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    photo_uri: string;
    created_at: string;
    synced: number;
  }>('SELECT * FROM meal_logs WHERE date = ? ORDER BY created_at ASC', [date]);

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    date: r.date,
    mealType: r.meal_type as any,
    foodId: r.food_id,
    foodName: r.food_name,
    portionMultiplier: r.portion_multiplier,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    photoUri: r.photo_uri || undefined,
    createdAt: r.created_at,
    synced: Boolean(r.synced),
  }));
}

export async function deleteMealLog(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [id]);
}

export async function getPendingSyncLogs(): Promise<MealLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    user_id: string;
    date: string;
    meal_type: string;
    food_id: string;
    food_name: string;
    portion_multiplier: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    photo_uri: string;
    created_at: string;
    synced: number;
  }>('SELECT * FROM meal_logs WHERE synced = 0');

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    date: r.date,
    mealType: r.meal_type as any,
    foodId: r.food_id,
    foodName: r.food_name,
    portionMultiplier: r.portion_multiplier,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    photoUri: r.photo_uri || undefined,
    createdAt: r.created_at,
    synced: false,
  }));
}

export async function markLogAsSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE meal_logs SET synced = 1 WHERE id = ?', [id]);
}

