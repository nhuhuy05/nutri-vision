import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportPeriod } from '../../domain/services/ReportAggregator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaloriesChart, MacroBar, MacroDonut, OfflineBanner } from '../components';
import { useNutritionReport } from '../hooks/useNutritionReport';
import { useAuthStore, useGoalStore, useUIStore } from '../store';
import { GUEST_USER_ID } from '../../domain/constants/defaultGoals';
import { AppColors, useAppTheme } from '../theme';

const shiftPeriod = (iso: string, period: ReportPeriod, amount: number) => {
  const date = new Date(`${iso}T12:00:00`);
  if (period === 'week') date.setDate(date.getDate() + amount * 7);
  else {
    date.setDate(1);
    date.setMonth(date.getMonth() + amount);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(
    new Date(`${iso}T12:00:00`)
  );

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedDate, setSelectedDate } = useUIStore();
  const { goals, loadGoals } = useGoalStore();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [chartDate, setChartDate] = useState(selectedDate);
  const { data: report, isLoading, error, refetch } = useNutritionReport(selectedDate, period);

  useEffect(() => {
    loadGoals(user?.id || GUEST_USER_ID);
  }, [loadGoals, user?.id]);

  const effectiveChartDate =
    report?.days.some((day) => day.date === chartDate)
      ? chartDate
      : report?.days.find((day) => day.hasRecords)?.date ?? report?.startDate ?? selectedDate;

  const periodDays = period === 'week' ? 7 : report?.days.length ?? 1;
  const periodGoal = goals.calories * periodDays;
  const goalPercentage = report && periodGoal > 0 ? Math.round((report.totalCalories / periodGoal) * 100) : 0;
  const difference = (report?.totalCalories ?? 0) - periodGoal;
  const recordedDays = report?.days.filter((day) => day.hasRecords) ?? [];
  const highest = recordedDays.reduce<(typeof recordedDays)[number] | undefined>(
    (best, day) => (!best || day.calories > best.calories ? day : best),
    undefined
  );
  const lowest = recordedDays.reduce<(typeof recordedDays)[number] | undefined>(
    (best, day) => (!best || day.calories < best.calories ? day : best),
    undefined
  );
  const mostConsistent = recordedDays.reduce<(typeof recordedDays)[number] | undefined>(
    (best, day) =>
      !best || Math.abs(day.calories - goals.calories) < Math.abs(best.calories - goals.calories)
        ? day
        : best,
    undefined
  );
  const reachedGoal = recordedDays.filter(
    (day) => goals.calories > 0 && day.calories >= goals.calories * 0.9 && day.calories <= goals.calories * 1.1
  ).length;
  const divisor = Math.max(report?.daysWithRecords ?? 0, 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê dinh dưỡng</Text>
        <View style={styles.segment} accessibilityRole="tablist">
          {(['week', 'month'] as const).map((value) => {
            const selected = period === value;
            return (
              <Pressable
                key={value}
                style={[styles.segmentButton, selected && styles.segmentSelected]}
                onPress={() => setPeriod(value)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={value === 'week' ? 'Theo tuần' : 'Theo tháng'}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                  {value === 'week' ? 'Tuần' : 'Tháng'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.periodNavigator}>
          <Pressable
            style={styles.periodArrow}
            onPress={() => setSelectedDate(shiftPeriod(selectedDate, period, -1))}
            accessibilityRole="button"
            accessibilityLabel={period === 'week' ? 'Tuần trước' : 'Tháng trước'}
          >
            <Ionicons name="chevron-back" color={colors.text} size={21} />
          </Pressable>
          <View style={styles.periodTextWrap}>
            <Text style={styles.periodLabel}>{period === 'week' ? 'TUẦN ĐANG XEM' : 'THÁNG ĐANG XEM'}</Text>
            <Text style={styles.periodValue}>
              {report ? `${shortDate(report.startDate)} – ${shortDate(report.endDate)}` : 'Đang tải...'}
            </Text>
          </View>
          <Pressable
            style={styles.periodArrow}
            onPress={() => setSelectedDate(shiftPeriod(selectedDate, period, 1))}
            accessibilityRole="button"
            accessibilityLabel={period === 'week' ? 'Tuần sau' : 'Tháng sau'}
          >
            <Ionicons name="chevron-forward" color={colors.text} size={21} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Đang tổng hợp dữ liệu...</Text>
        </View>
      ) : error || !report ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" color={colors.danger} size={42} />
          <Text style={styles.stateTitle}>Không thể tải báo cáo</Text>
          <Text style={styles.stateText}>{error?.message ?? 'Dữ liệu không khả dụng.'}</Text>
          <Pressable style={styles.retry} onPress={() => refetch()} accessibilityRole="button">
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={async () => {
                await refetch();
              }}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeading}>
              <View>
                <Text style={styles.cardEyebrow}>TỔNG QUAN CALO</Text>
                <Text style={styles.totalCalories}>{Math.round(report.totalCalories).toLocaleString('vi-VN')}</Text>
                <Text style={styles.totalUnit}>kcal trong {period === 'week' ? 'tuần' : 'tháng'}</Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentValue}>{goalPercentage}%</Text>
                <Text style={styles.percentLabel}>mục tiêu</Text>
              </View>
            </View>
            <View style={styles.metricGrid}>
              <Metric label="Trung bình/ngày" value={`${Math.round(report.averageCalories)} kcal`} styles={styles} />
              <Metric label="Mục tiêu/ngày" value={`${Math.round(goals.calories)} kcal`} styles={styles} />
              <Metric
                label={difference > 0 ? 'Vượt trong kỳ' : 'Còn trong kỳ'}
                value={`${Math.round(Math.abs(difference)).toLocaleString('vi-VN')} kcal`}
                styles={styles}
              />
              <Metric label="Ngày có dữ liệu" value={`${report.daysWithRecords}/${periodDays}`} styles={styles} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{period === 'week' ? 'Calo theo ngày' : 'Xu hướng calo tháng'}</Text>
                <Text style={styles.cardSubtitle}>Chạm một cột để xem chi tiết</Text>
              </View>
              <Ionicons name="bar-chart-outline" color={colors.primaryDark} size={22} />
            </View>
            <CaloriesChart report={report} goal={goals.calories} selectedDate={effectiveChartDate} onSelectDate={setChartDate} />
          </View>

          <Text style={styles.sectionTitle}>Trung bình dinh dưỡng mỗi ngày</Text>
          <View style={styles.card}>
            <MacroBar label="Protein" consumed={report.totalProtein / divisor} goal={goals.protein} unit="g" color={colors.purple} />
            <MacroBar label="Carbohydrate" consumed={report.totalCarbs / divisor} goal={goals.carbs} unit="g" color={colors.accent} />
            <MacroBar label="Chất béo" consumed={report.totalFat / divisor} goal={goals.fat} unit="g" color={colors.yellow} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Phân bố macronutrient</Text>
            <Text style={styles.cardSubtitle}>Tỷ lệ năng lượng từ protein, carbohydrate và chất béo</Text>
            <View style={styles.donutSpacing}>
              <MacroDonut protein={report.totalProtein} carbs={report.totalCarbs} fat={report.totalFat} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Nhận định từ dữ liệu</Text>
          {recordedDays.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="analytics-outline" color={colors.primaryDark} size={30} />
              <Text style={styles.emptyTitle}>Chưa đủ dữ liệu</Text>
              <Text style={styles.emptyText}>Ghi lại bữa ăn để xem nhận định cho kỳ này. Không có dữ liệu mẫu được trộn vào nhật ký của bạn.</Text>
            </View>
          ) : (
            <View style={styles.insightGrid}>
              <Insight icon="calendar-outline" title="Ngày gần mục tiêu nhất" value={mostConsistent ? `${shortDate(mostConsistent.date)} · ${Math.round(mostConsistent.calories)} kcal` : '—'} styles={styles} colors={colors} />
              <Insight icon="checkmark-circle-outline" title="Ngày đạt 90–110% mục tiêu" value={`${reachedGoal} ngày`} styles={styles} colors={colors} />
              <Insight icon="trending-up-outline" title="Ngày cao nhất" value={highest ? `${shortDate(highest.date)} · ${Math.round(highest.calories)} kcal` : '—'} styles={styles} colors={colors} />
              <Insight icon="trending-down-outline" title="Ngày thấp nhất" value={lowest ? `${shortDate(lowest.date)} · ${Math.round(lowest.calories)} kcal` : '—'} styles={styles} colors={colors} />
            </View>
          )}

          {period === 'month' && (
            <View style={styles.monthSummary}>
              <Ionicons name="document-text-outline" color={colors.primaryDark} size={24} />
              <View style={styles.monthSummaryBody}>
                <Text style={styles.monthSummaryTitle}>Tóm tắt dinh dưỡng tháng</Text>
                <Text style={styles.monthSummaryText}>
                  Có {report.daysWithRecords} ngày được ghi nhận, tổng {Math.round(report.totalCalories).toLocaleString('vi-VN')} kcal và trung bình {Math.round(report.averageCalories)} kcal trên mỗi ngày có dữ liệu.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Metric({ label, value, styles }: { label: string; value: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Insight({
  icon,
  title,
  value,
  styles,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) {
  return (
    <View style={styles.insightCard} accessible accessibilityLabel={`${title}: ${value}`}>
      <Ionicons name={icon} size={21} color={colors.primaryDark} />
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10 },
    brand: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
    title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7, marginTop: 3 },
    segment: { backgroundColor: colors.borderLight, borderRadius: 12, flexDirection: 'row', marginTop: 14, padding: 4 },
    segmentButton: { alignItems: 'center', borderRadius: 9, flex: 1, justifyContent: 'center', minHeight: 44 },
    segmentSelected: { backgroundColor: colors.card },
    segmentText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
    segmentTextSelected: { color: colors.primaryDark, fontWeight: '900' },
    periodNavigator: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    periodArrow: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
    periodTextWrap: { alignItems: 'center' },
    periodLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
    periodValue: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
    content: { padding: 16, paddingBottom: 120 },
    state: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
    stateTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 10 },
    stateText: { color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
    retry: { backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', marginTop: 18, minHeight: 48, paddingHorizontal: 24 },
    retryText: { color: colors.inverseText, fontWeight: '800' },
    overviewCard: { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderRadius: 20, borderWidth: 1, marginBottom: 14, padding: 18 },
    overviewHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
    cardEyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
    totalCalories: { color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
    totalUnit: { color: colors.textSecondary, fontSize: 12 },
    percentBadge: { alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
    percentValue: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
    percentLabel: { color: colors.textSecondary, fontSize: 10 },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
    metric: { backgroundColor: colors.card, borderRadius: 12, minHeight: 66, padding: 10, width: '48.5%' },
    metricLabel: { color: colors.textSecondary, fontSize: 11 },
    metricValue: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 4 },
    card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20, borderWidth: 1, marginBottom: 14, padding: 17 },
    cardHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
    cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
    cardSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 9, marginTop: 5 },
    donutSpacing: { marginTop: 18 },
    insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    insightCard: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16, borderWidth: 1, minHeight: 120, padding: 14, width: '48.5%' },
    insightTitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 9 },
    insightValue: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 19, marginTop: 5 },
    emptyCard: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 22 },
    emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 9 },
    emptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 5, textAlign: 'center' },
    monthSummary: { alignItems: 'flex-start', backgroundColor: colors.primaryLight, borderColor: colors.primary, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 16 },
    monthSummaryBody: { flex: 1 },
    monthSummaryTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
    monthSummaryText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  });

export default ReportsScreen;
