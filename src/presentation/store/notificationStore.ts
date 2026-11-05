import { create } from 'zustand';

export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface AlertOptions {
  title: string;
  message: string;
  type?: NotificationType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ToastOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
}

interface NotificationState {
  // Modal Alert
  alert: AlertOptions | null;
  isAlertOpen: boolean;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;

  // Floating Toast
  toast: ToastOptions | null;
  isToastVisible: boolean;
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  alert: null,
  isAlertOpen: false,

  showAlert: (options: AlertOptions) => {
    set({
      alert: {
        type: 'info',
        confirmText: 'Đã hiểu',
        ...options,
      },
      isAlertOpen: true,
    });
  },

  hideAlert: () => {
    set({ isAlertOpen: false });
  },

  toast: null,
  isToastVisible: false,

  showToast: (options: ToastOptions) => {
    const duration = options.duration || 3200;
    set({
      toast: {
        type: 'success',
        ...options,
      },
      isToastVisible: true,
    });

    setTimeout(() => {
      // Check if current toast is still the same before hiding
      if (get().isToastVisible) {
        set({ isToastVisible: false });
      }
    }, duration);
  },

  hideToast: () => {
    set({ isToastVisible: false });
  },
}));
