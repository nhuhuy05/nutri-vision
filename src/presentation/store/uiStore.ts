import { create } from 'zustand';

interface UIState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  resetToToday: () => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useUIStore = create<UIState>((set) => ({
  selectedDate: getTodayString(),
  setSelectedDate: (date: string) => set({ selectedDate: date }),
  resetToToday: () => set({ selectedDate: getTodayString() }),
}));

