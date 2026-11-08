import { Failure } from '../../common/Failure';
import { fail, ok, Result } from '../../common/Result';
import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import {
  NutritionReport,
  ReportAggregator,
  ReportPeriod,
} from '../../services/ReportAggregator';

export class GetNutritionReportUseCase {
  constructor(private readonly mealLogRepository: IMealLogRepository) {}

  async execute(
    referenceDate: string,
    period: ReportPeriod
  ): Promise<Result<NutritionReport, Failure>> {
    const logs = await this.mealLogRepository.getAllMealLogs();
    if (!logs.success) return fail(logs.error);
    return ok(ReportAggregator.getNutritionReport(logs.data, referenceDate, period));
  }
}
