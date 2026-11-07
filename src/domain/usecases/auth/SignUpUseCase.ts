import { IAuthRepository } from '../../repositories/IAuthRepository';
import { Session } from '../../entities/Session';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class SignUpUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string, name: string): Promise<Result<Session, Failure>> {
    return this.authRepo.signUp(email, password, name);
  }
}

