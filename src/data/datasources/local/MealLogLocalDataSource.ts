import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { MealLogDTO } from '../../dto/MealLogDTO';

export class MealLogLocalDataSource {
  async insertOrUpdate(dto: MealLogDTO): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const mealId = `meal_${dto.id}`;

    // 1. Đảm bảo user_profiles luôn tồn tại (loại bỏ hoàn toàn rủi ro Foreign Key)
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

    // 2. Insert/Update bảng bữa ăn (meals)
    await db
      .insert(schema.meals)
      .values({
        id: mealId,
        userId: dto.user_id,
        date: dto.date,
        loggedAt: nowMs,
        mealType: dto.meal_type as any,
        photoUri: dto.photo_uri,
        loggedVia: 'manual',
        createdAt: nowMs,
        updatedAt: nowMs,
        deletedAt: dto.deleted_at ? nowMs : null,
        synced: dto.synced,
      })
      .onConflictDoUpdate({
        target: schema.meals.id,
        set: {
          mealType: dto.meal_type as any,
          photoUri: dto.photo_uri,
          updatedAt: nowMs,
          deletedAt: dto.deleted_at ? nowMs : null,
          synced: dto.synced,
        },
      });

    // 3. Insert/Update snapshot món ăn (meal_items)
    await db
      .insert(schema.mealItems)
      .values({
        id: dto.id,
        mealId: mealId,
        userId: dto.user_id,
        foodId: dto.food_id || null,
        foodName: dto.food_name,
        servingLabel: '1 khẩu phần',
        servingQty: dto.portion_multiplier,
        weightGrams: 100,
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
        fiber: 0,
        sugar: 0,
        sodiumMg: 0,
        createdAt: nowMs,
        updatedAt: nowMs,
        deletedAt: dto.deleted_at ? nowMs : null,
        synced: dto.synced,
      })
      .onConflictDoUpdate({
        target: schema.mealItems.id,
        set: {
          foodName: dto.food_name,
          servingQty: dto.portion_multiplier,
          calories: dto.calories,
          protein: dto.protein,
          carbs: dto.carbs,
          fat: dto.fat,
          updatedAt: nowMs,
          deletedAt: dto.deleted_at ? nowMs : null,
          synced: dto.synced,
        },
      });
  }

  async getByDate(date: string): Promise<MealLogDTO[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: schema.mealItems.id,
        user_id: schema.meals.userId,
        date: schema.meals.date,
        meal_type: schema.meals.mealType,
        food_id: sql<string>`COALESCE(${schema.mealItems.foodId}, '')`,
        food_name: schema.mealItems.foodName,
        portion_multiplier: sql<number>`COALESCE(${schema.mealItems.servingQty}, 1.0)`,
        calories: schema.mealItems.calories,
        protein: schema.mealItems.protein,
        carbs: schema.mealItems.carbs,
        fat: schema.mealItems.fat,
        photo_uri: schema.meals.photoUri,
        created_at: schema.mealItems.createdAt,
        updated_at: schema.mealItems.updatedAt,
        deleted_at: schema.mealItems.deletedAt,
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

    return rows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      deleted_at: r.deleted_at ? new Date(r.deleted_at).toISOString() : null,
    }));
  }

  async getAll(): Promise<MealLogDTO[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: schema.mealItems.id,
        user_id: schema.meals.userId,
        date: schema.meals.date,
        meal_type: schema.meals.mealType,
        food_id: sql<string>`COALESCE(${schema.mealItems.foodId}, '')`,
        food_name: schema.mealItems.foodName,
        portion_multiplier: sql<number>`COALESCE(${schema.mealItems.servingQty}, 1.0)`,
        calories: schema.mealItems.calories,
        protein: schema.mealItems.protein,
        carbs: schema.mealItems.carbs,
        fat: schema.mealItems.fat,
        photo_uri: schema.meals.photoUri,
        created_at: schema.mealItems.createdAt,
        updated_at: schema.mealItems.updatedAt,
        deleted_at: schema.mealItems.deletedAt,
        synced: schema.mealItems.synced,
      })
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(isNull(schema.mealItems.deletedAt))
      .orderBy(desc(schema.meals.date), desc(schema.mealItems.createdAt));

    return rows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      deleted_at: r.deleted_at ? new Date(r.deleted_at).toISOString() : null,
    }));
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

  async getPendingSync(): Promise<MealLogDTO[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: schema.mealItems.id,
        user_id: schema.meals.userId,
        date: schema.meals.date,
        meal_type: schema.meals.mealType,
        food_id: sql<string>`COALESCE(${schema.mealItems.foodId}, '')`,
        food_name: schema.mealItems.foodName,
        portion_multiplier: sql<number>`COALESCE(${schema.mealItems.servingQty}, 1.0)`,
        calories: schema.mealItems.calories,
        protein: schema.mealItems.protein,
        carbs: schema.mealItems.carbs,
        fat: schema.mealItems.fat,
        photo_uri: schema.meals.photoUri,
        created_at: schema.mealItems.createdAt,
        updated_at: schema.mealItems.updatedAt,
        deleted_at: schema.mealItems.deletedAt,
        synced: schema.mealItems.synced,
      })
      .from(schema.mealItems)
      .innerJoin(schema.meals, eq(schema.mealItems.mealId, schema.meals.id))
      .where(eq(schema.mealItems.synced, 0));

    return rows.map((r) => ({
      ...r,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      deleted_at: r.deleted_at ? new Date(r.deleted_at).toISOString() : null,
    }));
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await getDrizzleDb();
    await db
      .update(schema.mealItems)
      .set({ synced: 1 })
      .where(eq(schema.mealItems.id, id));
  }
}
