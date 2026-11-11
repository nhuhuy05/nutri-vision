import { create } from 'zustand';
import { DailyGoals } from '../../domain/entities/DailyGoals';
import { DEFAULT_GOALS, GUEST_USER_ID } from '../../domain/constants/defaultGoals';
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

  loadGoals: async (userId: string = GUEST_USER_ID) => {
    set({ isLoading: true });
    const result = await getDailyGoalsUseCase.execute(userId);
    if (result.success) {
      set({ goals: result.data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateGoals: async (newGoals: Partial<DailyGoals>, userId: string = GUEST_USER_ID) => {
    const updated = { ...get().goals, ...newGoals };
    set({ goals: updated });
    await updateDailyGoalsUseCase.execute(userId, updated);
  },

  resetGoals: async (userId: string = GUEST_USER_ID) => {
    set({ goals: { ...DEFAULT_GOALS } });
    await updateDailyGoalsUseCase.execute(userId, DEFAULT_GOALS);
  },
}));
