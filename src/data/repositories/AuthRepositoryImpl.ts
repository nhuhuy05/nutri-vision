import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { Session } from '../../domain/entities/Session';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { AuthRemoteDataSource } from '../datasources/remote/AuthRemoteDataSource';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class AuthRepositoryImpl implements IAuthRepository {
  constructor(private authRemoteDataSource: AuthRemoteDataSource) {}

  async signIn(email: string): Promise<Result<Session, Failure>> {
    try {
      const session = await this.authRemoteDataSource.signInWithEmail(email);
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

  async getCurrentSession(): Promise<Result<Session | null, Failure>> {
    try {
      const session = await this.authRemoteDataSource.getCurrentSession();
      return ok(session);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}

