import { create } from 'zustand';
import { UserProfile } from '../../domain/entities/UserProfile';
import {
  signUpUseCase,
  signInUseCase,
  signOutUseCase,
  getCurrentSessionUseCase,
  getProfileUseCase,
  updateProfileUseCase,
} from '../../di/container';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updateUserProfile: (name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: 'guest_user_id',
    email: 'khach@nutrivision.app',
    name: 'Khách (Offline)',
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkSession: async () => {
    set({ isLoading: true, error: null });
    const result = await getCurrentSessionUseCase.execute();
    if (result.success && result.data) {
      const sessionUser = result.data.user;
      
      // Try to fetch latest profile from Supabase profiles table
      const profileResult = await getProfileUseCase.execute(sessionUser.id);
      const userProfile: UserProfile = profileResult.success
        ? profileResult.data
        : sessionUser;

      set({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const result = await signInUseCase.execute(email, password);
    if (result.success) {
      const sessionUser = result.data.user;
      
      // Get full profile
      const profileResult = await getProfileUseCase.execute(sessionUser.id);
      const userProfile: UserProfile = profileResult.success
        ? profileResult.data
        : sessionUser;

      set({
        user: userProfile,
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

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    const result = await signUpUseCase.execute(email, password, name);
    if (result.success) {
      const sessionUser = result.data.user;
      set({
        user: sessionUser,
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

  updateUserProfile: async (name: string) => {
    const currentUser = get().user;
    if (!currentUser) return false;

    set({ isLoading: true, error: null });
    const updated: UserProfile = {
      ...currentUser,
      name,
    };

    const result = await updateProfileUseCase.execute(updated);
    if (result.success) {
      set({
        user: updated,
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
