import { IAuthRepository } from '../../repositories/IAuthRepository';

export class CheckBiometricAvailabilityUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(): Promise<{ isAvailable: boolean; biometryType: string; hasEnrolledKey: boolean }> {
    return this.authRepo.checkBiometrics();
  }
}

