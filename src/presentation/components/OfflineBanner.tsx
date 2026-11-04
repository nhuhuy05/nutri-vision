import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/theme';
import { useMealStore } from '../store/mealStore';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingSyncCount, isSyncing, syncData } = useMealStore();

  if (isOnline && pendingSyncCount === 0) {
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
            ? `Ngoại tuyến (${pendingSyncCount} bản ghi chờ đồng bộ)`
            : `${pendingSyncCount} bản ghi chưa đồng bộ lên máy chủ`}
        </Text>
      </View>

      {isOnline && pendingSyncCount > 0 && (
        <TouchableOpacity
          onPress={syncData}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  bannerOffline: {
    backgroundColor: '#FEE2E2',
  },
  bannerPending: {
    backgroundColor: '#DBEAFE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  syncBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

