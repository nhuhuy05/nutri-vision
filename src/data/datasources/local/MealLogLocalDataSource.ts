import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { MealLogRow, MealLogInsertData } from '../../dto/local';

export class MealLogLocalDataSource {
  async insertOrUpdate(data: MealLogInsertData): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const mealId = `meal_${data.id}`;
    const syncedNum = data.synced ? 1 : 0;

    // 1. Đảm bảo user_profiles luôn tồn tại (loại bỏ hoàn toàn rủi ro Foreign Key)
    await db
      .insert(schema.userProfiles)
      .values({
        id: data.userId,
        isGuest: 1,
        name: 'Khách',
        createdAt: nowMs,
        updatedAt: nowMs,
      })
      .onConflictDoNothing();

    // 2. Insert/Update bảng bữa ăn (meals)
    await db
      .insert(schema.meals)
      .values({
        id: mealId,
        userId: data.userId,
        date: data.date,
        loggedAt: nowMs,
        mealType: data.mealType as any,
        photoUri: data.photoUri ?? null,
        loggedVia: 'manual',
        createdAt: nowMs,
        updatedAt: nowMs,
        deletedAt: null,
        synced: syncedNum,
      })
      .onConflictDoUpdate({
        target: schema.meals.id,
        set: {
          mealType: data.mealType as any,
          photoUri: data.photoUri ?? null,
          updatedAt: nowMs,
          deletedAt: null,
          synced: syncedNum,
        },
      });

    // 3. Insert/Update snapshot món ăn (meal_items)
    await db
      .insert(schema.mealItems)
      .values({
        id: data.id,
        mealId: mealId,
        userId: data.userId,
        foodId: data.foodId || null,
        foodName: data.foodName,
        servingLabel: '1 khẩu phần',
        servingQty: data.portionMultiplier,
        weightGrams: 100,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: 0,
        sugar: 0,
        sodiumMg: 0,
        createdAt: nowMs,
        updatedAt: nowMs,
        deletedAt: null,
        synced: syncedNum,
      })
      .onConflictDoUpdate({
        target: schema.mealItems.id,
        set: {
          foodName: data.foodName,
          servingQty: data.portionMultiplier,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          updatedAt: nowMs,
          deletedAt: null,
          synced: syncedNum,
        },
      });
  }

  async getByDate(date: string): Promise<MealLogRow[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: schema.mealItems.id,
        userId: schema.meals.userId,
        date: schema.meals.date,
        mealType: schema.meals.mealType,
        foodId: sql<string>`COALESCE(${schema.mealItems.foodId}, '')`,
        foodName: schema.mealItems.foodName,
        portionMultiplier: sql<number>`COALESCE(${schema.mealItems.servingQty}, 1.0)`,
        calories: schema.mealItems.calories,
        protein: schema.mealItems.protein,
        carbs: schema.mealItems.carbs,
        fat: schema.mealItems.fat,
        photoUri: schema.meals.photoUri,
        createdAt: schema.mealItems.createdAt,
        updatedAt: schema.mealItems.updatedAt,
        synced: schema.mealItems.synced,
      })
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(
        and(
          eq(schema.meals.date, date),
          isNull(schema.mealItems.deletedAt)
        )
      )
      .orderBy(asc(schema.mealItems.createdAt));

    return rows;
  }

  async getAll(): Promise<MealLogRow[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: schema.mealItems.id,
        userId: schema.meals.userId,
        date: schema.meals.date,
        mealType: schema.meals.mealType,
        foodId: sql<string>`COALESCE(${schema.mealItems.foodId}, '')`,
        foodName: schema.mealItems.foodName,
        portionMultiplier: sql<number>`COALESCE(${schema.mealItems.servingQty}, 1.0)`,
        calories: schema.mealItems.calories,
        protein: schema.mealItems.protein,
        carbs: schema.mealItems.carbs,
        fat: schema.mealItems.fat,
        photoUri: schema.meals.photoUri,
        createdAt: schema.mealItems.createdAt,
        updatedAt: schema.mealItems.updatedAt,
        synced: schema.mealItems.synced,
      })
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(isNull(schema.mealItems.deletedAt))
      .orderBy(desc(schema.meals.date), desc(schema.mealItems.createdAt));

    return rows;
  }

  async softDelete(id: string): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    await db
      .update(schema.mealItems)
      .set({
        deletedAt: nowMs,
        updatedAt: nowMs,
        synced: 0,
      })
      .where(eq(schema.mealItems.id, id));
  }

  async getPendingSync(): Promise<MealLogRow[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: schema.mealItems.id,
        userId: schema.meals.userId,
        date: schema.meals.date,
        mealType: schema.meals.mealType,
        foodId: sql<string>`COALESCE(${schema.mealItems.foodId}, '')`,
        foodName: schema.mealItems.foodName,
        portionMultiplier: sql<number>`COALESCE(${schema.mealItems.servingQty}, 1.0)`,
        calories: schema.mealItems.calories,
        protein: schema.mealItems.protein,
        carbs: schema.mealItems.carbs,
        fat: schema.mealItems.fat,
        photoUri: schema.meals.photoUri,
        createdAt: schema.mealItems.createdAt,
        updatedAt: schema.mealItems.updatedAt,
        synced: schema.mealItems.synced,
      })
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(eq(schema.mealItems.synced, 0));

    return rows;
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDrizzleDb();
    await db
      .update(schema.mealItems)
      .set({ synced: 1 })
      .where(eq(schema.mealItems.id, id));
  }
}
