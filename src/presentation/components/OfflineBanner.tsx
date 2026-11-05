import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useSync } from '../hooks/useSync';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, syncNow } = useSync();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        !isOnline ? styles.bannerOffline : styles.bannerPending,
      ]}
    >
      <View style={styles.left}>
        <Ionicons
          name={!isOnline ? 'cloud-offline-outline' : 'cloud-upload-outline'}
          size={18}
          color={!isOnline ? '#DC2626' : '#2563EB'}
        />
        <Text style={styles.text}>
          {!isOnline
            ? `Ngoại tuyến (${pendingCount} bản ghi chờ đồng bộ)`
            : `${pendingCount} bản ghi chưa đồng bộ lên máy chủ`}
        </Text>
      </View>

      {isOnline && pendingCount > 0 && (
        <TouchableOpacity
          onPress={syncNow}
          disabled={isSyncing}
          style={styles.syncBtn}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.syncBtnText}>Đồng bộ</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  bannerOffline: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  bannerPending: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  syncBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
