import { IProfileRepository } from '../../repositories/IProfileRepository';
import { UserProfile } from '../../entities/UserProfile';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetProfileUseCase {
  constructor(private profileRepo: IProfileRepository) {}

  async execute(userId: string): Promise<Result<UserProfile, Failure>> {
    return this.profileRepo.getProfile(userId);
  }
}

