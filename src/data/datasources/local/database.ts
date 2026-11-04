import * as SQLite from 'expo-sqlite';
import { FoodDTO } from '../../models/FoodDTO';
import { MealLogDTO } from '../../models/MealLogDTO';
import { VIETNAMESE_FOODS_DATA } from './vietnameseFoodsData';

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

export async function queryAllFoods(): Promise<FoodDTO[]> {
  const db = await getDatabase();
  return db.getAllAsync<FoodDTO>('SELECT * FROM foods ORDER BY name ASC');
}

export async function querySearchFoods(keyword: string): Promise<FoodDTO[]> {
  const db = await getDatabase();
  const pattern = `%${keyword.trim().toLowerCase()}%`;
  return db.getAllAsync<FoodDTO>(
    'SELECT * FROM foods WHERE LOWER(name) LIKE ? OR LOWER(name_en) LIKE ? OR LOWER(category) LIKE ?',
    [pattern, pattern, pattern]
  );
}

export async function queryFoodById(id: string): Promise<FoodDTO | null> {
  const db = await getDatabase();
  return db.getFirstAsync<FoodDTO>('SELECT * FROM foods WHERE id = ?', [id]);
}

export async function insertOrReplaceMealLog(dto: MealLogDTO): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO meal_logs 
     (id, user_id, date, meal_type, food_id, food_name, portion_multiplier, calories, protein, carbs, fat, photo_uri, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.id,
      dto.user_id,
      dto.date,
      dto.meal_type,
      dto.food_id,
      dto.food_name,
      dto.portion_multiplier,
      dto.calories,
      dto.protein,
      dto.carbs,
      dto.fat,
      dto.photo_uri || '',
      dto.created_at,
      dto.synced,
    ]
  );
}

export async function queryMealLogsByDate(date: string): Promise<MealLogDTO[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealLogDTO>(
    'SELECT * FROM meal_logs WHERE date = ? ORDER BY created_at ASC',
    [date]
  );
}

export async function deleteMealLogById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [id]);
}

export async function queryPendingSyncMealLogs(): Promise<MealLogDTO[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealLogDTO>('SELECT * FROM meal_logs WHERE synced = 0');
}

export async function updateMealLogSyncedStatus(id: string, synced: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE meal_logs SET synced = ? WHERE id = ?', [synced ? 1 : 0, id]);
}

