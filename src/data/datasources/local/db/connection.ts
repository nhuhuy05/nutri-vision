import type * as SQLite from 'expo-sqlite';
import type { drizzle as drizzleType } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { runMigrations } from './migrations';

const DB_NAME = 'nutrivision.db';
let expoDbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleDbInstance: ReturnType<typeof drizzleType<typeof schema>> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!expoDbInstance) {
    // Lazy-load native SQLite module so top-level route evaluation never crashes
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SQLiteModule = require('expo-sqlite') as typeof SQLite;
    const db = await SQLiteModule.openDatabaseAsync(DB_NAME);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await runMigrations(db);
    expoDbInstance = db;
  }
  return expoDbInstance;
}

export async function getDrizzleDb() {
  if (!drizzleDbInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/expo-sqlite') as {
      drizzle: typeof drizzleType;
    };
    const expoDb = await getDatabase();
    drizzleDbInstance = drizzle(expoDb, { schema });
  }
  return drizzleDbInstance;
}

export { schema };
