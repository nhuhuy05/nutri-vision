import { useQuery } from '@tanstack/react-query';
import { ReportPeriod } from '../../domain/services/ReportAggregator';
import { getNutritionReportUseCase } from '../../di/container';
import { queryKeys } from '../query/queryKeys';

export function useNutritionReport(referenceDate: string, period: ReportPeriod) {
  return useQuery({
    queryKey: queryKeys.report.period(referenceDate, period),
    queryFn: async () => {
      const result = await getNutritionReportUseCase.execute(referenceDate, period);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}
