import { getDatabase } from './db/connection';

export class SyncMetaLocalDataSource {
  async getMeta(key: string): Promise<string | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM sync_meta WHERE key = ?',
      [key]
    );
    return result?.value ?? null;
  }

  async setMeta(key: string, value: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)',
      [key, value, now]
    );
  }

  async getLastPulledAt(): Promise<string | null> {
    return this.getMeta('last_pulled_at');
  }

  async setLastPulledAt(timestamp: string): Promise<void> {
    return this.setMeta('last_pulled_at', timestamp);
  }
}

