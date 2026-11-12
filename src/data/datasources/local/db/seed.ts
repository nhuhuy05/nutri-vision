import { eq, sql } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { VIETNAMESE_FOODS_DATA } from './vietnameseFoods';
import { DEFAULT_GOALS, GUEST_USER_ID } from '../../../../domain/constants/defaultGoals';

export function normalizeVietnameseText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

export function mapCategoryCode(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('nước') || cat.includes('bún') || cat.includes('canh') || cat.includes('phở')) {
    return 'soup';
  }
  if (cat.includes('cơm') || cat.includes('xôi')) {
    return 'rice';
  }
  if (cat.includes('vặt') || cat.includes('khai vị')) {
    return 'snack';
  }
  if (cat.includes('rau')) {
    return 'vegetable';
  }
  if (cat.includes('tráng miệng') || cat.includes('chè')) {
    return 'dessert';
  }
  if (cat.includes('uống') || cat.includes('cà phê') || cat.includes('trà')) {
    return 'drink';
  }
  return 'main_dish';
}

export async function seedDatabase(
  db: ExpoSQLiteDatabase<typeof schema>
): Promise<void> {
  const nowMs = Date.now();

  const existingSeeds = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.foods)
    .where(eq(schema.foods.source, 'seed'));

  const seedCount = existingSeeds[0]?.count ?? 0;

  if (seedCount === 0) {
    for (const food of VIETNAMESE_FOODS_DATA) {
      const foodId = food.id;
      const weight = food.servingWeightGrams || 100;
      const cal100g = Math.round(((food.calories * 100) / weight) * 10) / 10;
      const protein100g = Math.round(((food.protein * 100) / weight) * 10) / 10;
      const carbs100g = Math.round(((food.carbs * 100) / weight) * 10) / 10;
      const fat100g = Math.round(((food.fat * 100) / weight) * 10) / 10;

      await db
        .insert(schema.foods)
        .values({
          id: foodId,
          source: 'seed',
          createdBy: null,
          name: food.name,
          nameEn: food.nameEn ?? null,
          nameNormalized: normalizeVietnameseText(food.name),
          categoryCode: mapCategoryCode(food.category),
          aiClassLabel: foodId,
          barcode: null,
          calories100g: cal100g,
          protein100g: protein100g,
          carbs100g: carbs100g,
          fat100g: fat100g,
          fiber100g: 0,
          sugar100g: 0,
          sodiumMg100g: 0,
          seedVersion: 1,
          createdAt: nowMs,
          updatedAt: nowMs,
          deletedAt: null,
          synced: 1,
          syncAttempts: 0,
          syncError: null,
        })
        .onConflictDoNothing();

      await db
        .insert(schema.foodServings)
        .values({
          id: `serving_${foodId}_default`,
          foodId,
          label: food.servingUnit,
          grams: weight,
          isDefault: 1,
          sortOrder: 1,
          createdAt: nowMs,
          updatedAt: nowMs,
          deletedAt: null,
          synced: 1,
          syncAttempts: 0,
          syncError: null,
        })
        .onConflictDoNothing();

      await db
        .insert(schema.foodServings)
        .values({
          id: `serving_${foodId}_100g`,
          foodId,
          label: '100g',
          grams: 100,
          isDefault: 0,
          sortOrder: 2,
          createdAt: nowMs,
          updatedAt: nowMs,
          deletedAt: null,
          synced: 1,
          syncAttempts: 0,
          syncError: null,
        })
        .onConflictDoNothing();
    }
  }

  await db
    .insert(schema.userProfiles)
    .values({
      id: GUEST_USER_ID,
      isGuest: 1,
      email: null,
      name: 'Khách',
      createdAt: nowMs,
      updatedAt: nowMs,
      synced: 0,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.nutritionGoals)
    .values({
      id: `goal_${GUEST_USER_ID}`,
      userId: GUEST_USER_ID,
      effectiveFrom: '2026-01-01',
      calories: DEFAULT_GOALS.calories,
      proteinG: DEFAULT_GOALS.protein,
      carbsG: DEFAULT_GOALS.carbs,
      fatG: DEFAULT_GOALS.fat,
      waterMl: DEFAULT_GOALS.waterMl,
      fiberG: 25,
      sodiumMg: 2300,
      source: 'auto',
      createdAt: nowMs,
      updatedAt: nowMs,
      synced: 0,
    })
    .onConflictDoNothing();
}
