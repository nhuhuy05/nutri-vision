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

  // Lấy toàn bộ các bảng và view người dùng đã tạo trước đây (loại trừ các bảng hệ thống SQLite)
  const objects = await db.getAllAsync<{ type: string; name: string }>(
    "SELECT type, name FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'"
  );

  if (objects.length === 0) {
    return;
  }

  await db.execAsync('PRAGMA foreign_keys = OFF;');

  // 1. Xóa toàn bộ views trước
  for (const obj of objects) {
    if (obj.type === 'view') {
      try {
        await db.execAsync(`DROP VIEW IF EXISTS "${obj.name}";`);
      } catch {
        // Bỏ qua nếu view đã bị xóa
      }
    }
  }

  // 2. Xóa toàn bộ tables (bao gồm cả virtual tables)
  for (const obj of objects) {
    if (obj.type === 'table') {
      try {
        await db.execAsync(`DROP TABLE IF EXISTS "${obj.name}";`);
      } catch {
        // Bỏ qua nếu là shadow table của FTS đã bị xóa kèm bảng chính
      }
    }
  }

  await db.execAsync('PRAGMA foreign_keys = ON;');
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
