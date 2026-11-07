import { useNotificationStore, NotificationType } from '../store/notificationStore';

export const notify = {
  success: (title: string, message: string, onConfirm?: () => void) => {
    useNotificationStore.getState().showAlert({
      title,
      message,
      type: 'success',
      confirmText: 'Tuyệt vời',
      onConfirm,
    });
  },

  error: (title: string, message: string, onConfirm?: () => void) => {
    useNotificationStore.getState().showAlert({
      title,
      message,
      type: 'error',
      confirmText: 'Đã hiểu',
      onConfirm,
    });
  },

  warning: (title: string, message: string, onConfirm?: () => void) => {
    useNotificationStore.getState().showAlert({
      title,
      message,
      type: 'warning',
      confirmText: 'Đồng ý',
      onConfirm,
    });
  },

  info: (title: string, message: string, onConfirm?: () => void) => {
    useNotificationStore.getState().showAlert({
      title,
      message,
      type: 'info',
      confirmText: 'Đóng',
      onConfirm,
    });
  },

  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ'
  ) => {
    useNotificationStore.getState().showAlert({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  },

  toast: (message: string, type: NotificationType = 'success', title?: string) => {
    useNotificationStore.getState().showToast({
      title,
      message,
      type,
    });
  },
};

