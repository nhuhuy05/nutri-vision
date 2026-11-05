import { IProfileRepository } from '../../repositories/IProfileRepository';
import { UserProfile } from '../../entities/UserProfile';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class UpdateProfileUseCase {
  constructor(private profileRepo: IProfileRepository) {}

  async execute(profile: UserProfile): Promise<Result<void, Failure>> {
    return this.profileRepo.updateProfile(profile);
  }
}

