import { eq, desc } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { GoalDTO } from '../../dto/GoalDTO';

export class GoalLocalDataSource {
  async getGoals(userId: string): Promise<GoalDTO | null> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        user_id: schema.nutritionGoals.userId,
        calories: schema.nutritionGoals.calories,
        protein: schema.nutritionGoals.proteinG,
        carbs: schema.nutritionGoals.carbsG,
        fat: schema.nutritionGoals.fatG,
        water_ml: schema.nutritionGoals.waterMl,
        updated_at: schema.nutritionGoals.updatedAt,
      })
      .from(schema.nutritionGoals)
      .where(eq(schema.nutritionGoals.userId, userId))
      .orderBy(desc(schema.nutritionGoals.effectiveFrom))
      .limit(1);

    const goal = rows[0];
    if (!goal) return null;

    return {
      user_id: goal.user_id,
      calories: goal.calories,
      protein: goal.protein,
      carbs: goal.carbs,
      fat: goal.fat,
      water_ml: goal.water_ml,
      updated_at: new Date(goal.updated_at).toISOString(),
    };
  }

  async saveGoals(dto: GoalDTO): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    // Đảm bảo user_profiles có bản ghi cho user_id này (loại bỏ hoàn toàn rủi ro Foreign Key)
    await db
      .insert(schema.userProfiles)
      .values({
        id: dto.user_id,
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
        id: `goal_${dto.user_id}_${today}`,
        userId: dto.user_id,
        effectiveFrom: today,
        calories: dto.calories,
        proteinG: dto.protein,
        carbsG: dto.carbs,
        fatG: dto.fat,
        waterMl: dto.water_ml,
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
          calories: dto.calories,
          proteinG: dto.protein,
          carbsG: dto.carbs,
          fatG: dto.fat,
          waterMl: dto.water_ml,
          updatedAt: nowMs,
          synced: 0,
        },
      });
  }
}
