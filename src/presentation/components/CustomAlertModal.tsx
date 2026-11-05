import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore, NotificationType } from '../store/notificationStore';
import { COLORS } from '../theme';

export function CustomAlertModal() {
  const { alert, isAlertOpen, hideAlert } = useNotificationStore();

  if (!alert) return null;

  const type: NotificationType = alert.type || 'info';

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'alert-circle' as const,
          iconColor: '#DC2626',
          iconBg: '#FEF2F2',
          borderColor: '#FEE2E2',
          gradientColor: '#DC2626',
        };
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: COLORS.primary,
          iconBg: '#F0FDF4',
          borderColor: '#DCFCE7',
          gradientColor: COLORS.primary,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: '#D97706',
          iconBg: '#FFFBEB',
          borderColor: '#FEF3C7',
          gradientColor: '#D97706',
        };
      case 'info':
      default:
        return {
          icon: 'sparkles' as const,
          iconColor: COLORS.primary,
          iconBg: '#F0FDF4',
          borderColor: '#DCFCE7',
          gradientColor: COLORS.neonMint,
        };
    }
  };

  const config = getTypeConfig();

  const handleConfirm = () => {
    hideAlert();
    if (alert.onConfirm) {
      alert.onConfirm();
    }
  };

  const handleCancel = () => {
    hideAlert();
    if (alert.onCancel) {
      alert.onCancel();
    }
  };

  return (
    <Modal
      transparent
      visible={isAlertOpen}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={alert.cancelText ? undefined : handleConfirm}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Decorative Accent Top Line */}
              <View
                style={[styles.topAccentLine, { backgroundColor: config.gradientColor }]}
              />

              {/* Icon Circle */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: config.iconBg,
                    borderColor: config.borderColor,
                  },
                ]}
              >
                <Ionicons name={config.icon} size={30} color={config.iconColor} />
              </View>

              {/* Title & Message */}
              <Text style={styles.title}>{alert.title}</Text>
              <Text style={styles.message}>{alert.message}</Text>

              {/* Action Buttons */}
              <View
                style={[
                  styles.btnRow,
                  alert.cancelText ? styles.btnRowSplit : undefined,
                ]}
              >
                {alert.cancelText && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>{alert.cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    type === 'error' && styles.confirmBtnError,
                    alert.cancelText ? { flex: 1 } : undefined,
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>
                    {alert.confirmText || 'Đã hiểu'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  topAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171D19',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  btnRow: {
    width: '100%',
    flexDirection: 'row',
  },
  btnRowSplit: {
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnError: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
});

