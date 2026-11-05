import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from './supabaseClient';
import { Session } from '../../../domain/entities/Session';
import { secureSessionStorage } from '../../infrastructure/SecureSessionStorage';

export class BiometricAuthDataSource {
  /**
   * Kiểm tra xem thiết bị có hỗ trợ phần cứng và người dùng đã đăng ký Face ID / Vân tay chưa.
   */
  async checkAvailability(): Promise<{ isAvailable: boolean; biometryType: string; hasEnrolledKey: boolean }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return { isAvailable: false, biometryType: 'NONE', hasEnrolledKey: false };
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometryType = 'BIOMETRICS';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = 'FACE_ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = 'FINGERPRINT';
      }

      const storedToken = await secureSessionStorage.getItem('@nutrivision_biometric_token');

      return {
        isAvailable: true,
        biometryType,
        hasEnrolledKey: !!storedToken,
      };
    } catch (e) {
      console.warn('Error checking biometric availability:', e);
      return { isAvailable: false, biometryType: 'NONE', hasEnrolledKey: false };
    }
  }

  /**
   * Kích hoạt xác thực Face ID / Vân tay trên thiết bị và khôi phục phiên làm việc Supabase.
   */
  async authenticateAndRestoreSession(): Promise<Session> {
    const availability = await this.checkAvailability();
    if (!availability.isAvailable) {
      throw new Error('Thiết bị của bạn không hỗ trợ hoặc chưa thiết lập Face ID / Vân tay.');
    }

    // 1. Kiểm tra session hiện tại hoặc token đã lưu trong SecureStore
    const { data: sessionData } = await supabase.auth.getSession();
    let validSession = sessionData?.session;

    if (!validSession) {
      const storedRefreshToken = await secureSessionStorage.getItem('@nutrivision_biometric_token');
      if (storedRefreshToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: storedRefreshToken,
        });
        if (!refreshError && refreshData.session) {
          validSession = refreshData.session;
          if (refreshData.session.refresh_token) {
            await secureSessionStorage.setItem('@nutrivision_biometric_token', refreshData.session.refresh_token);
          }
        }
      }
    }

    if (!validSession?.user) {
      throw new Error(
        'Bạn cần đăng nhập bằng Email & Mật khẩu lần đầu tiên để liên kết Face ID / Sinh trắc học.'
      );
    }

    // 2. Kích hoạt giao diện quét sinh trắc học của hệ điều hành
    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Xác thực Face ID / Sinh trắc học để vào NutriLens',
      cancelLabel: 'Hủy',
      fallbackLabel: 'Sử dụng mật khẩu',
      disableDeviceFallback: false,
    });

    if (!authResult.success) {
      if (authResult.error === 'user_cancel') {
        throw new Error('Bạn đã hủy xác thực sinh trắc học.');
      }
      throw new Error('Xác thực Face ID không khớp, vui lòng thử lại.');
    }

    // 3. Khôi phục session hợp lệ
    const user = validSession.user;
    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? (user.email ? user.email.split('@')[0] : 'User'),
      },
      accessToken: validSession.access_token,
      refreshToken: validSession.refresh_token,
      expiresAt: validSession.expires_at,
    };
  }
}

