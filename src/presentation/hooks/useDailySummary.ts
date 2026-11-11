import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/queryKeys';
import { getDailySummaryUseCase } from '../../di/container';
import { GUEST_USER_ID } from '../../domain/constants/defaultGoals';

export function useDailySummary(userId: string = GUEST_USER_ID, date: string) {
  return useQuery({
    queryKey: queryKeys.summary.byDate(userId, date),
    queryFn: async () => {
      const result = await getDailySummaryUseCase.execute(userId, date);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });
}

