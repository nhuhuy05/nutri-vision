import { eq } from 'drizzle-orm';
import { getDrizzleDb, schema } from './db/connection';

export class SyncMetaLocalDataSource {
  async getMeta(key: string): Promise<string | null> {
    const db = await getDrizzleDb();
    const rows = await db
      .select({ value: schema.syncMeta.value })
      .from(schema.syncMeta)
      .where(eq(schema.syncMeta.key, key))
      .limit(1);

    return rows[0]?.value ?? null;
  }

  async setMeta(key: string, value: string): Promise<void> {
    const db = await getDrizzleDb();
    const nowMs = Date.now();
    await db
      .insert(schema.syncMeta)
      .values({
        key,
        value,
        updatedAt: nowMs,
      })
      .onConflictDoUpdate({
        target: schema.syncMeta.key,
        set: {
          value,
          updatedAt: nowMs,
        },
      });
  }

  async getLastPulledAt(): Promise<string | null> {
    return this.getMeta('last_pulled_at');
  }

  async setLastPulledAt(timestamp: string): Promise<void> {
    return this.setMeta('last_pulled_at', timestamp);
  }
}
