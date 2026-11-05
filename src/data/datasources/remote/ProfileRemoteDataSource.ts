import { supabase } from './supabaseClient';
import { UserProfile } from '../../../domain/entities/UserProfile';

export class ProfileRemoteDataSource {
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Return default profile fallback if record not found
      return {
        id: userId,
        email: 'user@example.com',
        name: 'NutriVision User',
      };
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name ?? 'NutriVision User',
    };
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Profile Update Error: ${error.message}`);
    }
  }
}

