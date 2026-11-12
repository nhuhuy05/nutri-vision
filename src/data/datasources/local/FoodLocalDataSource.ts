import { eq, or, like, and, asc, isNull, sql } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { FoodRow } from '../../dto/local';
import { normalizeVietnameseText, mapCategoryCode } from './db/seed';
import { FoodItem } from '../../../domain/entities/FoodItem';

const foodProjection = {
  id: schema.foods.id,
  name: schema.foods.name,
  nameEn: schema.foods.nameEn,
  category: schema.foods.categoryCode,
  calories: sql<number>`ROUND(${schema.foods.calories100g} * COALESCE(${schema.foodServings.grams}, 100) / 100)`,
  protein: sql<number>`ROUND(${schema.foods.protein100g} * COALESCE(${schema.foodServings.grams}, 100) / 100, 1)`,
  carbs: sql<number>`ROUND(${schema.foods.carbs100g} * COALESCE(${schema.foodServings.grams}, 100) / 100, 1)`,
  fat: sql<number>`ROUND(${schema.foods.fat100g} * COALESCE(${schema.foodServings.grams}, 100) / 100, 1)`,
  servingUnit: sql<string>`COALESCE(${schema.foodServings.label}, '100g')`,
  servingWeightGrams: sql<number>`COALESCE(${schema.foodServings.grams}, 100)`,
};

export class FoodLocalDataSource {
  async getAllFoods(): Promise<FoodRow[]> {
    const db = await getDrizzleDb();
    return db
      .select(foodProjection)
      .from(schema.foods)
      .leftJoin(
        schema.foodServings,
        and(
          eq(schema.foods.id, schema.foodServings.foodId),
          eq(schema.foodServings.isDefault, 1)
        )
      )
      .where(isNull(schema.foods.deletedAt))
      .orderBy(asc(schema.foods.name));
  }

  async searchFoods(query: string): Promise<FoodRow[]> {
    const db = await getDrizzleDb();
    const cleanQuery = query.trim();
    if (!cleanQuery) return this.getAllFoods();

    const rawWords = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const normWords = normalizeVietnameseText(cleanQuery).split(/\s+/).filter(Boolean);

    // Xây dựng điều kiện tìm kiếm đa từ: mỗi từ đều phải khớp trong name hoặc nameNormalized hoặc nameEn
    const wordConditions = normWords.map((word, idx) => {
      const rawWord = rawWords[idx] || word;
      return or(
        sql`LOWER(${schema.foods.name}) LIKE ${`%${rawWord}%`}`,
        sql`LOWER(COALESCE(${schema.foods.nameEn}, '')) LIKE ${`%${rawWord}%`}`,
        like(schema.foods.nameNormalized, `%${word}%`),
        like(schema.foods.categoryCode, `%${rawWord}%`)
      );
    });

    return db
      .select(foodProjection)
      .from(schema.foods)
      .leftJoin(
        schema.foodServings,
        and(
          eq(schema.foods.id, schema.foodServings.foodId),
          eq(schema.foodServings.isDefault, 1)
        )
      )
      .where(
        and(
          isNull(schema.foods.deletedAt),
          ...wordConditions
        )
      )
      .orderBy(asc(schema.foods.name));
  }

  async getFoodById(id: string): Promise<FoodRow | null> {
    const db = await getDrizzleDb();
    const rows = await db
      .select(foodProjection)
      .from(schema.foods)
      .leftJoin(
        schema.foodServings,
        and(
          eq(schema.foods.id, schema.foodServings.foodId),
          eq(schema.foodServings.isDefault, 1)
        )
      )
      .where(
        and(
          isNull(schema.foods.deletedAt),
          or(eq(schema.foods.id, id), eq(schema.foods.aiClassLabel, id))
        )
      )
      .limit(1);

    return rows[0] || null;
  }

  async createCustomFood(
    item: Omit<FoodItem, 'id'>,
    userId?: string
  ): Promise<FoodRow> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    const id = `custom_${nowMs}_${Math.random().toString(36).slice(2, 7)}`;
    const weight = item.servingWeightGrams && item.servingWeightGrams > 0 ? item.servingWeightGrams : 100;
    const cal100g = Math.round(((item.calories * 100) / weight) * 10) / 10;
    const protein100g = Math.round(((item.protein * 100) / weight) * 10) / 10;
    const carbs100g = Math.round(((item.carbs * 100) / weight) * 10) / 10;
    const fat100g = Math.round(((item.fat * 100) / weight) * 10) / 10;

    await db.insert(schema.foods).values({
      id,
      source: 'custom',
      createdBy: userId || null,
      name: item.name.trim(),
      nameEn: item.nameEn?.trim() || null,
      nameNormalized: normalizeVietnameseText(item.name),
      categoryCode: mapCategoryCode(item.category || 'Món ăn'),
      aiClassLabel: null,
      barcode: null,
      calories100g: cal100g,
      protein100g: protein100g,
      carbs100g: carbs100g,
      fat100g: fat100g,
      fiber100g: 0,
      sugar100g: 0,
      sodiumMg100g: 0,
      seedVersion: 0,
      createdAt: nowMs,
      updatedAt: nowMs,
      deletedAt: null,
      synced: 0,
      syncAttempts: 0,
      syncError: null,
    });

    await db.insert(schema.foodServings).values({
      id: `serving_${id}_default`,
      foodId: id,
      label: item.servingUnit || '1 khẩu phần',
      grams: weight,
      isDefault: 1,
      sortOrder: 1,
      createdAt: nowMs,
      updatedAt: nowMs,
    });

    return {
      id,
      name: item.name.trim(),
      nameEn: item.nameEn?.trim() || null,
      category: item.category || 'Món ăn',
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingUnit: item.servingUnit || '1 khẩu phần',
      servingWeightGrams: weight,
    };
  }
}
