import { ISyncRepository } from '../../repositories/ISyncRepository';
import { Result } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetPendingSyncCountUseCase {
  constructor(private syncRepo: ISyncRepository) {}

  async execute(): Promise<Result<number, Failure>> {
    return this.syncRepo.getPendingCount();
  }
}
