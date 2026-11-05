import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useGoalStore, useAuthStore } from '../store';
import { notify } from '../utils/notify';

type Gender = 'female' | 'male' | 'other';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
type GoalType = 'fat_loss' | 'maintenance' | 'muscle_gain';

export function OnboardingScreen() {
  const { user } = useAuthStore();
  const { updateGoals } = useGoalStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Biological Indicators
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState<number>(26);
  const [heightCm, setHeightCm] = useState<number>(162);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightKg, setWeightKg] = useState<number>(62.0);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Step 2: Activity Level
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  // Step 3: Nutrition Goal & Preferences
  const [goal, setGoal] = useState<GoalType>('fat_loss');
  const [targetWeightKg, setTargetWeightKg] = useState<number>(59.5);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['Không kiêng']);

  // Calculated Scientific Values (Mifflin-St Jeor formula)
  const calculations = useMemo(() => {
    // 1. BMI
    const heightInMeters = heightCm / 100;
    const bmiVal = weightKg / (heightInMeters * heightInMeters);
    const bmi = parseFloat(bmiVal.toFixed(1));
    let bmiCategory = 'Bình thường';
    let bmiColor = COLORS.primary;
    if (bmi < 18.5) {
      bmiCategory = 'Thiếu cân';
      bmiColor = COLORS.warning;
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Tiền thừa cân';
      bmiColor = COLORS.warning;
    } else if (bmi >= 30) {
      bmiCategory = 'Béo phì';
      bmiColor = COLORS.danger;
    }

    // 2. BMR
    let bmr = 0;
    if (gender === 'female') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    } else if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
    }

    // 3. Activity Multiplier
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
    };
    const factor = multipliers[activityLevel];
    const tdee = Math.round(bmr * factor);

    // 4. Target Calories based on Goal
    let targetCalories = tdee;
    if (goal === 'fat_loss') {
      targetCalories = Math.max(1200, tdee - 400);
    } else if (goal === 'muscle_gain') {
      targetCalories = tdee + 250;
    }

    // 5. Macro Distribution (30% Protein, 45% Carbs, 25% Fat)
    const proteinGrams = Math.round((targetCalories * 0.3) / 4);
    const carbsGrams = Math.round((targetCalories * 0.45) / 4);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);
    const waterMl = Math.round(weightKg * 35);

    return {
      bmi,
      bmiCategory,
      bmiColor,
      bmr: Math.round(bmr),
      factor,
      tdee,
      targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      waterMl,
    };
  }, [gender, age, heightCm, weightKg, activityLevel, goal]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    }
  };

  const handleCompleteSetup = async () => {
    try {
      await updateGoals(
        {
          calories: calculations.targetCalories,
          protein: calculations.proteinGrams,
          carbs: calculations.carbsGrams,
          fat: calculations.fatGrams,
          waterMl: calculations.waterMl,
        },
        user?.id || 'guest_user_id'
      );
      notify.toast('Đã lưu kế hoạch dinh dưỡng thành công! 🎉');
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  };

  const toggleDiet = (diet: string) => {
    if (diet === 'Không kiêng') {
      setSelectedDiets(['Không kiêng']);
      return;
    }
    const filtered = selectedDiets.filter((d) => d !== 'Không kiêng');
    if (filtered.includes(diet)) {
      const next = filtered.filter((d) => d !== diet);
      setSelectedDiets(next.length ? next : ['Không kiêng']);
    } else {
      setSelectedDiets([...filtered, diet]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.circleBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>
          {currentStep === 4
            ? 'Hoàn Tất Thiết Lập'
            : `Thiết Lập Hồ Sơ ${currentStep} NutriLens`}
        </Text>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() =>
            notify.info(
              'Cố vấn dinh dưỡng NutriLens AI',
              'Các chỉ số của bạn được tính toán theo công thức khoa học lâm sàng Mifflin-St Jeor nhằm thiết lập mức calo và macro chuẩn hóa cho ẩm thực Việt.'
            )
          }
        >
          <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar (Steps 1 to 3) */}
      {currentStep < 4 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressStepText}>
              {currentStep === 1 && 'Bước 1/3: Chỉ số sinh học'}
              {currentStep === 2 && 'Bước 2/3: Mức độ vận động'}
              {currentStep === 3 && 'Bước 3/3: Mục tiêu dinh dưỡng'}
            </Text>
            <Text style={styles.progressPercentText}>
              {currentStep === 1 && '33% hoàn tất'}
              {currentStep === 2 && '66% hoàn tất'}
              {currentStep === 3 && '100% hoàn tất'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                {
                  width:
                    currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%',
                },
              ]}
            />
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= STEP 1: CHỈ SỐ SINH HỌC ================= */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.introHeader}>
              <Text style={styles.stepHeading}>Thông tin cơ bản của bạn</Text>
              <Text style={styles.stepSubtitle}>
                Dữ liệu giúp AI tính toán chỉ số trao đổi chất (BMR) và mức calo tiêu chuẩn
                chính xác nhất cho món ăn Việt.
              </Text>
            </View>

            {/* 1. Biological Gender */}
            <View style={styles.cardGroup}>
              <Text style={styles.groupLabel}>
                Giới tính sinh học <Text style={{ color: COLORS.danger }}>*</Text>
              </Text>
              <View style={styles.genderRow}>
                {[
                  { key: 'male', label: 'Nam', icon: 'male' },
                  { key: 'female', label: 'Nữ', icon: 'female' },
                  { key: 'other', label: 'Khác', icon: 'transgender' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.genderBtn,
                      gender === item.key && styles.genderBtnActive,
                    ]}
                    onPress={() => setGender(item.key as Gender)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={gender === item.key ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.genderBtnText,
                        gender === item.key && styles.genderBtnTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2. Age Stepper */}
            <View style={styles.cardBox}>
              <View style={styles.cardBoxHeader}>
                <View>
                  <Text style={styles.cardBoxTitle}>Tuổi tác</Text>
                  <Text style={styles.cardBoxSub}>
                    Sinh năm ~{new Date().getFullYear() - age}
                  </Text>
                </View>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setAge((prev) => Math.max(12, prev - 1))}
                  >
                    <Ionicons name="remove" size={18} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>
                    {age} <Text style={styles.stepperUnit}>tuổi</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setAge((prev) => Math.min(100, prev + 1))}
                  >
                    <Ionicons name="add" size={18} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 3. Height Input Card */}
            <View style={styles.cardBox}>
              <View style={styles.cardBoxHeader}>
                <View>
                  <Text style={styles.cardBoxTitle}>Chiều cao</Text>
                  <Text style={styles.cardBoxSub}>Dùng tính toán BMI</Text>
                </View>
                <View style={styles.unitToggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.unitBtn,
                      heightUnit === 'cm' && styles.unitBtnActive,
                    ]}
                    onPress={() => setHeightUnit('cm')}
                  >
                    <Text
                      style={[
                        styles.unitBtnText,
                        heightUnit === 'cm' && styles.unitBtnTextActive,
                      ]}
                    >
                      cm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitBtn,
                      heightUnit === 'ft' && styles.unitBtnActive,
                    ]}
                    onPress={() => setHeightUnit('ft')}
                  >
                    <Text
                      style={[
                        styles.unitBtnText,
                        heightUnit === 'ft' && styles.unitBtnTextActive,
                      ]}
                    >
                      ft
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputStepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setHeightCm((prev) => Math.max(100, prev - 1))}
                >
                  <Ionicons name="remove" size={18} color={COLORS.text} />
                </TouchableOpacity>
                <TextInput
                  style={styles.bigNumericInput}
                  keyboardType="numeric"
                  value={heightCm.toString()}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setHeightCm(num);
                  }}
                />
                <Text style={styles.inputUnitInline}>cm</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setHeightCm((prev) => Math.min(230, prev + 1))}
                >
                  <Ionicons name="add" size={18} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Weight Input Card */}
            <View style={styles.cardBox}>
              <View style={styles.cardBoxHeader}>
                <View>
                  <Text style={styles.cardBoxTitle}>Cân nặng hiện tại</Text>
                  <Text style={styles.cardBoxSub}>Để theo dõi tiến độ</Text>
                </View>
                <View style={styles.unitToggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.unitBtn,
                      weightUnit === 'kg' && styles.unitBtnActive,
                    ]}
                    onPress={() => setWeightUnit('kg')}
                  >
                    <Text
                      style={[
                        styles.unitBtnText,
                        weightUnit === 'kg' && styles.unitBtnTextActive,
                      ]}
                    >
                      kg
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitBtn,
                      weightUnit === 'lbs' && styles.unitBtnActive,
                    ]}
                    onPress={() => setWeightUnit('lbs')}
                  >
                    <Text
                      style={[
                        styles.unitBtnText,
                        weightUnit === 'lbs' && styles.unitBtnTextActive,
                      ]}
                    >
                      lbs
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputStepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() =>
                    setWeightKg((prev) => Math.max(30, parseFloat((prev - 0.5).toFixed(1))))
                  }
                >
                  <Ionicons name="remove" size={18} color={COLORS.text} />
                </TouchableOpacity>
                <TextInput
                  style={styles.bigNumericInput}
                  keyboardType="decimal-pad"
                  value={weightKg.toString()}
                  onChangeText={(val) => {
                    const num = parseFloat(val);
                    if (!isNaN(num)) setWeightKg(num);
                  }}
                />
                <Text style={styles.inputUnitInline}>kg</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() =>
                    setWeightKg((prev) => Math.min(200, parseFloat((prev + 0.5).toFixed(1))))
                  }
                >
                  <Ionicons name="add" size={18} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Dynamic BMI Preview Card */}
            <View style={styles.bmiPreviewCard}>
              <View style={styles.bmiHeaderRow}>
                <Text style={styles.bmiHeaderTitle}>CHỈ SỐ THỂ TRẠNG</Text>
                <View style={styles.bmiBadge}>
                  <Text style={styles.bmiValueText}>BMI: {calculations.bmi}</Text>
                  <Text style={[styles.bmiStatusText, { color: calculations.bmiColor }]}>
                    • {calculations.bmiCategory}
                  </Text>
                </View>
              </View>
              <View style={styles.securityHintRow}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={styles.securityHintText}>
                  NutriLens bảo mật 100% dữ liệu y sinh học theo tiêu chuẩn sức khỏe cá nhân.
                </Text>
              </View>
            </View>

            {/* CTA Step 1 */}
            <TouchableOpacity style={styles.primaryCtaBtn} onPress={handleNext}>
              <Text style={styles.primaryCtaText}>Tiếp tục (Bước 2/3)</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.ctaFootnote}>
              Bước 2: Mức độ vận động & Mục tiêu dinh dưỡng
            </Text>
          </View>
        )}

        {/* ================= STEP 2: MỨC ĐỘ VẬN ĐỘNG ================= */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.introHeader}>
              <View style={styles.chipPill}>
                <Ionicons name="flash-outline" size={13} color={COLORS.primary} />
                <Text style={styles.chipPillText}>Cá nhân hóa calo</Text>
              </View>
              <Text style={styles.stepHeading}>Mức độ vận động hàng ngày</Text>
              <Text style={styles.stepSubtitle}>
                Chọn mức độ phản ánh sát nhất nhịp sống và thói quen rèn luyện thể chất của bạn.
              </Text>
            </View>

            {/* 4 Activity Cards */}
            <View style={styles.activityList}>
              {[
                {
                  key: 'sedentary',
                  title: 'Ít vận động',
                  factor: 'x1.20',
                  desc: 'Làm việc bàn giấy, ngồi nhiều, hầu như không tập thể dục.',
                  icon: 'laptop-outline',
                },
                {
                  key: 'light',
                  title: 'Vận động nhẹ',
                  factor: 'x1.375',
                  desc: 'Đi bộ nhẹ nhàng dạo phố, thể dục nhẹ 1-3 ngày mỗi tuần.',
                  icon: 'walk-outline',
                },
                {
                  key: 'moderate',
                  title: 'Vận động vừa',
                  factor: 'x1.55',
                  desc: 'Tập luyện đều đặn 3-5 ngày/tuần, lối sống năng động.',
                  icon: 'bicycle-outline',
                },
                {
                  key: 'very_active',
                  title: 'Vận động nhiều',
                  factor: 'x1.725',
                  desc: 'Tập cường độ cao 6-7 ngày/tuần hoặc công việc vận động thể lực nặng.',
                  icon: 'barbell-outline',
                },
              ].map((item) => {
                const isSelected = activityLevel === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.activityCard,
                      isSelected && styles.activityCardSelected,
                    ]}
                    onPress={() => setActivityLevel(item.key as ActivityLevel)}
                  >
                    <View style={styles.activityCardTop}>
                      <View style={styles.activityIconWrap}>
                        <Ionicons
                          name={item.icon as any}
                          size={22}
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={styles.activityTitleRow}>
                          <Text
                            style={[
                              styles.activityTitle,
                              isSelected && styles.activityTitleActive,
                            ]}
                          >
                            {item.title}
                          </Text>
                          <View
                            style={[
                              styles.factorBadge,
                              isSelected && styles.factorBadgeActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.factorBadgeText,
                                isSelected && styles.factorBadgeTextActive,
                              ]}
                            >
                              {item.factor}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.activityDesc}>{item.desc}</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* AI Engine & TDEE Preview */}
            <View style={styles.metabolicBox}>
              <View style={styles.badgePill}>
                <Ionicons name="sparkles" size={13} color={COLORS.primary} />
                <Text style={styles.badgeText}>AI METABOLIC ENGINE</Text>
              </View>
              <Text style={styles.metabolicDesc}>
                Hệ số hoạt động sẽ được kết hợp cùng công thức{' '}
                <Text style={{ fontWeight: '700', color: COLORS.primaryDark }}>
                  Mifflin-St Jeor
                </Text>{' '}
                để tính toán chỉ số TDEE và mục tiêu phân bổ Macro chuẩn xác nhất.
              </Text>
              <View style={styles.tdeeEstimateRow}>
                <View>
                  <Text style={styles.tdeeEstimateLabel}>ƯỚC LƯỢNG CHUYỂN HOÁ</Text>
                  <Text style={styles.tdeeEstimateValue}>
                    TDEE khuyến nghị: ~{calculations.tdee} kcal/ngày
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA Step 2 */}
            <TouchableOpacity style={styles.primaryCtaBtn} onPress={handleNext}>
              <Text style={styles.primaryCtaText}>Tiếp tục (Bước 3/3)</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.ctaFootnote}>
              Thông tin được bảo mật và dùng cho tính toán dinh dưỡng
            </Text>
          </View>
        )}

        {/* ================= STEP 3: MỤC TIÊU DINH DƯỠNG ================= */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.introHeader}>
              <Text style={styles.stepHeading}>Mục tiêu sức khỏe của bạn</Text>
              <Text style={styles.stepSubtitle}>
                NutriLens AI sẽ thiết kế thực đơn phù hợp với mục tiêu và thói quen ăn uống của bạn.
              </Text>
            </View>

            {/* Goal Options */}
            <View style={styles.activityList}>
              {[
                {
                  key: 'fat_loss',
                  title: 'Giảm mỡ & Giữ cơ (Fat Loss)',
                  desc: 'Thâm hụt calo an toàn, bảo toàn khối cơ nạc, tối ưu hóa năng lượng bền bỉ.',
                  icon: 'flame-outline',
                },
                {
                  key: 'maintenance',
                  title: 'Duy trì vóc dáng & Sức khỏe',
                  desc: 'Cân bằng năng lượng hấp thụ và tiêu hao, tập trung chất lượng thực phẩm tươi sạch.',
                  icon: 'fitness-outline',
                },
                {
                  key: 'muscle_gain',
                  title: 'Tăng cơ giảm mỡ (Body Recomp)',
                  desc: 'Ưu tiên nguồn đạm hoàn chỉnh cao cấp, tối ưu tổng hợp glycogen và phục hồi.',
                  icon: 'barbell-outline',
                },
              ].map((item) => {
                const isSelected = goal === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.activityCard,
                      isSelected && styles.activityCardSelected,
                    ]}
                    onPress={() => setGoal(item.key as GoalType)}
                  >
                    <View style={styles.activityCardTop}>
                      <View style={styles.activityIconWrap}>
                        <Ionicons
                          name={item.icon as any}
                          size={22}
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[
                            styles.activityTitle,
                            isSelected && styles.activityTitleActive,
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.activityDesc}>{item.desc}</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    </View>

                    {/* Weight target sub-card for Fat loss */}
                    {isSelected && item.key === 'fat_loss' && (
                      <View style={styles.targetWeightBox}>
                        <View style={styles.targetWeightRow}>
                          <Text style={styles.targetWeightLabel}>Cân nặng mục tiêu:</Text>
                          <View style={styles.targetWeightInputWrap}>
                            <TextInput
                              style={styles.targetWeightInput}
                              keyboardType="decimal-pad"
                              value={targetWeightKg.toString()}
                              onChangeText={(val) => {
                                const num = parseFloat(val);
                                if (!isNaN(num)) setTargetWeightKg(num);
                              }}
                            />
                            <Text style={styles.targetWeightUnit}>kg</Text>
                          </View>
                        </View>
                        <Text style={styles.targetWeightPace}>
                          Tốc độ dự kiến: ~0.5 kg / tuần • 5 tuần về đích
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Vietnamese Culinary Banner */}
            <View style={styles.culinaryCard}>
              <View style={styles.badgePill}>
                <Ionicons name="restaurant" size={13} color={COLORS.primary} />
                <Text style={styles.badgeText}>HƯƠNG VỊ QUÊ NHÀ</Text>
              </View>
              <Text style={styles.culinaryTitle}>Món Việt chuẩn Macro</Text>
              <Text style={styles.culinarySubtitle}>
                NutriLens nhận diện chính xác phở, bún, cơm tấm và định lượng calo thông minh theo chuẩn Bộ Y tế.
              </Text>
            </View>

            {/* Dietary Preference Tags */}
            <View style={styles.dietPrefGroup}>
              <View style={styles.dietPrefHeader}>
                <Text style={styles.dietPrefTitle}>Chế độ ăn ưu tiên (Tùy chọn)</Text>
                <Text style={styles.dietPrefSub}>Chọn nhiều mục</Text>
              </View>
              <View style={styles.tagWrapRow}>
                {[
                  'Không kiêng',
                  'Ít tinh bột (Low-carb)',
                  'Ăn chay / Thuần chay',
                  'Keto linh hoạt',
                  'Eat Clean Việt',
                ].map((tag) => {
                  const isTagSelected = selectedDiets.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.dietTag,
                        isTagSelected && styles.dietTagActive,
                      ]}
                      onPress={() => toggleDiet(tag)}
                    >
                      <Text
                        style={[
                          styles.dietTagText,
                          isTagSelected && styles.dietTagTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* CTA Step 3 */}
            <TouchableOpacity style={styles.primaryCtaBtn} onPress={handleNext}>
              <Text style={styles.primaryCtaText}>Tạo kế hoạch dinh dưỡng AI</Text>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.ctaFootnote}>
              Kế hoạch được cố vấn bởi chuyên gia dinh dưỡng lâm sàng
            </Text>
          </View>
        )}

        {/* ================= STEP 4: HOÀN TẤT THIẾT LẬP ================= */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            {/* Celebration Header */}
            <View style={styles.celebrationBlock}>
              <View style={styles.celebrationIconWrap}>
                <Ionicons name="checkmark-done" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.celebrationTitle}>Kế hoạch đã sẵn sàng! 🎉</Text>
              <Text style={styles.celebrationSubtitle}>
                Dựa trên thể trạng và mục tiêu của bạn, NutriLens AI đã chuẩn hoá chế độ dinh dưỡng tối ưu mỗi ngày:
              </Text>
            </View>

            {/* Primary Calorie & Macro Target Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View>
                  <Text style={styles.summaryTargetLabel}>NĂNG LƯỢNG MỤC TIÊU</Text>
                  <View style={styles.summaryCalorieRow}>
                    <Text style={styles.summaryCalorieNumber}>
                      {calculations.targetCalories}
                    </Text>
                    <Text style={styles.summaryCalorieUnit}>kcal / ngày</Text>
                  </View>
                </View>
                <View style={styles.targetPill}>
                  <Text style={styles.targetPillText}>
                    Đích: {targetWeightKg} kg (-0.5kg/tuần)
                  </Text>
                </View>
              </View>

              {/* Macro Tri-Grid */}
              <View style={styles.macroTriGrid}>
                {/* Protein */}
                <View style={styles.macroCol}>
                  <Text style={[styles.macroColName, { color: COLORS.purple }]}>
                    Protein
                  </Text>
                  <Text style={styles.macroColGrams}>
                    {calculations.proteinGrams}g
                  </Text>
                  <Text style={styles.macroColSub}>
                    30% • {calculations.proteinGrams * 4} kcal
                  </Text>
                </View>

                {/* Carbs */}
                <View style={styles.macroCol}>
                  <Text style={[styles.macroColName, { color: COLORS.accent }]}>
                    Carbs
                  </Text>
                  <Text style={styles.macroColGrams}>
                    {calculations.carbsGrams}g
                  </Text>
                  <Text style={styles.macroColSub}>
                    45% • {calculations.carbsGrams * 4} kcal
                  </Text>
                </View>

                {/* Fat */}
                <View style={styles.macroCol}>
                  <Text style={[styles.macroColName, { color: COLORS.yellow }]}>
                    Chất béo
                  </Text>
                  <Text style={styles.macroColGrams}>
                    {calculations.fatGrams}g
                  </Text>
                  <Text style={styles.macroColSub}>
                    25% • {calculations.fatGrams * 9} kcal
                  </Text>
                </View>
              </View>
            </View>

            {/* Vietnamese Dish Preview Inspiration */}
            <View style={styles.mealInspirationCard}>
              <View style={styles.mealInspirationHeader}>
                <Text style={styles.mealInspirationTitle}>Gợi ý món phù hợp hôm nay</Text>
                <View style={styles.aiBadgePill}>
                  <Text style={styles.aiBadgeText}>AI Đề xuất</Text>
                </View>
              </View>

              <View style={styles.dishRow}>
                <Image
                  source={require('../../../assets/images/onboarding/dish_pho_bo_tai.png')}
                  style={styles.dishThumbImg}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.dishName}>Phở Bò Tái Nạc</Text>
                  <Text style={styles.dishMeta}>520 kcal • 38g Đạm • Cân bằng</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              </View>

              <View style={[styles.dishRow, { marginTop: 10 }]}>
                <Image
                  source={require('../../../assets/images/onboarding/dish_goicuon.png')}
                  style={styles.dishThumbImg}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.dishName}>Gỏi Cuốn Tôm Thịt (3 cuộn)</Text>
                  <Text style={styles.dishMeta}>310 kcal • 19g Đạm • Ít chất béo</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              </View>
            </View>

            {/* Quick Tip Card */}
            <View style={styles.quickTipCard}>
              <View style={styles.quickTipTop}>
                <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
                <Text style={styles.quickTipTitle}>Mẹo khởi đầu nhanh</Text>
              </View>
              <Text style={styles.quickTipDesc}>
                Hãy bắt đầu bằng việc chụp ảnh đĩa thức ăn đầu tiên của bạn vào bữa trưa hoặc tối nay! NutriLens nhận diện khẩu phần chỉ sau 2 giây.
              </Text>
            </View>

            {/* CTA Final */}
            <TouchableOpacity style={styles.primaryCtaBtn} onPress={handleCompleteSetup}>
              <Text style={styles.primaryCtaText}>Vào Trang Chủ & Bắt Đầu Ngay</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressPercentText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContent: {
    paddingTop: 8,
  },
  introHeader: {
    marginBottom: 20,
  },
  stepHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  cardGroup: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  genderBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genderBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    marginBottom: 14,
  },
  cardBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardBoxSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'center',
  },
  stepperUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: 8,
    padding: 2,
  },
  unitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  unitBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 12,
  },
  bigNumericInput: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
    minWidth: 90,
  },
  inputUnitInline: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: -4,
  },
  bmiPreviewCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 16,
    marginBottom: 20,
  },
  bmiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  bmiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bmiValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  bmiStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  securityHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityHintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  primaryCtaBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaFootnote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  chipPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 6,
  },
  chipPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  activityList: {
    gap: 12,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
  },
  activityCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAFCF9',
  },
  activityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  activityTitleActive: {
    color: COLORS.primaryDark,
  },
  factorBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  factorBadgeActive: {
    backgroundColor: COLORS.neonMintLight,
  },
  factorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  factorBadgeTextActive: {
    color: COLORS.primaryDark,
  },
  activityDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  metabolicBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    marginBottom: 20,
  },
  badgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  metabolicDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  tdeeEstimateRow: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
  },
  tdeeEstimateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  tdeeEstimateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  targetWeightBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  targetWeightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetWeightLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  targetWeightInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  targetWeightInput: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    minWidth: 44,
    textAlign: 'center',
  },
  targetWeightUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  targetWeightPace: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  culinaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 14,
    marginBottom: 16,
  },
  culinaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  culinarySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  dietPrefGroup: {
    marginBottom: 20,
  },
  dietPrefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dietPrefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  dietPrefSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tagWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dietTagActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  dietTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dietTagTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  celebrationBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  celebrationIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryTargetLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  summaryCalorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  summaryCalorieNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  summaryCalorieUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  targetPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  macroTriGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroColName: {
    fontSize: 12,
    fontWeight: '700',
  },
  macroColGrams: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 2,
  },
  macroColSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  mealInspirationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    marginBottom: 14,
  },
  mealInspirationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealInspirationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  aiBadgePill: {
    backgroundColor: COLORS.neonMintLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    padding: 10,
    borderRadius: 10,
  },
  dishThumbImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  dishName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  dishMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  quickTipCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 14,
    marginBottom: 20,
  },
  quickTipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  quickTipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  quickTipDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});

