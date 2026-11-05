import { Session } from '../entities/Session';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IAuthRepository {
  signIn(email: string): Promise<Result<Session, Failure>>;
  signOut(): Promise<Result<void, Failure>>;
  getCurrentSession(): Promise<Result<Session | null, Failure>>;
}
