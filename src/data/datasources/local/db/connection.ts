import type * as SQLite from 'expo-sqlite';
import type { drizzle as drizzleType, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type { migrate as migrateType } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from './schema';
import migrations from './drizzle/migrations';
import { seedDatabase } from './seed';

const DB_NAME = 'nutrivision.db';
let expoDbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleDbInstance: ExpoSQLiteDatabase<typeof schema> | null = null;
let initPromise: Promise<ExpoSQLiteDatabase<typeof schema>> | null = null;

async function resetLegacyManualSchemaIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const drizzleTable = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'"
  );
  if (drizzleTable) {
    return;
  }

  const legacyTable = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'user_profiles'"
  );
  if (!legacyTable) {
    return;
  }

  await db.execAsync(`
    PRAGMA foreign_keys = OFF;
    DROP VIEW IF EXISTS meal_logs;
    DROP VIEW IF EXISTS goals;
    DROP TABLE IF EXISTS foods_fts;
    DROP TABLE IF EXISTS meal_items;
    DROP TABLE IF EXISTS meals;
    DROP TABLE IF EXISTS ai_scan_history;
    DROP TABLE IF EXISTS favorite_foods;
    DROP TABLE IF EXISTS food_servings;
    DROP TABLE IF EXISTS foods;
    DROP TABLE IF EXISTS nutrition_goals;
    DROP TABLE IF EXISTS water_logs;
    DROP TABLE IF EXISTS weight_logs;
    DROP TABLE IF EXISTS sync_meta;
    DROP TABLE IF EXISTS user_profiles;
    PRAGMA foreign_keys = ON;
  `);
}

async function initializeDatabase(): Promise<ExpoSQLiteDatabase<typeof schema>> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQLiteModule = require('expo-sqlite') as typeof SQLite;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require('drizzle-orm/expo-sqlite') as {
    drizzle: typeof drizzleType;
  };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { migrate } = require('drizzle-orm/expo-sqlite/migrator') as {
    migrate: typeof migrateType;
  };

  const sqliteDb = await SQLiteModule.openDatabaseAsync(DB_NAME);
  await sqliteDb.execAsync('PRAGMA journal_mode = WAL;');
  await sqliteDb.execAsync('PRAGMA foreign_keys = ON;');

  await resetLegacyManualSchemaIfNeeded(sqliteDb);

  const drizzleDb = drizzle(sqliteDb, { schema });
  await migrate(drizzleDb, migrations);
  await seedDatabase(drizzleDb);

  expoDbInstance = sqliteDb;
  drizzleDbInstance = drizzleDb;
  return drizzleDb;
}

export async function getDrizzleDb(): Promise<ExpoSQLiteDatabase<typeof schema>> {
  if (drizzleDbInstance) {
    return drizzleDbInstance;
  }
  if (!initPromise) {
    initPromise = initializeDatabase().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  await getDrizzleDb();
  return expoDbInstance!;
}

export { schema };
