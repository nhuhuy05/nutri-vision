import { Session } from '../entities/Session';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IAuthRepository {
  signUp(email: string, password: string, name: string): Promise<Result<Session, Failure>>;
  signIn(email: string, password: string): Promise<Result<Session, Failure>>;
  signOut(): Promise<Result<void, Failure>>;
  resetPassword(email: string): Promise<Result<void, Failure>>;
  getCurrentSession(): Promise<Result<Session | null, Failure>>;
  checkBiometrics(): Promise<{ isAvailable: boolean; biometryType: string; hasEnrolledKey: boolean }>;
  authenticateWithBiometrics(): Promise<Result<Session, Failure>>;
}
