import { eq, or, like, and, asc, sql } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { FoodRow } from '../../dto/local';
import { normalizeVietnameseText } from './db/migrations';

export class FoodLocalDataSource {
  async getAllFoods(): Promise<FoodRow[]> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
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
      })
      .from(schema.foods)
      .leftJoin(
        schema.foodServings,
        and(
          eq(schema.foods.id, schema.foodServings.foodId),
          eq(schema.foodServings.isDefault, 1)
        )
      )
      .orderBy(asc(schema.foods.name));

    return rows;
  }

  async searchFoods(query: string): Promise<FoodRow[]> {
    const db = await getDrizzleDb();
    const formatted = `%${query.trim().toLowerCase()}%`;
    const normalized = `%${normalizeVietnameseText(query)}%`;

    const rows = await db
      .select({
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
      })
      .from(schema.foods)
      .leftJoin(
        schema.foodServings,
        and(
          eq(schema.foods.id, schema.foodServings.foodId),
          eq(schema.foodServings.isDefault, 1)
        )
      )
      .where(
        or(
          sql`LOWER(${schema.foods.name}) LIKE ${formatted}`,
          sql`LOWER(COALESCE(${schema.foods.nameEn}, '')) LIKE ${formatted}`,
          like(schema.foods.nameNormalized, normalized),
          like(schema.foods.categoryCode, formatted)
        )
      )
      .orderBy(asc(schema.foods.name));

    return rows;
  }

  async getFoodById(id: string): Promise<FoodRow | null> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
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
      })
      .from(schema.foods)
      .leftJoin(
        schema.foodServings,
        and(
          eq(schema.foods.id, schema.foodServings.foodId),
          eq(schema.foodServings.isDefault, 1)
        )
      )
      .where(eq(schema.foods.id, id))
      .limit(1);

    return rows[0] || null;
  }
}
