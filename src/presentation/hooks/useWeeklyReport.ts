import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/queryKeys';
import { getWeeklyReportUseCase } from '../../di/container';

export function useWeeklyReport(referenceDate: string) {
  return useQuery({
    queryKey: queryKeys.report.weekly(referenceDate),
    queryFn: async () => {
      const result = await getWeeklyReportUseCase.execute(referenceDate);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });
}

