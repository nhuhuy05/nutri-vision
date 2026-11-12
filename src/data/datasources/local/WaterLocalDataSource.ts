import { eq, and, sql, isNull } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { GUEST_USER_ID } from '../../../domain/constants/defaultGoals';

export class WaterLocalDataSource {
  async getDailyWater(userId: string, date: string): Promise<number> {
    const db = await getDrizzleDb();
    const targetUserId = userId || GUEST_USER_ID;

    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${schema.waterLogs.amountMl}), 0)`,
      })
      .from(schema.waterLogs)
      .where(
        and(
          eq(schema.waterLogs.userId, targetUserId),
          eq(schema.waterLogs.date, date),
          isNull(schema.waterLogs.deletedAt)
        )
      );

    return result[0]?.total ?? 0;
  }

  async logWater(userId: string, date: string, amountMl: number): Promise<number> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const targetUserId = userId || GUEST_USER_ID;

    // Đảm bảo user profile tồn tại trong SQLite để thỏa mãn khóa ngoại
    await db
      .insert(schema.userProfiles)
      .values({
        id: targetUserId,
        isGuest: targetUserId === GUEST_USER_ID ? 1 : 0,
        name: targetUserId === GUEST_USER_ID ? 'Khách' : 'Người dùng NutriVision',
        createdAt: nowMs,
        updatedAt: nowMs,
      })
      .onConflictDoNothing();

    const id = `water_${targetUserId}_${date}_${nowMs}_${Math.random().toString(36).slice(2, 6)}`;

    await db.insert(schema.waterLogs).values({
      id,
      userId: targetUserId,
      date,
      amountMl,
      recordedAt: nowMs,
      createdAt: nowMs,
      updatedAt: nowMs,
      deletedAt: null,
      synced: 0,
      syncAttempts: 0,
      syncError: null,
    });

    return this.getDailyWater(targetUserId, date);
  }

  async resetDailyWater(userId: string, date: string): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const targetUserId = userId || GUEST_USER_ID;

    await db
      .update(schema.waterLogs)
      .set({
        deletedAt: nowMs,
        updatedAt: nowMs,
        synced: 0,
      })
      .where(
        and(
          eq(schema.waterLogs.userId, targetUserId),
          eq(schema.waterLogs.date, date),
          isNull(schema.waterLogs.deletedAt)
        )
      );
  }
}

