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
      // Fallback profile if record not found yet
      return {
        id: userId,
        email: 'user@example.com',
        name: 'Người dùng NutriVision',
      };
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name ?? 'Người dùng NutriVision',
    };
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      throw new Error(`Profile Update Error: ${error.message}`);
    }
  }
}
