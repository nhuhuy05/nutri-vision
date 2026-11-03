import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useMealStore } from '../../store/mealStore';
import { useGoalStore } from '../../store/goalStore';
import { MacroBar } from '../../components/MacroBar';

export default function ReportsScreen() {
  const { logs } = useMealStore();
  const { goals } = useGoalStore();

  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = logs.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = logs.reduce((sum, item) => sum + item.fat, 0);

  const caloryPercentage = Math.round((totalCalories / (goals.calories || 1)) * 100);

  // Mock 7-day calorie distribution for demonstration
  const weekDays = [
    { day: 'T2', calories: 1850 },
    { day: 'T3', calories: 2100 },
    { day: 'T4', calories: 1920 },
    { day: 'T5', calories: 2050 },
    { day: 'T6', calories: 1980 },
    { day: 'T7', calories: 2250 },
    { day: 'CN', calories: Math.round(totalCalories) || 1900 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overview Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tóm tắt hôm nay</Text>
        <Text style={styles.cardSub}>Đạt {caloryPercentage}% mục tiêu năng lượng đề ra</Text>

        <View style={styles.macroList}>
          <MacroBar
            label="Năng lượng (Calories)"
            consumed={totalCalories}
            goal={goals.calories}
            unit="kcal"
            color={COLORS.primary}
          />
          <MacroBar
            label="Chất đạm (Protein)"
            consumed={totalProtein}
            goal={goals.protein}
            unit="g"
            color={COLORS.purple}
          />
          <MacroBar
            label="Tinh bột (Carbs)"
            consumed={totalCarbs}
            goal={goals.carbs}
            unit="g"
            color={COLORS.accent}
          />
          <MacroBar
            label="Chất béo (Fat)"
            consumed={totalFat}
            goal={goals.fat}
            unit="g"
            color={COLORS.yellow}
          />
        </View>
      </View>

      {/* 7-Day Trend Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Xu hướng tiêu thụ trong tuần (kcal)</Text>
        <Text style={styles.cardSub}>Mục tiêu ngày: {goals.calories} kcal</Text>

        <View style={styles.chartContainer}>
          {weekDays.map((item, index) => {
            const heightPercent = Math.min(Math.round((item.calories / 2500) * 100), 100);
            const isToday = index === weekDays.length - 1;
            return (
              <View key={item.day} style={styles.barColumn}>
                <Text style={styles.barValue}>{item.calories}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: isToday ? COLORS.primary : '#CBD5E1',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barDay,
                    isToday && { color: COLORS.primaryDark, fontWeight: '700' },
                  ]}
                >
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Health Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Lời khuyên dinh dưỡng</Text>
        <Text style={styles.tipText}>
          Bổ sung thêm rau xanh và uống đủ 2 lít nước mỗi ngày giúp tăng cường trao đổi chất
          và giữ cơ thể luôn tràn đầy năng lượng!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  macroList: {
    marginTop: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginTop: 16,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 20,
    height: 110,
    backgroundColor: COLORS.borderLight,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  barDay: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  tipCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  tipText: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 4,
    lineHeight: 18,
  },
});

