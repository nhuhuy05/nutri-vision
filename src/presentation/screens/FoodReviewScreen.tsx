import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '../theme/colors';
import { FoodItem } from '../../domain/entities/FoodItem';
import { MealType } from '../../domain/entities/MealType';
import { NutritionCalculator } from '../../domain/services/NutritionCalculator';
import { getFoodByIdUseCase } from '../../di/container';
import { useAuthStore, useUIStore } from '../store';
import { useDiary } from '../hooks/useDiary';
import { notify } from '../utils/notify';
import { PortionSlider } from '../components';

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Bữa sáng' },
  { type: 'lunch', label: 'Bữa trưa' },
  { type: 'dinner', label: 'Bữa tối' },
  { type: 'snack', label: 'Bữa phụ' },
];

export function FoodReviewScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{
    foodId?: string;
    photoUri?: string;
    suggestedGrams?: string;
    foodJson?: string;
  }>();
  const { user } = useAuthStore();
  const { selectedDate } = useUIStore();
  const { addMeal } = useDiary(selectedDate);

  const [food, setFood] = useState<FoodItem | null>(null);
  const [currentGrams, setCurrentGrams] = useState<number>(100);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchFood() {
      if (params.foodJson) {
        try {
          const parsed = JSON.parse(params.foodJson) as FoodItem;
          setFood(parsed);
          const initialGrams = params.suggestedGrams
            ? Number(params.suggestedGrams)
            : parsed.servingWeightGrams || 100;
          setCurrentGrams(initialGrams);
          return;
        } catch {
          // Fall back to foodId lookup
        }
      }

      if (params.foodId) {
        const result = await getFoodByIdUseCase.execute(params.foodId);
        if (result.success && result.data) {
          setFood(result.data);
          const initialGrams = params.suggestedGrams
            ? Number(params.suggestedGrams)
            : result.data.servingWeightGrams || 100;
          setCurrentGrams(initialGrams);
          return;
        }
      }
      // Fallback: try fetching default food
      const defaultResult = await getFoodByIdUseCase.execute('pho-bo');
      if (defaultResult.success && defaultResult.data) {
        setFood(defaultResult.data);
        setCurrentGrams(defaultResult.data.servingWeightGrams || 100);
      }
    }
    fetchFood();
  }, [params.foodId, params.foodJson, params.suggestedGrams]);

  const portionMultiplier = useMemo(() => {
    if (!food || !food.servingWeightGrams || food.servingWeightGrams <= 0) {
      return 1.0;
    }
    return Math.round((currentGrams / food.servingWeightGrams) * 100) / 100;
  }, [currentGrams, food]);

  const calculatedNutrition = useMemo(() => {
    if (!food) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return NutritionCalculator.calculateFromFood(food, portionMultiplier);
  }, [food, portionMultiplier]);

  if (!food) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang tải thông tin món ăn...
        </Text>
      </View>
    );
  }

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
        portionMultiplier,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Photo thumbnail if available */}
      {params.photoUri && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: params.photoUri }} style={styles.photo} />
        </View>
      )}

      {/* Food Header Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.dishName, { color: colors.text }]}>{food.name}</Text>
        <Text style={[styles.dishSub, { color: colors.textSecondary }]}>
          {food.category} • {food.servingUnit} ({food.servingWeightGrams}g tiêu chuẩn)
        </Text>

        <View style={[styles.nutritionBox, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
          <View style={styles.calorieHighlight}>
            <Text style={[styles.calorieNumber, { color: colors.primary }]}>
              {calculatedNutrition.calories}
            </Text>
            <Text style={[styles.calorieUnit, { color: colors.textMuted }]}>kcal</Text>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: colors.danger }]}>
                {calculatedNutrition.protein}g
              </Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: colors.accent }]}>
                {calculatedNutrition.carbs}g
              </Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: colors.yellow }]}>
                {calculatedNutrition.fat}g
              </Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fat</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Select Meal Type */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Chọn bữa ăn</Text>
        <View style={styles.mealTypeRow}>
          {MEAL_TYPES.map((m) => (
            <TouchableOpacity
              key={m.type}
              style={[
                styles.mealTypeChip,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                selectedMealType === m.type && [styles.mealTypeChipActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
              ]}
              onPress={() => setSelectedMealType(m.type)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.mealTypeText,
                  { color: colors.textSecondary },
                  selectedMealType === m.type && [styles.mealTypeTextActive, { color: colors.primaryDark }],
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Portion Adjustment with PortionSlider */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Điều chỉnh khẩu phần ăn</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Quy đổi: <Text style={{ fontWeight: '700', color: colors.text }}>{portionMultiplier}x</Text> khẩu phần tiêu chuẩn ({food.servingWeightGrams}g)
        </Text>

        <PortionSlider
          grams={currentGrams}
          onGramsChange={setCurrentGrams}
          min={10}
          max={1000}
          step={5}
          calories={calculatedNutrition.calories}
          protein={calculatedNutrition.protein}
          carbs={calculatedNutrition.carbs}
          fat={calculatedNutrition.fat}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          { backgroundColor: colors.primary },
          isSaving && { opacity: 0.6 },
        ]}
        onPress={handleSaveToDiary}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        <Text style={[styles.saveBtnText, { color: colors.inverseText }]}>
          {isSaving ? 'Đang lưu vào nhật ký...' : 'Lưu vào nhật ký bữa ăn'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  photoContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  dishName: {
    fontSize: 22,
    fontWeight: '800',
  },
  dishSub: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  nutritionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  calorieHighlight: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  calorieNumber: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  calorieUnit: {
    fontSize: 16,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '800',
  },
  macroLabel: {
    fontSize: 16,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 16,
    marginBottom: 12,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  mealTypeChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  mealTypeChipActive: {
    borderWidth: 1.5,
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mealTypeTextActive: {
    fontWeight: '700',
  },
  saveBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
