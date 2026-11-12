import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppColors } from '../theme';
import { useWaterStore, useGoalStore, useAuthStore, useUIStore } from '../store';
import { GUEST_USER_ID } from '../../domain/constants/defaultGoals';
import { notify } from '../utils/notify';

export function WaterCard() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { user } = useAuthStore();
  const { goals } = useGoalStore();
  const { selectedDate } = useUIStore();
  const { todayWaterMl, loadWater, addWater, resetWater } = useWaterStore();

  const targetWater = goals.waterMl && goals.waterMl > 0 ? goals.waterMl : 2000;
  const percentage = Math.min(100, Math.round((todayWaterMl / targetWater) * 100));
  const currentUserId = user?.id || GUEST_USER_ID;

  useEffect(() => {
    void loadWater(currentUserId, selectedDate);
  }, [currentUserId, selectedDate, loadWater]);

  const handleAddWater = (amount: number) => {
    void addWater(currentUserId, selectedDate, amount);
    notify.toast(`Đã uống thêm ${amount}ml nước 💧`);
  };

  const handleReset = () => {
    notify.confirm(
      'Đặt lại lượng nước',
      'Bạn có chắc chắn muốn đặt lại lượng nước uống hôm nay về 0ml?',
      () => {
        void resetWater(currentUserId, selectedDate);
        notify.toast('Đã đặt lại lượng nước');
      },
      undefined,
      'Đặt lại',
      'Hủy'
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <View style={styles.waterIconWrap}>
            <Ionicons name="water" size={18} color="#0284C7" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Nước uống hôm nay</Text>
            <Text style={styles.cardSubtitle}>
              Mục tiêu: {targetWater.toLocaleString('vi-VN')} ml
            </Text>
          </View>
        </View>

        <View style={styles.statusWrap}>
          <Text style={styles.progressText}>
            <Text style={styles.currentMl}>{todayWaterMl.toLocaleString('vi-VN')}</Text> / {targetWater.toLocaleString('vi-VN')} ml
          </Text>
          <Text style={styles.percentText}>{percentage}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleAddWater(250)}
          activeOpacity={0.8}
        >
          <Ionicons name="water-outline" size={16} color="#0284C7" />
          <Text style={styles.addBtnText}>+250 ml (Cốc)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => handleAddWater(500)}
          activeOpacity={0.8}
        >
          <Ionicons name="water" size={16} color="#0284C7" />
          <Text style={styles.addBtnText}>+500 ml (Chai)</Text>
        </TouchableOpacity>

        {todayWaterMl > 0 && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    titleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    waterIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#E0F2FE',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusWrap: {
      alignItems: 'flex-end',
    },
    progressText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    currentMl: {
      fontWeight: '700',
      color: '#0284C7',
    },
    percentText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#0284C7',
      marginTop: 2,
    },
    progressTrack: {
      height: 8,
      backgroundColor: colors.borderLight,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 14,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#38BDF8',
      borderRadius: 4,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    addBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#E0F2FE',
      paddingVertical: 10,
      borderRadius: 10,
    },
    addBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#0284C7',
    },
    resetBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default WaterCard;

