import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useMealStore } from '../../store/mealStore';
import { useGoalStore } from '../../store/goalStore';
import { useAuthStore } from '../../store/authStore';
import { MacroBar } from '../../components/MacroBar';
import { OfflineBanner } from '../../components/OfflineBanner';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { logs, isLoading, loadLogs, syncData } = useMealStore();
  const { goals } = useGoalStore();

  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = logs.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = logs.reduce((sum, item) => sum + item.fat, 0);

  const remainingCalories = Math.max(0, goals.calories - totalCalories);
  const percentCalories = Math.min(Math.round((totalCalories / (goals.calories || 1)) * 100), 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            loadLogs();
            syncData();
          }}
        />
      }
    >
      <OfflineBanner />

      {/* Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {user?.name || 'Bạn'} 👋</Text>
          <Text style={styles.subGreeting}>Hôm nay bạn đã ăn uống thế nào rồi?</Text>
        </View>
      </View>

      {/* Main Calories Card */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieTop}>
          <View>
            <Text style={styles.calorieLabel}>Năng lượng tiêu thụ</Text>
            <Text style={styles.calorieValue}>
              {Math.round(totalCalories)}{' '}
              <Text style={styles.calorieGoal}>/ {goals.calories} kcal</Text>
            </Text>
          </View>
          <View style={styles.circleProgress}>
            <Text style={styles.circleText}>{percentCalories}%</Text>
          </View>
        </View>

        <View style={styles.remainingBadge}>
          <Ionicons name="flame" size={16} color={COLORS.primary} />
          <Text style={styles.remainingText}>
            Còn lại: <Text style={{ fontWeight: '700' }}>{Math.round(remainingCalories)} kcal</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Macro Bars */}
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

      {/* Quick Action Shortcuts */}
      <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight }]}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Ionicons name="camera" size={24} color={COLORS.primaryDark} />
          <Text style={[styles.actionBtnTitle, { color: COLORS.primaryDark }]}>
            Quét AI
          </Text>
          <Text style={styles.actionBtnDesc}>Nhận diện món ăn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
          onPress={() => router.push('/modal/manual-entry')}
        >
          <Ionicons name="search" size={24} color="#2563EB" />
          <Text style={[styles.actionBtnTitle, { color: '#2563EB' }]}>
            Tìm kiếm
          </Text>
          <Text style={styles.actionBtnDesc}>Nhập món thủ công</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Log Summary */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Món ăn hôm nay ({logs.length})</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/diary')}>
          <Text style={styles.viewAllText}>Xem nhật ký →</Text>
        </TouchableOpacity>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="restaurant-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Chưa có món ăn nào hôm nay</Text>
          <Text style={styles.emptyDesc}>
            Hãy chụp ảnh hoặc tìm kiếm để ghi lại bữa ăn đầu tiên nhé!
          </Text>
        </View>
      ) : (
        logs.slice(0, 4).map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.logName}>{log.foodName}</Text>
              <Text style={styles.logDetails}>
                Bữa: {log.mealType.toUpperCase()} • {log.portionMultiplier}x phần
              </Text>
            </View>
            <Text style={styles.logCalories}>{Math.round(log.calories)} kcal</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  calorieCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  calorieTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  calorieValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  calorieGoal: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  circleProgress: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  remainingText: {
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  actionBtnTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  actionBtnDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  logCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  logName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  logDetails: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

