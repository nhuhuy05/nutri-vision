import { supabase } from './supabaseClient';
import { Session } from '../../../domain/entities/Session';

export class AuthRemoteDataSource {
  async signInWithEmail(email: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) {
      throw new Error(`Auth Error: ${error.message}`);
    }

    // In OTP flow, user is created or magic link sent. For local preview session:
    const session = (data as { session?: { user?: { id: string; email?: string; user_metadata?: { name?: string } }; access_token?: string; refresh_token?: string; expires_at?: number } | null })?.session;
    return {
      user: {
        id: session?.user?.id ?? 'demo-user-id',
        email: session?.user?.email ?? email,
        name: session?.user?.user_metadata?.name ?? email.split('@')[0],
      },
      accessToken: session?.access_token ?? 'mock-token',
      refreshToken: session?.refresh_token,
      expiresAt: session?.expires_at,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`SignOut Error: ${error.message}`);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Session Error: ${error.message}`);
    }
    if (!data.session?.user) {
      return null;
    }
    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email ?? '',
        name: data.session.user.user_metadata?.name ?? (data.session.user.email ? data.session.user.email.split('@')[0] : 'User'),
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }
}
