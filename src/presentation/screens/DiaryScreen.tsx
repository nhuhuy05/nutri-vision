import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealLog, MealType } from '../../domain/entities';
import { GUEST_USER_ID } from '../../domain/constants/defaultGoals';
import {
  DailyNutritionSummary,
  FoodForm,
  FoodFormValue,
  MealSection,
  OfflineBanner,
} from '../components';
import { useDiary } from '../hooks/useDiary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore, useGoalStore, useUIStore } from '../store';
import { AppColors, useAppTheme } from '../theme';
import { notify } from '../utils/notify';

const MEALS: { type: MealType; title: string }[] = [
  { type: 'breakfast', title: 'Bữa sáng' },
  { type: 'lunch', title: 'Bữa trưa' },
  { type: 'dinner', title: 'Bữa tối' },
  { type: 'snack', title: 'Bữa phụ' },
];

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`));

export function DiaryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedDate, setSelectedDate } = useUIStore();
  const { goals, loadGoals } = useGoalStore();
  const { user } = useAuthStore();
  const { logs, isLoading, error, refetch, addMeal, deleteMeal, isAdding } = useDiary(selectedDate);
  const [formMeal, setFormMeal] = useState<MealType>('breakfast');
  const [editingLog, setEditingLog] = useState<MealLog | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [dateVisible, setDateVisible] = useState(false);
  const [dateInput, setDateInput] = useState(selectedDate);

  useEffect(() => {
    loadGoals(user?.id || GUEST_USER_ID);
  }, [loadGoals, user?.id]);

  const totals = logs.reduce(
    (sum, log) => ({
      calories: sum.calories + log.calories,
      protein: sum.protein + log.protein,
      carbs: sum.carbs + log.carbs,
      fat: sum.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const changeDate = (days: number) => {
    const next = new Date(`${selectedDate}T12:00:00`);
    next.setDate(next.getDate() + days);
    setSelectedDate(toIsoDate(next));
  };

  const openAdd = (mealType: MealType) => {
    setEditingLog(null);
    setFormMeal(mealType);
    setFormVisible(true);
  };

  const openEdit = (log: MealLog) => {
    setEditingLog(log);
    setFormMeal(log.mealType);
    setFormVisible(true);
  };

  const saveFood = async (value: FoodFormValue) => {
    try {
      const now = new Date().toISOString();
      await addMeal({
        id: editingLog?.id ?? `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: editingLog?.userId ?? user?.id ?? GUEST_USER_ID,
        date: selectedDate,
        mealType: value.mealType,
        foodId: editingLog?.foodId ?? `manual_${Date.now()}`,
        foodName: value.foodName,
        portionMultiplier: value.portionMultiplier,
        calories: value.calories,
        protein: value.protein,
        carbs: value.carbs,
        fat: value.fat,
        photoUri: value.photoUri,
        createdAt: editingLog?.createdAt ?? now,
        updatedAt: now,
        synced: false,
      });
      setFormVisible(false);
      notify.toast(editingLog ? 'Đã cập nhật món ăn' : 'Đã thêm món vào nhật ký');
    } catch {
      notify.error('Không thể lưu món ăn', 'Vui lòng kiểm tra dữ liệu và thử lại.');
    }
  };

  const confirmDelete = (id: string) => {
    notify.confirm(
      'Xóa món ăn?',
      'Món ăn sẽ được xóa khỏi nhật ký và cập nhật khi đồng bộ.',
      async () => {
        try {
          await deleteMeal(id);
          notify.toast('Đã xóa món ăn');
        } catch {
          notify.error('Không thể xóa', 'Vui lòng thử lại.');
        }
      },
      undefined,
      'Xóa',
      'Hủy'
    );
  };

  const applyDate = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput) && !Number.isNaN(new Date(`${dateInput}T12:00:00`).valueOf())) {
      setSelectedDate(dateInput);
      setDateVisible(false);
    } else {
      notify.error('Ngày không hợp lệ', 'Vui lòng nhập theo định dạng YYYY-MM-DD.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <OfflineBanner />
      <View style={styles.hero}>
        <Text style={styles.screenTitle}>Nhật ký ăn uống</Text>
        <View style={styles.dateSelector}>
          <Pressable
            style={styles.dateArrow}
            onPress={() => changeDate(-1)}
            accessibilityRole="button"
            accessibilityLabel="Ngày trước"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            style={styles.dateCenter}
            onPress={() => {
              setDateInput(selectedDate);
              setDateVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Chọn ngày, hiện tại ${formatDate(selectedDate)}`}
            accessibilityHint="Mở hộp nhập ngày"
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primaryDark} />
            <View>
              <Text style={styles.dateLabel}>
                {selectedDate === toIsoDate(new Date()) ? 'Hôm nay' : 'Ngày đã chọn'}
              </Text>
              <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.dateArrow}
            onPress={() => changeDate(1)}
            accessibilityRole="button"
            accessibilityLabel="Ngày tiếp theo"
          >
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Đang tải nhật ký...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Ionicons name="alert-circle-outline" size={42} color={colors.danger} />
          <Text style={styles.stateTitle}>Không thể tải nhật ký</Text>
          <Text style={styles.stateText}>{error.message}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()} accessibilityRole="button">
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
          <DailyNutritionSummary {...totals} goals={goals} />
          {logs.length === 0 && (
            <View style={styles.emptyDiary}>
              <Ionicons name="leaf-outline" size={28} color={colors.primaryDark} />
              <View style={styles.emptyDiaryText}>
                <Text style={styles.emptyDiaryTitle}>Bắt đầu nhật ký hôm nay</Text>
                <Text style={styles.emptyDiaryBody}>Thêm món ăn để theo dõi calo và dinh dưỡng.</Text>
              </View>
              <Pressable style={styles.emptyDiaryButton} onPress={() => openAdd('breakfast')} accessibilityRole="button">
                <Ionicons name="add" size={22} color={colors.inverseText} />
              </Pressable>
            </View>
          )}
          {MEALS.map((meal) => (
            <MealSection
              key={meal.type}
              title={meal.title}
              type={meal.type}
              logs={logs.filter((log) => log.mealType === meal.type)}
              onAddPress={() => openAdd(meal.type)}
              onEditPress={openEdit}
              onDeletePress={confirmDelete}
            />
          ))}
        </ScrollView>
      )}

      {formVisible && (
        <FoodForm
          visible
          initialMealType={formMeal}
          log={editingLog}
          isSaving={isAdding}
          onCancel={() => setFormVisible(false)}
          onSave={saveFood}
        />
      )}

      <Modal visible={dateVisible} transparent animationType="fade" onRequestClose={() => setDateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.dateModal}>
            <Text style={styles.dateModalTitle}>Chọn ngày nhật ký</Text>
            <Text style={styles.dateModalHelp}>Nhập ngày theo định dạng YYYY-MM-DD</Text>
            <TextInput
              value={dateInput}
              onChangeText={setDateInput}
              style={styles.dateInput}
              placeholder="2026-01-31"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Ngày nhật ký"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setDateVisible(false)} accessibilityRole="button">
                <Text style={styles.modalCancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.modalApply} onPress={applyDate} accessibilityRole="button">
                <Text style={styles.modalApplyText}>Chọn ngày</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    hero: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10 },
    brand: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
    screenTitle: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7, marginTop: 3 },
    dateSelector: { alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginTop: 14 },
    dateArrow: { alignItems: 'center', height: 52, justifyContent: 'center', width: 48 },
    dateCenter: { alignItems: 'center', borderColor: colors.borderLight, borderLeftWidth: 1, borderRightWidth: 1, flex: 1, flexDirection: 'row', gap: 9, justifyContent: 'center', minHeight: 52, paddingHorizontal: 8 },
    dateLabel: { color: colors.text, fontSize: 13, fontWeight: '800', textAlign: 'center' },
    dateValue: { color: colors.textSecondary, fontSize: 11, marginTop: 1, textAlign: 'center', textTransform: 'capitalize' },
    content: { padding: 16, paddingBottom: 120 },
    state: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
    stateTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 10 },
    stateText: { color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' },
    retryButton: { backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', marginTop: 18, minHeight: 48, paddingHorizontal: 24 },
    retryText: { color: colors.inverseText, fontSize: 15, fontWeight: '800' },
    emptyDiary: { alignItems: 'center', backgroundColor: colors.primaryLight, borderColor: colors.primary, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 16, padding: 14 },
    emptyDiaryText: { flex: 1, marginHorizontal: 10 },
    emptyDiaryTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
    emptyDiaryBody: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
    emptyDiaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
    modalOverlay: { alignItems: 'center', backgroundColor: colors.overlay, flex: 1, justifyContent: 'center', padding: 24 },
    dateModal: { backgroundColor: colors.card, borderRadius: 20, padding: 20, width: '100%' },
    dateModalTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
    dateModalHelp: { color: colors.textSecondary, fontSize: 13, marginTop: 5 },
    dateInput: { backgroundColor: colors.inputBg, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 17, marginTop: 16, minHeight: 50, paddingHorizontal: 14 },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
    modalCancel: { alignItems: 'center', borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 },
    modalCancelText: { color: colors.text, fontWeight: '700' },
    modalApply: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, flex: 1.3, justifyContent: 'center', minHeight: 48 },
    modalApplyText: { color: colors.inverseText, fontWeight: '800' },
  });

export default DiaryScreen;
