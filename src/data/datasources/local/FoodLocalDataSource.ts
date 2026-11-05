import { getDatabase } from './db/connection';
import { FoodDTO } from '../../dto/FoodDTO';

export class FoodLocalDataSource {
  async getAllFoods(): Promise<FoodDTO[]> {
    const db = await getDatabase();
    return db.getAllAsync<FoodDTO>('SELECT * FROM foods ORDER BY name ASC');
  }

  async searchFoods(query: string): Promise<FoodDTO[]> {
    const db = await getDatabase();
    const formatted = `%${query.trim().toLowerCase()}%`;
    return db.getAllAsync<FoodDTO>(
      'SELECT * FROM foods WHERE LOWER(name) LIKE ? OR LOWER(name_en) LIKE ? OR LOWER(category) LIKE ? ORDER BY name ASC',
      [formatted, formatted, formatted]
    );
  }

  async getFoodById(id: string): Promise<FoodDTO | null> {
    const db = await getDatabase();
    return db.getFirstAsync<FoodDTO>('SELECT * FROM foods WHERE id = ?', [id]);
  }
}
