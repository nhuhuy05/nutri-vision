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
import { useAppTheme } from '../theme/colors';
import { useGoalStore, useAuthStore, useUIStore } from '../store';
import { useDiary } from '../hooks/useDiary';
import { useSync } from '../hooks/useSync';
import { MacroBar, OfflineBanner, CalorieRing } from '../components';

export function DashboardScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const { selectedDate } = useUIStore();
  const { logs, isLoading, refetch } = useDiary(selectedDate);
  const { syncNow } = useSync();
  const { goals } = useGoalStore();

  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = logs.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = logs.reduce((sum, item) => sum + item.fat, 0);

  const remainingCalories = Math.max(0, goals.calories - totalCalories);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            refetch();
            syncNow();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <OfflineBanner />

      {/* Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Xin chào, {user?.name || 'Bạn'} 👋
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            Hôm nay bạn đã ăn uống thế nào rồi?
          </Text>
        </View>
      </View>

      {/* Main Calories Card with CalorieRing */}
      <View
        style={[
          styles.calorieCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.cardShadow,
          },
        ]}
      >
        <View style={styles.calorieTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>
              Năng lượng tiêu thụ
            </Text>
            <Text style={[styles.calorieValue, { color: colors.text }]}>
              {Math.round(totalCalories)}{' '}
              <Text style={[styles.calorieGoal, { color: colors.textMuted }]}>
                / {goals.calories} kcal
              </Text>
            </Text>

            <View
              style={[
                styles.remainingBadge,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="flame" size={16} color={colors.primary} />
              <Text style={[styles.remainingText, { color: colors.primaryDark }]}>
                Còn lại: <Text style={{ fontWeight: '700' }}>{Math.round(remainingCalories)} kcal</Text>
              </Text>
            </View>
          </View>

          <View style={styles.ringContainer}>
            <CalorieRing
              consumed={totalCalories}
              goal={goals.calories}
              size={120}
              stroke={12}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {/* Macro Bars */}
        <MacroBar
          label="Chất đạm (Protein)"
          consumed={totalProtein}
          goal={goals.protein}
          unit="g"
          color={colors.purple}
        />
        <MacroBar
          label="Tinh bột (Carbs)"
          consumed={totalCarbs}
          goal={goals.carbs}
          unit="g"
          color={colors.accent}
        />
        <MacroBar
          label="Chất béo (Fat)"
          consumed={totalFat}
          goal={goals.fat}
          unit="g"
          color={colors.yellow}
        />
      </View>

      {/* Quick Action Shortcuts */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Thao tác nhanh</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color={colors.primaryDark} />
          <Text style={[styles.actionBtnTitle, { color: colors.primaryDark }]}>
            Quét AI
          </Text>
          <Text style={[styles.actionBtnDesc, { color: colors.textSecondary }]}>
            Nhận diện món ăn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => router.push('/modal/manual-entry')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={24} color={colors.secondary} />
          <Text style={[styles.actionBtnTitle, { color: colors.secondary }]}>
            Tìm kiếm
          </Text>
          <Text style={[styles.actionBtnDesc, { color: colors.textSecondary }]}>
            Nhập món thủ công
          </Text>
        </TouchableOpacity>
      </View>

      {/* Today's Log Summary */}
      <View style={styles.recentHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Món ăn hôm nay ({logs.length})
        </Text>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/(tabs)/diary')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>Xem nhật ký →</Text>
        </TouchableOpacity>
      </View>

      {logs.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="restaurant-outline" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có món ăn nào hôm nay</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Hãy chụp ảnh hoặc tìm kiếm để ghi lại bữa ăn đầu tiên nhé!
          </Text>
        </View>
      ) : (
        logs.slice(0, 4).map((log) => (
          <View
            key={log.id}
            style={[
              styles.logCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.logName, { color: colors.text }]}>{log.foodName}</Text>
              <Text style={[styles.logDetails, { color: colors.textSecondary }]}>
                Bữa: {log.mealType.toUpperCase()} • {log.portionMultiplier}x phần
              </Text>
            </View>
            <Text style={[styles.logCalories, { color: colors.primary }]}>
              {Math.round(log.calories)} kcal
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 4,
  },
  calorieCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  calorieTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  calorieGoal: {
    fontSize: 16,
    fontWeight: '500',
  },
  ringContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginTop: 10,
  },
  remainingText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    minHeight: 88,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  actionBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  actionBtnDesc: {
    fontSize: 16,
    marginTop: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  viewAllBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: '700',
  },
  logDetails: {
    fontSize: 16,
    marginTop: 2,
  },
  logCalories: {
    fontSize: 16,
    fontWeight: '700',
  },
});
