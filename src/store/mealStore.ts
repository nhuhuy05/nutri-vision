import { create } from 'zustand';
import { MealLog, MealType } from '../types/nutrition';
import * as db from '../services/database';
import { checkNetworkStatus } from '../services/network';
import { syncMealLogs } from '../services/sync';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface MealStoreState {
  selectedDate: string;
  logs: MealLog[];
  pendingSyncCount: number;
  isOnline: boolean;
  isLoading: boolean;
  isSyncing: boolean;

  setSelectedDate: (date: string) => void;
  loadLogs: (date?: string) => Promise<void>;
  addMeal: (params: {
    userId: string;
    mealType: MealType;
    foodId: string;
    foodName: string;
    portionMultiplier: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    photoUri?: string;
  }) => Promise<MealLog>;
  removeMeal: (id: string) => Promise<void>;
  syncData: () => Promise<void>;
  checkConnectivity: () => Promise<void>;
}

export const useMealStore = create<MealStoreState>((set, get) => ({
  selectedDate: getTodayString(),
  logs: [],
  pendingSyncCount: 0,
  isOnline: true,
  isLoading: false,
  isSyncing: false,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadLogs(date);
  },

  loadLogs: async (targetDate) => {
    const date = targetDate || get().selectedDate;
    set({ isLoading: true });
    try {
      const logs = await db.getMealLogsByDate(date);
      const pending = await db.getPendingSyncLogs();
      set({ logs, pendingSyncCount: pending.length, isLoading: false });
    } catch (err) {
      console.error('Failed to load logs:', err);
      set({ isLoading: false });
    }
  },

  addMeal: async (params) => {
    const newLog: MealLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: params.userId,
      date: get().selectedDate,
      mealType: params.mealType,
      foodId: params.foodId,
      foodName: params.foodName,
      portionMultiplier: params.portionMultiplier,
      calories: params.calories,
      protein: params.protein,
      carbs: params.carbs,
      fat: params.fat,
      photoUri: params.photoUri,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await db.saveMealLog(newLog);
    await get().loadLogs();

    // Trigger sync if online
    if (get().isOnline) {
      get().syncData();
    }

    return newLog;
  },

  removeMeal: async (id) => {
    await db.deleteMealLog(id);
    await get().loadLogs();
  },

  syncData: async () => {
    set({ isSyncing: true });
    try {
      await syncMealLogs();
      const pending = await db.getPendingSyncLogs();
      set({ pendingSyncCount: pending.length });
    } catch (error) {
      console.warn('Sync error:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  checkConnectivity: async () => {
    const net = await checkNetworkStatus();
    set({ isOnline: net.isConnected });
  },
}));
