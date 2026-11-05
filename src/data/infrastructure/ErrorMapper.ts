import {
  Failure,
  ServerFailure,
  CacheFailure,
  NetworkFailure,
  AuthFailure,
  UnknownFailure,
} from '../../domain/common/Failure';

export class ErrorMapper {
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
        return new NetworkFailure(error.message);
      }
      if (
        msg.includes('auth') ||
        msg.includes('unauthorized') ||
        msg.includes('jwt') ||
        msg.includes('session')
      ) {
        return new AuthFailure(error.message);
      }
      if (msg.includes('sqlite') || msg.includes('database') || msg.includes('db')) {
        return new CacheFailure(error.message);
      }
      return new ServerFailure(error.message);
    }

    return new UnknownFailure(typeof error === 'string' ? error : fallbackMessage);
  }
}

