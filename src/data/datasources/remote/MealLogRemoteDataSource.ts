import { supabase } from './supabaseClient';
import { RemoteMealLogDTO } from '../../dto/remote';

export class MealLogRemoteDataSource {
  async upsertMealLogs(logs: RemoteMealLogDTO[]): Promise<void> {
    if (logs.length === 0) return;
    const { error } = await supabase.from('meal_logs').upsert(logs, {
      onConflict: 'id',
    });
    if (error) {
      throw new Error(`Supabase Upsert Error: ${error.message}`);
    }
  }

  async fetchMealLogsSince(userId: string, timestamp: string): Promise<RemoteMealLogDTO[]> {
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', timestamp)
      .order('updated_at', { ascending: true });

    if (error) {
      throw new Error(`Supabase Fetch Error: ${error.message}`);
    }
    return (data as RemoteMealLogDTO[]) || [];
  }
}
