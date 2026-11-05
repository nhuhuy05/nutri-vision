import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from './supabaseClient';
import { Session } from '../../../domain/entities/Session';

export class BiometricAuthDataSource {
  /**
   * Kiểm tra xem thiết bị có hỗ trợ phần cứng và người dùng đã đăng ký Face ID / Vân tay chưa.
   */
  async checkAvailability(): Promise<{ isAvailable: boolean; biometryType: string }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return { isAvailable: false, biometryType: 'NONE' };
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometryType = 'BIOMETRICS';
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = 'FACE_ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = 'FINGERPRINT';
      }

      return {
        isAvailable: true,
        biometryType,
      };
    } catch (e) {
      console.warn('Error checking biometric availability:', e);
      return { isAvailable: false, biometryType: 'NONE' };
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

    // 1. Kiểm tra xem trên máy đã có phiên đăng nhập trước đó chưa
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(`Lỗi kiểm tra phiên: ${sessionError.message}`);
    }

    if (!sessionData.session?.user) {
      throw new Error(
        'Chưa tìm thấy phiên đăng nhập trên thiết bị. Vui lòng đăng nhập bằng Email và Mật khẩu lần đầu tiên để liên kết Face ID.'
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
    const user = sessionData.session.user;
    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? (user.email ? user.email.split('@')[0] : 'User'),
      },
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
      expiresAt: sessionData.session.expires_at,
    };
  }
}

