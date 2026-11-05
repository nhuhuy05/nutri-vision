import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query/queryKeys';
import {
  getMealLogsByDateUseCase,
  saveMealLogUseCase,
  deleteMealLogUseCase,
} from '../../di/container';
import { MealLog } from '../../domain/entities/MealLog';

export function useDiary(date: string) {
  const queryClient = useQueryClient();

  const {
    data: logs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.mealLogs.byDate(date),
    queryFn: async () => {
      const result = await getMealLogsByDateUseCase.execute(date);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
  });

  const addMealMutation = useMutation({
    mutationFn: async (log: MealLog) => {
      const result = await saveMealLogUseCase.execute(log);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs.all });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMealLogUseCase.execute(id);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealLogs.all });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
    addMeal: addMealMutation.mutateAsync,
    isAdding: addMealMutation.isPending,
    deleteMeal: deleteMealMutation.mutateAsync,
    isDeleting: deleteMealMutation.isPending,
  };
}

