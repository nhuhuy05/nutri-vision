import { create } from 'zustand';
import { DailyGoals } from '../../domain/entities/DailyGoals';
import { DEFAULT_GOALS } from '../../domain/constants/defaultGoals';
import { getDailyGoalsUseCase, updateDailyGoalsUseCase } from '../../di/container';

interface GoalState {
  goals: DailyGoals;
  isLoading: boolean;
  loadGoals: (userId?: string) => Promise<void>;
  updateGoals: (newGoals: Partial<DailyGoals>, userId?: string) => Promise<void>;
  resetGoals: (userId?: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: { ...DEFAULT_GOALS },
  isLoading: false,

  loadGoals: async (userId: string = 'default_user') => {
    set({ isLoading: true });
    const result = await getDailyGoalsUseCase.execute(userId);
    if (result.success) {
      set({ goals: result.data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateGoals: async (newGoals: Partial<DailyGoals>, userId: string = 'default_user') => {
    const updated = { ...get().goals, ...newGoals };
    set({ goals: updated });
    await updateDailyGoalsUseCase.execute(userId, updated);
  },

  resetGoals: async (userId: string = 'default_user') => {
    set({ goals: { ...DEFAULT_GOALS } });
    await updateDailyGoalsUseCase.execute(userId, DEFAULT_GOALS);
  },
}));
