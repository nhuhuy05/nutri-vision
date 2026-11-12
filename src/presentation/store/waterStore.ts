import { create } from 'zustand';
import {
  getDailyWaterUseCase,
  logWaterUseCase,
  resetDailyWaterUseCase,
} from '../../di/container';

interface WaterState {
  todayWaterMl: number;
  isLoading: boolean;
  loadWater: (userId: string, date: string) => Promise<void>;
  addWater: (userId: string, date: string, amountMl: number) => Promise<void>;
  resetWater: (userId: string, date: string) => Promise<void>;
}

export const useWaterStore = create<WaterState>((set) => ({
  todayWaterMl: 0,
  isLoading: false,

  loadWater: async (userId: string, date: string) => {
    set({ isLoading: true });
    try {
      const result = await getDailyWaterUseCase.execute(userId, date);
      if (result.success) {
        set({ todayWaterMl: result.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addWater: async (userId: string, date: string, amountMl: number) => {
    // Cập nhật lạc quan (Optimistic update)
    set((state) => ({ todayWaterMl: state.todayWaterMl + amountMl }));
    try {
      const result = await logWaterUseCase.execute(userId, date, amountMl);
      if (result.success) {
        set({ todayWaterMl: result.data });
      }
    } catch {
      // Revert if failed
      set((state) => ({ todayWaterMl: Math.max(0, state.todayWaterMl - amountMl) }));
    }
  },

  resetWater: async (userId: string, date: string) => {
    set({ todayWaterMl: 0 });
    try {
      await resetDailyWaterUseCase.execute(userId, date);
    } catch {
      // ignore
    }
  },
}));

