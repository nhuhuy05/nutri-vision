import { eq, desc } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { NutritionGoalRow, NutritionGoalInsertData } from '../../dto/local';

export class GoalLocalDataSource {
  async getGoals(userId: string): Promise<NutritionGoalRow | null> {
    const db = await getDrizzleDb();
    const rows = await db
      .select()
      .from(schema.nutritionGoals)
      .where(eq(schema.nutritionGoals.userId, userId))
      .orderBy(desc(schema.nutritionGoals.effectiveFrom))
      .limit(1);

    return rows[0] || null;
  }

  async saveGoals(userId: string, data: NutritionGoalInsertData): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    // Đảm bảo user_profiles có bản ghi cho user_id này (loại bỏ hoàn toàn rủi ro Foreign Key)
    await db
      .insert(schema.userProfiles)
      .values({
        id: userId,
        isGuest: 1,
        name: 'Khách',
        createdAt: nowMs,
        updatedAt: nowMs,
      })
      .onConflictDoNothing();

    // Lưu mục tiêu dinh dưỡng
    await db
      .insert(schema.nutritionGoals)
      .values({
        id: `goal_${userId}_${today}`,
        userId: userId,
        effectiveFrom: today,
        calories: data.calories,
        proteinG: data.protein,
        carbsG: data.carbs,
        fatG: data.fat,
        waterMl: data.waterMl,
        fiberG: 25,
        sodiumMg: 2300,
        source: 'manual',
        createdAt: nowMs,
        updatedAt: nowMs,
        synced: 0,
      })
      .onConflictDoUpdate({
        target: schema.nutritionGoals.id,
        set: {
          calories: data.calories,
          proteinG: data.protein,
          carbsG: data.carbs,
          fatG: data.fat,
          waterMl: data.waterMl,
          updatedAt: nowMs,
          synced: 0,
        },
      });
  }
}
