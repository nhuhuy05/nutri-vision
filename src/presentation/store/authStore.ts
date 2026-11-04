import { create } from 'zustand';
import { UserProfile } from '../../domain/entities/UserProfile';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
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

  login: async (email: string) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        user: { id: 'user_minh_nhat_01', email, name: email.split('@')[0] },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 400);
  },

  register: async (email: string, name: string) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        user: { id: 'user_' + Date.now(), email, name },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 400);
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });
  },
}));

