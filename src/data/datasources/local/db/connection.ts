import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { runMigrations } from './migrations';

const DB_NAME = 'nutrivision.db';
let expoDbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleDbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!expoDbInstance) {
    expoDbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await expoDbInstance.execAsync('PRAGMA journal_mode = WAL;');
    await runMigrations(expoDbInstance);
  }
  return expoDbInstance;
}

export async function getDrizzleDb() {
  if (!drizzleDbInstance) {
    const expoDb = await getDatabase();
    drizzleDbInstance = drizzle(expoDb, { schema });
  }
  return drizzleDbInstance;
}

export { schema };
