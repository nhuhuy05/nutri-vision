import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/colors';
import { useSync } from '../hooks/useSync';

export const OfflineBanner: React.FC = () => {
  const { colors } = useAppTheme();
  const { isOnline, pendingCount, isSyncing, syncNow } = useSync();

  // Tự động kích hoạt đồng bộ ngầm khi phát hiện có mạng và có bản ghi đang chờ
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        void syncNow();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, isSyncing, syncNow]);

  // Nếu đang online và không còn bản ghi nào chờ đồng bộ thì ẩn banner hoàn toàn
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  // Trạng thái 1: Đang online và đang tự động đồng bộ ngầm
  if (isOnline && isSyncing) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '50' }]}>
        <View style={styles.left}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.text, { color: colors.primaryDark }]}>
            Đang tự động đồng bộ dữ liệu lên đám mây...
          </Text>
        </View>
      </View>
    );
  }

  // Trạng thái 2: Đang online và có bản ghi chờ (chuẩn bị tự động đồng bộ)
  if (isOnline && pendingCount > 0) {
    return (
      <View style={[styles.banner, styles.bannerPending]}>
        <View style={styles.left}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={[styles.text, { color: '#1D4ED8' }]}>
            Đang tự động sao lưu {pendingCount} bản ghi...
          </Text>
        </View>
      </View>
    );
  }

  // Trạng thái 3: Mất mạng ngoại tuyến
  return (
    <View style={[styles.banner, styles.bannerOffline]}>
      <View style={styles.left}>
        <Ionicons name="cloud-offline-outline" size={18} color="#DC2626" />
        <Text style={styles.text}>
          Chế độ ngoại tuyến • Dữ liệu sẽ tự động đồng bộ ngay khi có Internet
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  bannerPending: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
