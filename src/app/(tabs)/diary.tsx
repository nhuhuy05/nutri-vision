import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useMealStore } from '../../store/mealStore';
import { MealSection } from '../../components/MealSection';
import { OfflineBanner } from '../../components/OfflineBanner';
import { MealType } from '../../types/nutrition';

export default function DiaryScreen() {
  const { logs, selectedDate, setSelectedDate, removeMeal } = useMealStore();

  const breakfastLogs = logs.filter((l) => l.mealType === 'breakfast');
  const lunchLogs = logs.filter((l) => l.mealType === 'lunch');
  const dinnerLogs = logs.filter((l) => l.mealType === 'dinner');
  const snackLogs = logs.filter((l) => l.mealType === 'snack');

  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);

  const handleDelete = (id: string) => {
    Alert.alert('Xoá món ăn', 'Bạn có chắc chắn muốn xoá món này khỏi nhật ký?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => removeMeal(id),
      },
    ]);
  };

  const handleAddMeal = (mealType: MealType) => {
    // Navigate to manual-entry modal with default meal type
    router.push({
      pathname: '/modal/manual-entry',
      params: { defaultMealType: mealType },
    });
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* Date Header Switcher */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateTitle}>Hôm nay</Text>
          <Text style={styles.dateSub}>{selectedDate}</Text>
        </View>
        <TouchableOpacity style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Total Banner */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryLabel}>Tổng calo trong ngày:</Text>
        <Text style={styles.summaryValue}>
          {Math.round(totalCalories)} <Text style={styles.summaryUnit}>kcal</Text>
        </Text>
      </View>

      {/* Meal Sections */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MealSection
          title="Bữa sáng"
          type="breakfast"
          logs={breakfastLogs}
          onAddPress={() => handleAddMeal('breakfast')}
          onDeletePress={handleDelete}
        />

        <MealSection
          title="Bữa trưa"
          type="lunch"
          logs={lunchLogs}
          onAddPress={() => handleAddMeal('lunch')}
          onDeletePress={handleDelete}
        />

        <MealSection
          title="Bữa tối"
          type="dinner"
          logs={dinnerLogs}
          onAddPress={() => handleAddMeal('dinner')}
          onDeletePress={handleDelete}
        />

        <MealSection
          title="Bữa phụ & Ăn vặt"
          type="snack"
          logs={snackLogs}
          onAddPress={() => handleAddMeal('snack')}
          onDeletePress={handleDelete}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  arrowBtn: {
    padding: 6,
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dateSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  summaryUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
