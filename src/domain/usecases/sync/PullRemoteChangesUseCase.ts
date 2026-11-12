import { ISyncRepository } from '../../repositories/ISyncRepository';
import { INetworkInfo } from '../../repositories/INetworkInfo';
import { MealLog } from '../../entities/MealLog';
import { Result, ok, fail } from '../../common/Result';
import { Failure, NetworkFailure } from '../../common/Failure';
import { GUEST_USER_ID } from '../../constants/defaultGoals';

export class PullRemoteChangesUseCase {
  constructor(
    private syncRepo: ISyncRepository,
    private networkInfo: INetworkInfo
  ) {}

  async execute(userId: string): Promise<Result<MealLog[], Failure>> {
    if (!userId || userId === GUEST_USER_ID) {
      return ok([]);
    }

    const isOnline = await this.networkInfo.isConnected();
    if (!isOnline) {
      return fail(new NetworkFailure('Không có kết nối mạng'));
    }

    return this.syncRepo.pullRemoteChanges(userId);
  }
}

