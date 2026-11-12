import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/colors';
import { useAuthStore, useGoalStore } from '../store';
import { useSync } from '../hooks/useSync';
import { notify } from '../utils/notify';
import { GUEST_USER_ID } from '../../domain/constants/defaultGoals';

type Gender = 'male' | 'female' | 'other';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
type GoalType = 'fat_loss' | 'maintenance' | 'muscle_gain';

interface BodyStats {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
}

const DEFAULT_BODY_STATS: BodyStats = {
  gender: 'male',
  age: 24,
  heightCm: 170,
  weightKg: 65,
  targetWeightKg: 62,
  activityLevel: 'moderate',
  goal: 'fat_loss',
};

const GENDER_LABELS: Record<Gender, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Ít vận động (văn phòng)',
  light: 'Vận động nhẹ (1-3 ngày/tuần)',
  moderate: 'Vận động vừa (3-5 ngày/tuần)',
  very_active: 'Vận động nhiều (6-7 ngày/tuần)',
};

const GOAL_LABELS: Record<GoalType, string> = {
  fat_loss: 'Giảm mỡ (-400 kcal)',
  maintenance: 'Duy trì cân nặng',
  muscle_gain: 'Tăng cơ (+250 kcal)',
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { user, isAuthenticated, logout, updateUserProfile, isLoading: isAuthLoading } = useAuthStore();
  const { goals, updateGoals } = useGoalStore();
  const { pendingCount, syncNow, isSyncing } = useSync();

  // Chỉnh sửa tên hiển thị
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');

  // Thể trạng & Chỉ số thể chất
  const [bodyStats, setBodyStats] = useState<BodyStats>(DEFAULT_BODY_STATS);
  const [isBodyModalVisible, setIsBodyModalVisible] = useState(false);

  // Form edit body stats
  const [editWeight, setEditWeight] = useState(String(DEFAULT_BODY_STATS.weightKg));
  const [editTargetWeight, setEditTargetWeight] = useState(String(DEFAULT_BODY_STATS.targetWeightKg));
  const [editHeight, setEditHeight] = useState(String(DEFAULT_BODY_STATS.heightCm));
  const [editAge, setEditAge] = useState(String(DEFAULT_BODY_STATS.age));
  const [editGender, setEditGender] = useState<Gender>(DEFAULT_BODY_STATS.gender);
  const [editActivity, setEditActivity] = useState<ActivityLevel>(DEFAULT_BODY_STATS.activityLevel);
  const [editGoal, setEditGoal] = useState<GoalType>(DEFAULT_BODY_STATS.goal);

  // Modal chỉnh sửa mục tiêu calo
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [caloriesInput, setCaloriesInput] = useState(String(goals.calories));

  // Load body stats từ storage
  useEffect(() => {
    async function loadStats() {
      try {
        const raw = await AsyncStorage.getItem('@nutrivision_user_body_stats');
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<BodyStats>;
          setBodyStats((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      } catch (err) {
        console.warn('Could not load body stats:', err);
      }
    }
    void loadStats();
  }, []);

  // Tính toán các chỉ số khoa học (BMI, BMR, TDEE)
  const metrics = useMemo(() => {
    const heightInM = Math.max(0.5, bodyStats.heightCm / 100);
    const bmiVal = bodyStats.weightKg / (heightInM * heightInM);
    const bmi = parseFloat(bmiVal.toFixed(1));

    let bmiCategory = 'Bình thường';
    let bmiColor = colors.primary;
    if (bmi < 18.5) {
      bmiCategory = 'Thiếu cân';
      bmiColor = colors.warning;
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Tiền thừa cân';
      bmiColor = colors.warning;
    } else if (bmi >= 30) {
      bmiCategory = 'Béo phì';
      bmiColor = colors.danger;
    }

    let bmr = 0;
    if (bodyStats.gender === 'female') {
      bmr = 10 * bodyStats.weightKg + 6.25 * bodyStats.heightCm - 5 * bodyStats.age - 161;
    } else if (bodyStats.gender === 'male') {
      bmr = 10 * bodyStats.weightKg + 6.25 * bodyStats.heightCm - 5 * bodyStats.age + 5;
    } else {
      bmr = 10 * bodyStats.weightKg + 6.25 * bodyStats.heightCm - 5 * bodyStats.age - 78;
    }

    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
    };
    const tdee = Math.round(bmr * (multipliers[bodyStats.activityLevel] || 1.375));

    return {
      bmi,
      bmiCategory,
      bmiColor,
      bmr: Math.round(bmr),
      tdee,
    };
  }, [bodyStats, colors]);

  const handleOpenEditName = () => {
    setNameInput(user?.name || '');
    setIsEditingName(true);
  };

  const handleSaveProfileName = async () => {
    if (!nameInput.trim()) {
      notify.warning('Lỗi', 'Tên hiển thị không được để trống.');
      return;
    }
    const success = await updateUserProfile(nameInput.trim());
    if (success) {
      setIsEditingName(false);
      notify.toast('Đã cập nhật tên hiển thị');
    } else {
      notify.toast('Không thể cập nhật tên lúc này', 'error');
    }
  };

  const handleOpenGoalModal = () => {
    setCaloriesInput(String(goals.calories));
    setIsGoalModalVisible(true);
  };

  const handleSaveGoals = () => {
    const c = parseInt(caloriesInput, 10);
    if (isNaN(c) || c <= 0) {
      notify.warning('Lỗi định dạng', 'Vui lòng nhập lượng Calo hợp lệ.');
      return;
    }

    updateGoals({ calories: c }, user?.id || GUEST_USER_ID);
    setIsGoalModalVisible(false);
    notify.toast('Đã cập nhật mục tiêu calo hàng ngày');
  };

  const handleOpenBodyModal = () => {
    setEditWeight(String(bodyStats.weightKg));
    setEditTargetWeight(String(bodyStats.targetWeightKg));
    setEditHeight(String(bodyStats.heightCm));
    setEditAge(String(bodyStats.age));
    setEditGender(bodyStats.gender);
    setEditActivity(bodyStats.activityLevel);
    setEditGoal(bodyStats.goal);
    setIsBodyModalVisible(true);
  };

  const handleSaveBodyModal = async () => {
    const w = parseFloat(editWeight);
    const tw = parseFloat(editTargetWeight);
    const h = parseFloat(editHeight);
    const a = parseInt(editAge, 10);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0 || isNaN(a) || a <= 0) {
      notify.warning('Lỗi định dạng', 'Vui lòng nhập đúng số liệu cân nặng, chiều cao và tuổi.');
      return;
    }

    const nextStats: BodyStats = {
      gender: editGender,
      age: a,
      heightCm: h,
      weightKg: w,
      targetWeightKg: isNaN(tw) ? w : tw,
      activityLevel: editActivity,
      goal: editGoal,
    };

    setBodyStats(nextStats);

    // Tính toán TDEE và mục tiêu Calo mới
    let bmr = 0;
    if (nextStats.gender === 'female') {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    } else if (nextStats.gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 78;
    }

    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
    };
    const tdee = Math.round(bmr * (multipliers[nextStats.activityLevel] || 1.375));

    let targetCalories = tdee;
    if (nextStats.goal === 'fat_loss') {
      targetCalories = Math.max(1200, tdee - 400);
    } else if (nextStats.goal === 'muscle_gain') {
      targetCalories = tdee + 250;
    }

    const proteinGrams = Math.round((targetCalories * 0.3) / 4);
    const carbsGrams = Math.round((targetCalories * 0.45) / 4);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);
    const waterMl = Math.round(w * 35);

    try {
      await AsyncStorage.setItem('@nutrivision_user_body_stats', JSON.stringify(nextStats));
      await updateGoals(
        {
          calories: targetCalories,
          protein: proteinGrams,
          carbs: carbsGrams,
          fat: fatGrams,
          waterMl,
        },
        user?.id || GUEST_USER_ID
      );
      setIsBodyModalVisible(false);
      notify.toast('Đã cập nhật chỉ số thể chất & mục tiêu TDEE! 🎉');
    } catch {
      notify.error('Lỗi', 'Không thể lưu chỉ số lúc này.');
    }
  };

  const handleLogout = () => {
    notify.confirm(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất tài khoản khỏi NutriVision?',
      async () => {
        await logout();
        notify.toast('Đã đăng xuất');
        router.replace('/(auth)/sign-in');
      },
      undefined,
      'Đăng xuất',
      'Hủy'
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleSyncPress = useCallback(() => {
    syncNow();
    if (isSyncing) {
      notify.toast('Đang tiến hành đồng bộ...');
    } else if (pendingCount > 0) {
      notify.toast(`Đang đồng bộ ${pendingCount} mục chưa sao lưu lên đám mây...`);
    } else {
      notify.toast('Dữ liệu của bạn đã được đồng bộ mới nhất ✅');
    }
  }, [syncNow, isSyncing, pendingCount]);

  // =========================================================================
  // 1. KHI CHƯA ĐĂNG NHẬP (KHÁCH)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.guestWrapper, { paddingTop: Math.max(insets.top + 32, 48) }]}>
          <View style={[styles.guestCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={[styles.guestAvatarCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person-outline" size={36} color={colors.primary} />
            </View>

            <Text style={[styles.guestTitle, { color: colors.text }]}>Tài khoản cá nhân</Text>
            <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
              Đăng nhập để tự động lưu trữ và đồng bộ hóa dữ liệu dinh dưỡng trên đám mây.
            </Text>

            <View style={styles.guestButtonStack}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(auth)/sign-in')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => router.push({ pathname: '/(auth)/sign-in', params: { mode: 'signup' } })}
                activeOpacity={0.85}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Đăng ký tài khoản</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // 2. KHI ĐÃ ĐĂNG NHẬP
  // =========================================================================
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 16, 24) }]}
    >
      {/* 1. Header Hồ sơ người dùng với nút đồng bộ nhỏ ở góc trên phải */}
      <View style={[styles.card, styles.userCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        {/* Nút icon đồng bộ nhỏ gọn ở góc */}
        <TouchableOpacity
          style={[styles.cornerSyncBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
          onPress={handleSyncPress}
          disabled={isSyncing}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Đồng bộ dữ liệu"
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.syncIconContainer}>
              <Ionicons
                name={pendingCount > 0 ? 'cloud-upload-outline' : 'cloud-done-outline'}
                size={18}
                color={pendingCount > 0 ? colors.accent : colors.primary}
              />
              {pendingCount > 0 && <View style={[styles.syncDot, { backgroundColor: colors.accent }]} />}
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.userRow}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.userInitials}>{getInitials(user?.name)}</Text>
          </View>

          <View style={styles.userInfo}>
            {isEditingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveProfileName}
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: colors.borderLight }]}
                  onPress={() => {
                    setNameInput(user?.name || '');
                    setIsEditingName(false);
                  }}
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {user?.name || 'Người dùng'}
                </Text>
                <TouchableOpacity
                  onPress={handleOpenEditName}
                  style={styles.pencilBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="pencil" size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {user?.email || ''}
            </Text>

            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                <Text style={[styles.statusBadgeText, { color: colors.primaryDark }]}>
                  {pendingCount > 0 ? `${pendingCount} mục chờ sao lưu` : 'Đã sao lưu đám mây'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Thẻ Chỉ số thể chất & BMI */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>CHỈ SỐ THỂ CHẤT & BMI</Text>
        <TouchableOpacity
          onPress={handleOpenBodyModal}
          style={styles.editSectionBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="create-outline" size={14} color={colors.primary} />
          <Text style={[styles.editSectionText, { color: colors.primary }]}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.metricsGrid}>
          {/* Cân nặng */}
          <View style={[styles.metricBox, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.metricEmoji}>⚖️</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Cân nặng</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{bodyStats.weightKg} kg</Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              Mục tiêu: {bodyStats.targetWeightKg} kg
            </Text>
          </View>

          {/* Chiều cao */}
          <View style={[styles.metricBox, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.metricEmoji}>📏</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Chiều cao</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{bodyStats.heightCm} cm</Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              {(bodyStats.heightCm / 100).toFixed(2)} m
            </Text>
          </View>

          {/* BMI */}
          <View style={[styles.metricBox, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.metricEmoji}>🩺</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Chỉ số BMI</Text>
            <Text style={[styles.metricValue, { color: metrics.bmiColor }]}>{metrics.bmi}</Text>
            <View style={[styles.bmiPill, { backgroundColor: metrics.bmiColor + '20' }]}>
              <Text style={[styles.bmiPillText, { color: metrics.bmiColor }]}>
                {metrics.bmiCategory}
              </Text>
            </View>
          </View>

          {/* Thể trạng */}
          <View style={[styles.metricBox, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.metricEmoji}>👤</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Thể trạng</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{bodyStats.age} tuổi</Text>
            <Text style={[styles.metricSub, { color: colors.textMuted }]}>
              {GENDER_LABELS[bodyStats.gender] || 'Nam'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Năng lượng & TDEE */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>NĂNG LƯỢNG TIÊU THỤ & CHUYỂN HOÁ</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight, paddingVertical: 0 }]}>
        {/* Mục tiêu Calo hàng ngày */}
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.borderLight }]}
          onPress={handleOpenGoalModal}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flame" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Mục tiêu Calo hàng ngày</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {GOAL_LABELS[bodyStats.goal] || 'Theo kế hoạch'}
              </Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.primary }]}>{goals.calories} kcal</Text>
            <Ionicons name="pencil" size={15} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* TDEE */}
        <View style={[styles.settingRow, { borderBottomColor: colors.borderLight }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash-outline" size={18} color="#D97706" />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>TDEE (Tiêu hao mỗi ngày)</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {ACTIVITY_LABELS[bodyStats.activityLevel] || 'Vận động vừa'}
              </Text>
            </View>
          </View>
          <Text style={[styles.settingValue, { color: '#D97706' }]}>~{metrics.tdee} kcal</Text>
        </View>

        {/* BMR */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="heart-outline" size={18} color="#7C3AED" />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>BMR (Chuyển hoá cơ bản)</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Năng lượng duy trì sự sống ở trạng thái nghỉ
              </Text>
            </View>
          </View>
          <Text style={[styles.settingValue, { color: '#7C3AED' }]}>~{metrics.bmr} kcal</Text>
        </View>
      </View>

      {/* 4. Phân bổ Macro & Nước uống Mục tiêu */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>PHÂN BỔ MACRO & NƯỚC UỐNG MỤC TIÊU</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.macroGrid}>
          {/* Protein */}
          <View style={[styles.macroCard, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.macroEmoji}>🥩</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Đạm (Protein)</Text>
            <Text style={[styles.macroValue, { color: colors.purple }]}>{goals.protein}g</Text>
            <Text style={[styles.macroCal, { color: colors.textMuted }]}>~{goals.protein * 4} kcal</Text>
          </View>

          {/* Carbs */}
          <View style={[styles.macroCard, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.macroEmoji}>🍚</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs (Tinh bột)</Text>
            <Text style={[styles.macroValue, { color: colors.accent }]}>{goals.carbs}g</Text>
            <Text style={[styles.macroCal, { color: colors.textMuted }]}>~{goals.carbs * 4} kcal</Text>
          </View>

          {/* Fat */}
          <View style={[styles.macroCard, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.macroEmoji}>🥑</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Chất béo (Fat)</Text>
            <Text style={[styles.macroValue, { color: colors.yellow }]}>{goals.fat}g</Text>
            <Text style={[styles.macroCal, { color: colors.textMuted }]}>~{goals.fat * 9} kcal</Text>
          </View>

          {/* Nước */}
          <View style={[styles.macroCard, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <Text style={styles.macroEmoji}>💧</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Nước uống</Text>
            <Text style={[styles.macroValue, { color: colors.secondary }]}>{goals.waterMl || 2000} ml</Text>
            <Text style={[styles.macroCal, { color: colors.textMuted }]}>
              ~{Math.round((goals.waterMl || 2000) / 250)} ly (250ml)
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Khảo sát lại thể trạng Onboarding */}
      <TouchableOpacity
        style={[styles.onboardingShortcutBtn, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
        onPress={() => router.push('/(auth)/onboarding')}
        activeOpacity={0.8}
      >
        <View style={styles.shortcutLeft}>
          <View style={[styles.settingIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Khảo sát thể trạng toàn diện (TDEE)</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              Làm lại bài khảo sát để tính toán lộ trình dinh dưỡng
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {/* 6. Nút Đăng xuất */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
      </TouchableOpacity>

      {/* MODAL 1: Chỉnh sửa thể chất nhanh */}
      <Modal
        visible={isBodyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBodyModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Chỉnh sửa chỉ số thể chất</Text>
              <TouchableOpacity onPress={() => setIsBodyModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.bodyModalScroll} showsVerticalScrollIndicator={false}>
              {/* Row Cân nặng & Mục tiêu */}
              <View style={styles.formTwoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Cân nặng (kg) *</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                    placeholder="65"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Cân nặng mục tiêu (kg)</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    value={editTargetWeight}
                    onChangeText={setEditTargetWeight}
                    keyboardType="numeric"
                    placeholder="62"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Row Chiều cao & Tuổi */}
              <View style={styles.formTwoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Chiều cao (cm) *</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    value={editHeight}
                    onChangeText={setEditHeight}
                    keyboardType="numeric"
                    placeholder="170"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tuổi *</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    value={editAge}
                    onChangeText={setEditAge}
                    keyboardType="numeric"
                    placeholder="24"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Giới tính */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 4 }]}>Giới tính sinh học</Text>
              <View style={styles.chipRow}>
                {(['male', 'female', 'other'] as Gender[]).map((g) => {
                  const isSel = editGender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.chipBtn,
                        { borderColor: isSel ? colors.primary : colors.border, backgroundColor: isSel ? colors.primaryLight : colors.inputBg },
                      ]}
                      onPress={() => setEditGender(g)}
                    >
                      <Text style={[styles.chipText, { color: isSel ? colors.primaryDark : colors.text }]}>
                        {GENDER_LABELS[g]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Mục tiêu */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 4 }]}>Mục tiêu dinh dưỡng</Text>
              <View style={styles.chipRow}>
                {(['fat_loss', 'maintenance', 'muscle_gain'] as GoalType[]).map((gt) => {
                  const isSel = editGoal === gt;
                  return (
                    <TouchableOpacity
                      key={gt}
                      style={[
                        styles.chipBtn,
                        { borderColor: isSel ? colors.primary : colors.border, backgroundColor: isSel ? colors.primaryLight : colors.inputBg },
                      ]}
                      onPress={() => setEditGoal(gt)}
                    >
                      <Text style={[styles.chipText, { color: isSel ? colors.primaryDark : colors.text }]}>
                        {gt === 'fat_loss' ? 'Giảm mỡ' : gt === 'maintenance' ? 'Duy trì' : 'Tăng cơ'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Vận động */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 4 }]}>Mức độ vận động</Text>
              {(['sedentary', 'light', 'moderate', 'very_active'] as ActivityLevel[]).map((al) => {
                const isSel = editActivity === al;
                return (
                  <TouchableOpacity
                    key={al}
                    style={[
                      styles.activityRowBtn,
                      { borderColor: isSel ? colors.primary : colors.border, backgroundColor: isSel ? colors.primaryLight : colors.inputBg },
                    ]}
                    onPress={() => setEditActivity(al)}
                  >
                    <Ionicons
                      name={isSel ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={isSel ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.activityText, { color: isSel ? colors.primaryDark : colors.text }]}>
                      {ACTIVITY_LABELS[al]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsBodyModalVisible(false)}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveBodyModal}
              >
                <Text style={styles.modalSaveBtnText}>Lưu & Cập nhật TDEE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2: Chỉnh sửa Mục tiêu Calo */}
      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Mục tiêu calo hàng ngày</Text>
              <TouchableOpacity onPress={() => setIsGoalModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              Nhập mức calo bạn muốn đạt mỗi ngày hoặc tính toán lại theo thể trạng khoa học.
            </Text>

            <View style={styles.modalInputWrap}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Năng lượng mục tiêu (kcal/ngày)</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg },
                ]}
                value={caloriesInput}
                onChangeText={setCaloriesInput}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.aiCalcBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => {
                setIsGoalModalVisible(false);
                router.push('/(auth)/onboarding');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={[styles.aiCalcBtnText, { color: colors.primaryDark }]}>
                Tính toán lại toàn diện (Onboarding TDEE)
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsGoalModalVisible(false)}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveGoals}
              >
                <Text style={styles.modalSaveBtnText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  guestWrapper: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  guestCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  guestAvatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  guestButtonStack: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  userCard: {
    position: 'relative',
    paddingTop: 18,
    paddingBottom: 18,
  },
  cornerSyncBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  syncIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 36, // Tránh đè lên nút sync ở góc
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  pencilBtn: {
    padding: 2,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  iconActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  editSectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  editSectionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricBox: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  metricEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    marginTop: 2,
  },
  bmiPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  bmiPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  macroEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  macroCal: {
    fontSize: 11,
    marginTop: 2,
  },
  onboardingShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  shortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  bodyModalScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  formTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  chipBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activityRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalInputWrap: {
    marginBottom: 14,
  },
  aiCalcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 18,
  },
  aiCalcBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalCancelBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ProfileScreen;
