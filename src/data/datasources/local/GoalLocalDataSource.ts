import { eq, desc } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { NutritionGoalRow, NutritionGoalInsertData } from '../../dto/local';
import { GUEST_USER_ID } from '../../../domain/constants/defaultGoals';

function getLocalDateString(nowMs: number): string {
  const tzOffsetMs = new Date().getTimezoneOffset() * 60000;
  return new Date(nowMs - tzOffsetMs).toISOString().slice(0, 10);
}

export class GoalLocalDataSource {
  async getGoals(userId: string): Promise<NutritionGoalRow | null> {
    const db = await getDrizzleDb();
    const targetUserId = userId || GUEST_USER_ID;
    const rows = await db
      .select()
      .from(schema.nutritionGoals)
      .where(eq(schema.nutritionGoals.userId, targetUserId))
      .orderBy(desc(schema.nutritionGoals.effectiveFrom))
      .limit(1);

    return rows[0] || null;
  }

  async saveGoals(userId: string, data: NutritionGoalInsertData): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const targetUserId = userId || GUEST_USER_ID;
    const today = getLocalDateString(nowMs);

    await db.transaction(async (tx) => {
      await tx
        .insert(schema.userProfiles)
        .values({
          id: targetUserId,
          isGuest: targetUserId === GUEST_USER_ID ? 1 : 0,
          name: targetUserId === GUEST_USER_ID ? 'Khách' : 'Người dùng NutriVision',
          createdAt: nowMs,
          updatedAt: nowMs,
        })
        .onConflictDoNothing();

      await tx
        .insert(schema.nutritionGoals)
        .values({
          id: `goal_${targetUserId}_${today}`,
          userId: targetUserId,
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
    });
  }
}
