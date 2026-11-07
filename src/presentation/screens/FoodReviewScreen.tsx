import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { FoodItem } from '../../domain/entities/FoodItem';
import { MealType } from '../../domain/entities/MealType';
import { getFoodByIdUseCase } from '../../di/container';
import { useAuthStore, useUIStore } from '../store';
import { useDiary } from '../hooks/useDiary';
import { notify } from '../utils/notify';

const PORTION_OPTIONS = [
  { label: '0.5x (Ít / Nửa phần)', value: 0.5 },
  { label: '1.0x (Chuẩn 1 suất)', value: 1.0 },
  { label: '1.5x (Nhiều)', value: 1.5 },
  { label: '2.0x (Gấp đôi)', value: 2.0 },
];

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Bữa sáng' },
  { type: 'lunch', label: 'Bữa trưa' },
  { type: 'dinner', label: 'Bữa tối' },
  { type: 'snack', label: 'Bữa phụ' },
];

export function FoodReviewScreen() {
  const params = useLocalSearchParams<{ foodId?: string; photoUri?: string }>();
  const { user } = useAuthStore();
  const { selectedDate } = useUIStore();
  const { addMeal } = useDiary(selectedDate);

  const [food, setFood] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState<number>(1.0);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchFood() {
      if (params.foodId) {
        const result = await getFoodByIdUseCase.execute(params.foodId);
        if (result.success && result.data) {
          setFood(result.data);
          return;
        }
      }
      // Fallback: try fetching first food
      const defaultResult = await getFoodByIdUseCase.execute('pho-bo');
      if (defaultResult.success && defaultResult.data) {
        setFood(defaultResult.data);
      }
    }
    fetchFood();
  }, [params.foodId]);

  if (!food) {
    return (
      <View style={styles.center}>
        <Text>Đang tải thông tin món ăn...</Text>
      </View>
    );
  }

  const calculatedCalories = Math.round(food.calories * portion);
  const calculatedProtein = Math.round(food.protein * portion * 10) / 10;
  const calculatedCarbs = Math.round(food.carbs * portion * 10) / 10;
  const calculatedFat = Math.round(food.fat * portion * 10) / 10;

  const handleSaveToDiary = async () => {
    setIsSaving(true);
    try {
      await addMeal({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: user?.id || 'guest_user',
        date: selectedDate,
        mealType: selectedMealType,
        foodId: food.id,
        foodName: food.name,
        portionMultiplier: portion,
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fat: calculatedFat,
        photoUri: params.photoUri,
        createdAt: new Date().toISOString(),
        synced: false,
      });

      notify.success(
        'Đã lưu thành công! 🎉',
        `Đã thêm ${food.name} vào ${
          MEAL_TYPES.find((m) => m.type === selectedMealType)?.label
        }.`,
        () => router.replace('/(tabs)/diary')
      );
    } catch (err) {
      console.error('Save meal error:', err);
      notify.error('Lỗi', 'Không thể lưu món ăn vào nhật ký.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo thumbnail if available */}
      {params.photoUri && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: params.photoUri }} style={styles.photo} />
        </View>
      )}

      {/* Food Header Card */}
      <View style={styles.card}>
        <Text style={styles.dishName}>{food.name}</Text>
        <Text style={styles.dishSub}>
          {food.category} • {food.servingUnit} ({food.servingWeightGrams}g)
        </Text>

        <View style={styles.nutritionBox}>
          <View style={styles.calorieHighlight}>
            <Text style={styles.calorieNumber}>{calculatedCalories}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{calculatedProtein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{calculatedCarbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{calculatedFat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Select Meal Type */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Chọn bữa ăn</Text>
        <View style={styles.mealTypeRow}>
          {MEAL_TYPES.map((m) => (
            <TouchableOpacity
              key={m.type}
              style={[
                styles.mealTypeChip,
                selectedMealType === m.type && styles.mealTypeChipActive,
              ]}
              onPress={() => setSelectedMealType(m.type)}
            >
              <Text
                style={[
                  styles.mealTypeText,
                  selectedMealType === m.type && styles.mealTypeTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Portion Adjustment */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Điều chỉnh khẩu phần ăn</Text>
        <Text style={styles.sectionDesc}>
          Khối lượng ước tính:{' '}
          <Text style={{ fontWeight: '700' }}>
            {Math.round(food.servingWeightGrams * portion)} grams
          </Text>
        </Text>

        <View style={styles.portionOptions}>
          {PORTION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.portionBtn,
                portion === opt.value && styles.portionBtnActive,
              ]}
              onPress={() => setPortion(opt.value)}
            >
              <Text
                style={[
                  styles.portionText,
                  portion === opt.value && styles.portionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
        onPress={handleSaveToDiary}
        disabled={isSaving}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.saveBtnText}>
          {isSaving ? 'Đang lưu vào SQLite...' : 'Xác nhận & Lưu nhật ký'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  photoContainer: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dishName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  dishSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  nutritionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  calorieHighlight: {
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  calorieUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  macroGrid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  macroLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  mealTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
  },
  mealTypeChipActive: {
    backgroundColor: COLORS.primary,
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  portionOptions: {
    gap: 8,
  },
  portionBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  portionBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  portionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  portionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FoodReviewScreen;

