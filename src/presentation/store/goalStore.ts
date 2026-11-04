import { create } from 'zustand';
import { DailyGoals } from '../../domain/entities/DailyGoals';
import { DEFAULT_GOALS } from '../../core/theme';

interface GoalState {
  goals: DailyGoals;
  updateGoals: (newGoals: Partial<DailyGoals>) => void;
  resetGoals: () => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: { ...DEFAULT_GOALS },
  updateGoals: (newGoals) =>
    set((state) => ({
      goals: { ...state.goals, ...newGoals },
    })),
  resetGoals: () => set({ goals: { ...DEFAULT_GOALS } }),
}));

