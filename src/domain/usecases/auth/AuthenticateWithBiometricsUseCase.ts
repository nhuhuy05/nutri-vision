import { IAuthRepository } from '../../repositories/IAuthRepository';
import { Session } from '../../entities/Session';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class AuthenticateWithBiometricsUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<Result<Session, Failure>> {
    return this.authRepo.authenticateWithBiometrics();
  }
}
