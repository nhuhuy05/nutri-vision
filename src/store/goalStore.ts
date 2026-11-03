import { create } from 'zustand';
import { DailyGoals } from '../types/nutrition';
import { DEFAULT_GOALS } from '../constants/theme';

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

