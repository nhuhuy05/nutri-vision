import { IAuthRepository } from '../../repositories/IAuthRepository';
import { Session } from '../../entities/Session';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class SignInUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<Result<Session, Failure>> {
    return this.authRepo.signIn(email, password);
  }
}
