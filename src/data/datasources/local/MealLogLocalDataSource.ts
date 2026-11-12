import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { MealLogRow, MealLogInsertData } from '../../dto/local';
import { GUEST_USER_ID } from '../../../domain/constants/defaultGoals';

const mealLogProjection = {
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
};

export class MealLogLocalDataSource {
  async insertOrUpdate(data: MealLogInsertData): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const userId = data.userId || GUEST_USER_ID;
    const mealId = `meal_${data.id}`;
    const syncedNum = data.synced ? 1 : 0;
    const multiplier = data.portionMultiplier > 0 ? data.portionMultiplier : 1;
    const weightGrams = Math.max(Math.round(multiplier * 100), 1);

    // 1. Đảm bảo user_profiles tồn tại trước khi ghi khóa ngoại
    await db
      .insert(schema.userProfiles)
      .values({
        id: userId,
        isGuest: userId === GUEST_USER_ID ? 1 : 0,
        name: userId === GUEST_USER_ID ? 'Khách' : 'Người dùng NutriVision',
        createdAt: nowMs,
        updatedAt: nowMs,
      })
      .onConflictDoNothing();

    // 2. Kiểm tra food_id có nằm trong bảng foods hay không để tránh lỗi Foreign Key
    let validFoodId: string | null = null;
    if (data.foodId) {
      const existingFood = await db
        .select({ id: schema.foods.id })
        .from(schema.foods)
        .where(eq(schema.foods.id, data.foodId))
        .limit(1);
      if (existingFood.length > 0) {
        validFoodId = existingFood[0].id;
      }
    }

    // 3. Upsert bảng bữa ăn (meals)
    await db
      .insert(schema.meals)
      .values({
        id: mealId,
        userId,
        date: data.date,
        loggedAt: nowMs,
        mealType: data.mealType,
        photoUri: data.photoUri ?? null,
        loggedVia: data.photoUri ? 'ai_camera' : 'manual',
        createdAt: nowMs,
        updatedAt: nowMs,
        deletedAt: null,
        synced: syncedNum,
      })
      .onConflictDoUpdate({
        target: schema.meals.id,
        set: {
          mealType: data.mealType,
          photoUri: data.photoUri ?? null,
          updatedAt: nowMs,
          deletedAt: null,
          synced: syncedNum,
        },
      });

    // 4. Upsert snapshot món ăn (meal_items)
    await db
      .insert(schema.mealItems)
      .values({
        id: data.id,
        mealId,
        userId,
        foodId: validFoodId,
        foodName: data.foodName,
        servingLabel: '1 khẩu phần',
        servingQty: multiplier,
        weightGrams,
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
          foodId: validFoodId,
          foodName: data.foodName,
          servingQty: multiplier,
          weightGrams,
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
    return db
      .select(mealLogProjection)
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(and(eq(schema.meals.date, date), isNull(schema.mealItems.deletedAt)))
      .orderBy(asc(schema.mealItems.createdAt));
  }

  async getAll(): Promise<MealLogRow[]> {
    const db = await getDrizzleDb();
    return db
      .select(mealLogProjection)
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(isNull(schema.mealItems.deletedAt))
      .orderBy(desc(schema.meals.date), desc(schema.mealItems.createdAt));
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
    return db
      .select(mealLogProjection)
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(eq(schema.mealItems.synced, 0));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDrizzleDb();
    await db
      .update(schema.mealItems)
      .set({ synced: 1 })
      .where(eq(schema.mealItems.id, id));
  }

  async migrateGuestLogs(targetUserId: string): Promise<number> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();

    // 1. Đảm bảo user_profiles của targetUserId đã tồn tại trong SQLite
    await db
      .insert(schema.userProfiles)
      .values({
        id: targetUserId,
        isGuest: 0,
        name: 'Người dùng NutriVision',
        createdAt: nowMs,
        updatedAt: nowMs,
      })
      .onConflictDoNothing();

    // 2. Chuyển tất cả meals của khách sang targetUserId
    await db
      .update(schema.meals)
      .set({
        userId: targetUserId,
        updatedAt: nowMs,
        synced: 0,
      })
      .where(eq(schema.meals.userId, GUEST_USER_ID));

    // 3. Chuyển tất cả meal_items của khách sang targetUserId
    await db
      .update(schema.mealItems)
      .set({
        userId: targetUserId,
        updatedAt: nowMs,
        synced: 0,
      })
      .where(eq(schema.mealItems.userId, GUEST_USER_ID));

    // 4. Chuyển mục tiêu nutrition_goals nếu có
    await db
      .update(schema.nutritionGoals)
      .set({
        userId: targetUserId,
        updatedAt: nowMs,
        synced: 0,
      })
      .where(eq(schema.nutritionGoals.userId, GUEST_USER_ID));

    // 5. Đếm số bản ghi chờ đồng bộ sau khi chuyển
    const pendingItems = await db
      .select({ id: schema.mealItems.id })
      .from(schema.mealItems)
      .where(and(eq(schema.mealItems.userId, targetUserId), eq(schema.mealItems.synced, 0)));

    return pendingItems.length;
  }
}
