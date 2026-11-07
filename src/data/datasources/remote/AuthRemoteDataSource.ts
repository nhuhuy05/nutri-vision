import { supabase } from './supabaseClient';
import { Session } from '../../../domain/entities/Session';

export class AuthRemoteDataSource {
  /**
   * Đăng ký tài khoản mới bằng Email + Mật khẩu + Tên người dùng.
   * Supabase Auth sẽ tự động lưu thông tin user và kích hoạt trigger tạo hồ sơ profiles.
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<Session> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw new Error(`Auth SignUp Error: ${error.message}`);
    }

    const user = data.user;
    if (!user) {
      throw new Error('Đăng ký thất bại: Không tìm thấy thông tin tài khoản.');
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? email,
        name: user.user_metadata?.name ?? name,
      },
      accessToken: data.session?.access_token ?? 'preview-token',
      refreshToken: data.session?.refresh_token,
      expiresAt: data.session?.expires_at,
    };
  }

  /**
   * Đăng nhập bằng Email và Mật khẩu.
   */
  async signInWithEmail(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Auth SignIn Error: ${error.message}`);
    }

    const user = data.user;
    if (!user) {
      throw new Error('Đăng nhập thất bại: Không tìm thấy người dùng.');
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? email,
        name: user.user_metadata?.name ?? (user.email ? user.email.split('@')[0] : 'User'),
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  /**
   * Gửi email khôi phục / đặt lại mật khẩu.
   */
  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(`Auth ResetPassword Error: ${error.message}`);
    }
  }

  /**
   * Đăng xuất phiên làm việc hiện tại.
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`SignOut Error: ${error.message}`);
    }
  }

  /**
   * Lấy phiên làm việc hiện tại được lưu trong SecureStore.
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Session Error: ${error.message}`);
    }
    if (!data.session?.user) {
      return null;
    }

    const user = data.session.user;
    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? (user.email ? user.email.split('@')[0] : 'User'),
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }
}
