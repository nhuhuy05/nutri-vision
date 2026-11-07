import { IAuthRepository } from '../../repositories/IAuthRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class ResetPasswordUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string): Promise<Result<void, Failure>> {
    return this.authRepo.resetPassword(email);
  }
}
