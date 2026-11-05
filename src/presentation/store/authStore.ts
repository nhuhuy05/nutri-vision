import { create } from 'zustand';
import { UserProfile } from '../../domain/entities/UserProfile';
import {
  signInUseCase,
  signOutUseCase,
  getCurrentSessionUseCase,
} from '../../di/container';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'user_minh_nhat_01',
    email: 'minhnhat@example.com',
    name: 'Minh Nhật',
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true, error: null });
    const result = await getCurrentSessionUseCase.execute();
    if (result.success && result.data) {
      set({
        user: result.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email: string) => {
    set({ isLoading: true, error: null });
    const result = await signInUseCase.execute(email);
    if (result.success) {
      set({
        user: result.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      set({
        isLoading: false,
        error: result.error.message,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await signOutUseCase.execute();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
