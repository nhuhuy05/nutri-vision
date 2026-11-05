import { getDatabase } from './db/connection';
import { GoalDTO } from '../../dto/GoalDTO';

export class GoalLocalDataSource {
  async getGoals(userId: string): Promise<GoalDTO | null> {
    const db = await getDatabase();
    return db.getFirstAsync<GoalDTO>(
      'SELECT * FROM goals WHERE user_id = ? LIMIT 1',
      [userId]
    );
  }

  async saveGoals(dto: GoalDTO): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO goals (user_id, calories, protein, carbs, fat, water_ml, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.user_id,
        dto.calories,
        dto.protein,
        dto.carbs,
        dto.fat,
        dto.water_ml,
        dto.updated_at,
      ]
    );
  }
}
