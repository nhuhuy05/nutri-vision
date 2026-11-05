import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { Result, ok, fail } from '../../domain/common/Result';
import { Failure } from '../../domain/common/Failure';
import { ProfileRemoteDataSource } from '../datasources/remote/ProfileRemoteDataSource';
import { ErrorMapper } from '../infrastructure/ErrorMapper';

export class ProfileRepositoryImpl implements IProfileRepository {
  constructor(private profileRemoteDataSource: ProfileRemoteDataSource) {}

  async getProfile(userId: string): Promise<Result<UserProfile, Failure>> {
    try {
      const profile = await this.profileRemoteDataSource.getProfile(userId);
      return ok(profile);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }

  async updateProfile(profile: UserProfile): Promise<Result<void, Failure>> {
    try {
      await this.profileRemoteDataSource.updateProfile(profile);
      return ok(undefined);
    } catch (e) {
      return fail(ErrorMapper.toFailure(e));
    }
  }
}

