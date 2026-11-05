import { IMealLogRepository } from '../../repositories/IMealLogRepository';
import { IGoalRepository } from '../../repositories/IGoalRepository';
import { DailySummary } from '../../entities/DailySummary';
import { NutritionCalculator } from '../../services/NutritionCalculator';
import { Result, ok, fail } from '../../common/Result';
import { Failure } from '../../common/Failure';

export class GetDailySummaryUseCase {
  constructor(
    private mealLogRepo: IMealLogRepository,
    private goalRepo: IGoalRepository
  ) {}

  async execute(userId: string, date: string): Promise<Result<DailySummary, Failure>> {
    const logsResult = await this.mealLogRepo.getMealLogsByDate(date);
    if (!logsResult.success) {
      return fail(logsResult.error);
    }

    const goalsResult = await this.goalRepo.getGoals(userId);
    if (!goalsResult.success) {
      return fail(goalsResult.error);
    }

    const logs = logsResult.data;
    const goal = goalsResult.data;
    const totals = NutritionCalculator.sumMealLogs(logs);

    return ok({
      date,
      caloriesConsumed: totals.calories,
      proteinConsumed: totals.protein,
      carbsConsumed: totals.carbs,
      fatConsumed: totals.fat,
      goal,
      logs,
    });
  }
}
