import { UserProfile } from '../entities/UserProfile';
import { Result } from '../common/Result';
import { Failure } from '../common/Failure';

export interface IProfileRepository {
  getProfile(userId: string): Promise<Result<UserProfile, Failure>>;
  updateProfile(profile: UserProfile): Promise<Result<void, Failure>>;
}
