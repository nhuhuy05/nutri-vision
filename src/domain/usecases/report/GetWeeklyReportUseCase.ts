import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { ReportAggregator, DayDistribution } from '../../services/ReportAggregator';
import { Result, ok, fail } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetWeeklyReportUseCase {
  constructor(private mealLogRepo: IMealLogRepository) {}

  async execute(referenceDate: string): Promise<Result<DayDistribution[], Failure>> {
    const logsResult = await this.mealLogRepo.getAllMealLogs();
    if (!logsResult.success) {
      return fail(logsResult.error);
    }
    const distribution = ReportAggregator.getWeeklyDistribution(logsResult.data, referenceDate);
    return ok(distribution);
  }
}
