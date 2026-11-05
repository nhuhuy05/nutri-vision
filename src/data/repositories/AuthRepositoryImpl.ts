import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { Session } from '../../domain/entities/Session';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { AuthRemoteDataSource } from '../datasources/remote/AuthRemoteDataSource';
import { BiometricAuthDataSource } from '../datasources/remote/BiometricAuthDataSource';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(
    private authRemoteDataSource: AuthRemoteDataSource,
    private biometricAuthDataSource: BiometricAuthDataSource
  ) {}

  async signUp(email: string, password: string, name: string): Promise<Result<Session, Failure>> {
    try {
      const session = await this.authRemoteDataSource.signUpWithEmail(email, password, name);
      return ok(session);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async signIn(email: string, password: string): Promise<Result<Session, Failure>> {
    try {
      const session = await this.authRemoteDataSource.signInWithEmail(email, password);
      return ok(session);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async signOut(): Promise<Result<void, Failure>> {
    try {
      await this.authRemoteDataSource.signOut();
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async resetPassword(email: string): Promise<Result<void, Failure>> {
    try {
      await this.authRemoteDataSource.resetPasswordForEmail(email);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async getCurrentSession(): Promise<Result<Session | null, Failure>> {
    try {
      const session = await this.authRemoteDataSource.getCurrentSession();
      return ok(session);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async checkBiometrics(): Promise<{ isAvailable: boolean; biometryType: string; hasEnrolledKey: boolean }> {
    return this.biometricAuthDataSource.checkAvailability();
  }

  async authenticateWithBiometrics(): Promise<Result<Session, Failure>> {
    try {
      const session = await this.biometricAuthDataSource.authenticateAndRestoreSession();
      return ok(session);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}
