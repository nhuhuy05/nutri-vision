import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../store/notificationStore';
import { COLORS } from '../theme';

export function CustomToast() {
  const { toast, isToastVisible, hideToast } = useNotificationStore();

  if (!isToastVisible || !toast) return null;

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  const getIcon = () => {
    if (isError) return 'alert-circle';
    if (isWarning) return 'warning';
    return 'checkmark-circle';
  };

  const getIconColor = () => {
    if (isError) return '#EF4444';
    if (isWarning) return '#F59E0B';
    return COLORS.neonMint;
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.toastCard}>
        <View style={styles.leftRow}>
          <Ionicons name={getIcon()} size={22} color={getIconColor()} />
          <View style={styles.textWrap}>
            {toast.title && <Text style={styles.title}>{toast.title}</Text>}
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 32,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(23, 29, 25, 0.95)',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  message: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

