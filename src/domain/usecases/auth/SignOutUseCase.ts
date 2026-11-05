import { IAuthRepository } from '../../repositories/IAuthRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class SignOutUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<Result<void, Failure>> {
    return this.authRepo.signOut();
  }
}
