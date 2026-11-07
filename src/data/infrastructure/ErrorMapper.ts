import {
  Failure,
  ServerFailure,
  CacheFailure,
  NetworkFailure,
  AuthFailure,
  UnknownFailure,
} from '../../domain/common/Failure';

export class ErrorMapper {
  /**
   * Chuyển đổi các thông báo lỗi kỹ thuật từ Supabase / Backend sang tiếng Việt thân thiện với người dùng
   */
  private static formatAuthErrorMessage(rawMessage: string): string {
    const msg = rawMessage.toLowerCase();

    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
      return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    }
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Tài khoản chưa được kích hoạt qua email. Vui lòng kiểm tra hộp thư của bạn.';
    }
    if (msg.includes('password should be at least')) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      return 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng đợi ít phút và thử lại.';
    }
    if (msg.includes('signup requires a valid password')) {
      return 'Vui lòng nhập mật khẩu hợp lệ.';
    }
    if (msg.includes('user not found')) {
      return 'Không tìm thấy tài khoản với địa chỉ email này.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    }

    // Nếu đã là câu tiếng Việt
    if (/[\u00C0-\u1EF9]/.test(rawMessage)) {
      return rawMessage;
    }

    return 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
  }

  static toFailure(error: unknown, fallbackMessage: string = 'Đã xảy ra lỗi không xác định'): Failure {
    if (error instanceof Failure) {
      return error;
    }

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('network') ||
        msg.includes('internet') ||
        msg.includes('offline') ||
        msg.includes('failed to fetch')
      ) {
        return new NetworkFailure('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
      }
      if (
        msg.includes('auth') ||
        msg.includes('unauthorized') ||
        msg.includes('jwt') ||
        msg.includes('session') ||
        msg.includes('credentials') ||
        msg.includes('signup') ||
        msg.includes('signin')
      ) {
        return new AuthFailure(this.formatAuthErrorMessage(error.message));
      }
      if (msg.includes('sqlite') || msg.includes('database') || msg.includes('db')) {
        return new CacheFailure('Lỗi lưu trữ dữ liệu cục bộ.');
      }
      return new ServerFailure(this.formatAuthErrorMessage(error.message));
    }

    return new UnknownFailure(typeof error === 'string' ? error : fallbackMessage);
  }
}

