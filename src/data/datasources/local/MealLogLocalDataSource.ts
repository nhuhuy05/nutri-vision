import { getDatabase } from './db/connection';
import { MealLogDTO } from '../../dto/MealLogDTO';

export class MealLogLocalDataSource {
  async insertOrUpdate(dto: MealLogDTO): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO meal_logs (
        id, user_id, date, meal_type, food_id, food_name, portion_multiplier,
        calories, protein, carbs, fat, photo_uri, created_at, updated_at, deleted_at, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        dto.photo_uri,
        dto.created_at,
        dto.updated_at,
        dto.deleted_at,
        dto.synced,
      ]
    );
  }

  async getByDate(date: string): Promise<MealLogDTO[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealLogDTO>(
      'SELECT * FROM meal_logs WHERE date = ? AND (deleted_at IS NULL OR deleted_at = "") ORDER BY created_at ASC',
      [date]
    );
  }

  async getAll(): Promise<MealLogDTO[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealLogDTO>(
      'SELECT * FROM meal_logs WHERE (deleted_at IS NULL OR deleted_at = "") ORDER BY date DESC, created_at DESC'
    );
  }

  async softDelete(id: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE meal_logs SET deleted_at = ?, updated_at = ?, synced = 0 WHERE id = ?',
      [now, now, id]
    );
  }

  async getPendingSync(): Promise<MealLogDTO[]> {
    const db = await getDatabase();
    return db.getAllAsync<MealLogDTO>('SELECT * FROM meal_logs WHERE synced = 0');
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE meal_logs SET synced = 1 WHERE id = ?', [id]);
  }
}
