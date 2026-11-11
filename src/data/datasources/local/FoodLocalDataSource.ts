import { eq, or, like, and, asc, isNull, sql } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';
import { FoodRow } from '../../dto/local';
import { normalizeVietnameseText } from './db/seed';

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
    const formatted = `%${query.trim().toLowerCase()}%`;
    const normalized = `%${normalizeVietnameseText(query)}%`;

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
          or(
            sql`LOWER(${schema.foods.name}) LIKE ${formatted}`,
            sql`LOWER(COALESCE(${schema.foods.nameEn}, '')) LIKE ${formatted}`,
            like(schema.foods.nameNormalized, normalized),
            like(schema.foods.categoryCode, formatted)
          )
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
}
