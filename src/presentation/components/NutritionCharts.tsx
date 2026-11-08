import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { NutritionReport } from '../../domain/services/ReportAggregator';
import { AppColors, useAppTheme } from '../theme';

interface CaloriesChartProps {
  report: NutritionReport;
  goal: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CaloriesChart({ report, goal, selectedDate, onSelectDate }: CaloriesChartProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const maxValue = Math.max(goal, ...report.days.map((day) => day.calories), 1) * 1.15;
  const selected = report.days.find((day) => day.date === selectedDate) ?? report.days[0];
  const summary = report.days
    .filter((day) => day.hasRecords)
    .map((day) => `${day.dayLabel}: ${Math.round(day.calories)} kilocalories`)
    .join(', ');
  const chartWidth = report.period === 'month' ? Math.max(620, report.days.length * 24) : 330;

  return (
    <View accessible accessibilityLabel={`Biểu đồ calo. ${summary || 'Chưa có dữ liệu trong kỳ.'}`}>
      <View style={styles.selectedSummary}>
        <Text style={styles.selectedLabel}>{selected?.date ?? report.startDate}</Text>
        <Text style={styles.selectedValue}>{Math.round(selected?.calories ?? 0)} kcal</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chart, { width: chartWidth }]}>
          <View style={[styles.goalLine, { bottom: `${Math.min((goal / maxValue) * 100, 100)}%` }]}>
            <Text style={styles.goalLabel}>Mục tiêu {Math.round(goal)}</Text>
          </View>
          {report.days.map((day, index) => {
            const selectedDay = day.date === selectedDate;
            const showLabel = report.period === 'week' || index === 0 || (index + 1) % 5 === 0 || index === report.days.length - 1;
            return (
              <Pressable
                key={day.date}
                style={styles.barColumn}
                onPress={() => onSelectDate(day.date)}
                accessibilityRole="button"
                accessibilityLabel={`${day.date}, ${Math.round(day.calories)} kilocalories`}
                accessibilityState={{ selected: selectedDay }}
              >
                <Text style={styles.barValue}>{day.calories > 0 ? Math.round(day.calories) : ''}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(day.calories > 0 ? 4 : 0, (day.calories / maxValue) * 100)}%`,
                        backgroundColor: selectedDay ? colors.primary : colors.neonMintLight,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, selectedDay && styles.dayLabelSelected]}>
                  {showLabel ? day.dayLabel : ' '}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

interface MacroDonutProps {
  protein: number;
  carbs: number;
  fat: number;
}

export function MacroDonut({ protein, carbs, fat }: MacroDonutProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const values = [
    { label: 'Protein', grams: protein, calories: protein * 4, color: colors.purple },
    { label: 'Carbohydrate', grams: carbs, calories: carbs * 4, color: colors.accent },
    { label: 'Chất béo', grams: fat, calories: fat * 9, color: colors.yellow },
  ];
  const total = values.reduce((sum, item) => sum + item.calories, 0);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const description = values
    .map((item) => `${item.label} ${total > 0 ? Math.round((item.calories / total) * 100) : 0} phần trăm`)
    .join(', ');

  return (
    <View style={styles.donutRow} accessible accessibilityLabel={`Phân bố dinh dưỡng: ${description}`}>
      <View style={styles.donut}>
        <Svg width={124} height={124} accessibilityElementsHidden>
          <Circle cx={62} cy={62} r={radius} fill="none" stroke={colors.borderLight} strokeWidth={18} />
          {values.map((item) => {
            const length = total > 0 ? (item.calories / total) * circumference : 0;
            const circle = (
              <Circle
                key={item.label}
                cx={62}
                cy={62}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={18}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                rotation="-90"
                origin="62, 62"
              />
            );
            offset += length;
            return circle;
          })}
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={styles.donutCenterValue}>{Math.round(protein + carbs + fat)}g</Text>
          <Text style={styles.donutCenterLabel}>tổng macro</Text>
        </View>
      </View>
      <View style={styles.legend}>
        {values.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>
                {Math.round(item.grams)}g · {total > 0 ? Math.round((item.calories / total) * 100) : 0}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    selectedSummary: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    selectedLabel: { color: colors.textSecondary, fontSize: 13 },
    selectedValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
    chart: { alignItems: 'flex-end', flexDirection: 'row', height: 220, paddingTop: 24, position: 'relative' },
    goalLine: { borderTopColor: colors.warning, borderTopWidth: 1, left: 0, position: 'absolute', right: 0, zIndex: 2 },
    goalLabel: { backgroundColor: colors.card, color: colors.warning, fontSize: 10, left: 0, paddingRight: 4, position: 'absolute', top: -15 },
    barColumn: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', minWidth: 22 },
    barValue: { color: colors.textMuted, fontSize: 9, height: 15 },
    barTrack: { height: 155, justifyContent: 'flex-end', width: 14 },
    bar: { borderRadius: 7, minHeight: 1, width: '100%' },
    dayLabel: { color: colors.textMuted, fontSize: 11, height: 18, marginTop: 6 },
    dayLabelSelected: { color: colors.primaryDark, fontWeight: '800' },
    donutRow: { alignItems: 'center', flexDirection: 'row', gap: 20 },
    donut: { height: 124, width: 124 },
    donutCenter: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
    donutCenterValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
    donutCenterLabel: { color: colors.textMuted, fontSize: 10 },
    legend: { flex: 1, gap: 12 },
    legendRow: { alignItems: 'center', flexDirection: 'row', gap: 9 },
    legendDot: { borderRadius: 5, height: 10, width: 10 },
    legendText: { flex: 1 },
    legendLabel: { color: colors.text, fontSize: 13, fontWeight: '700' },
    legendValue: { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  });
