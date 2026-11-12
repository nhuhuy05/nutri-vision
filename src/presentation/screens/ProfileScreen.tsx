import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/colors';
import { useAuthStore, useGoalStore } from '../store';
import { useSync } from '../hooks/useSync';
import { notify } from '../utils/notify';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { user, isAuthenticated, logout, updateUserProfile, isLoading: isAuthLoading } = useAuthStore();
  const { goals, updateGoals } = useGoalStore();
  const { pendingCount, syncNow, isSyncing } = useSync();

  // Chỉnh sửa tên hiển thị
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');

  // Modal chỉnh sửa mục tiêu calo
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [caloriesInput, setCaloriesInput] = useState(String(goals.calories));

  const handleOpenGoalModal = () => {
    setCaloriesInput(String(goals.calories));
    setIsGoalModalVisible(true);
  };

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

  const handleSaveGoals = () => {
    const c = parseInt(caloriesInput, 10);
    if (isNaN(c) || c <= 0) {
      notify.warning('Lỗi định dạng', 'Vui lòng nhập lượng Calo hợp lệ.');
      return;
    }

    updateGoals({ calories: c });
    setIsGoalModalVisible(false);
    notify.toast('Đã cập nhật mục tiêu calo hàng ngày');
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
              Đăng nhập để đồng bộ dữ liệu trên nhiều thiết bị.
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
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // 2. KHI ĐÃ ĐĂNG NHẬP (DANH SÁCH CÀI ĐẶT TIÊU CHUẨN)
  // =========================================================================
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getSyncStatusText = () => {
    if (isSyncing) return 'Đang đồng bộ...';
    if (pendingCount > 0) return `${pendingCount} mục chưa sao lưu`;
    return 'Đã sao lưu';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 16, 24) }]}
    >
      {/* Hồ sơ cá nhân Header */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
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
          </View>
        </View>
      </View>

      {/* Cài đặt & Mục tiêu Group */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>CÀI ĐẶT & MỤC TIÊU</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight, paddingVertical: 0 }]}>
        {/* Dòng 1: Mục tiêu Calo hàng ngày */}
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.borderLight }]}
          onPress={handleOpenGoalModal}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flame-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Mục tiêu calo hàng ngày</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Bấm để chỉnh sửa hoặc tính lại TDEE
              </Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.primary }]}>{goals.calories} kcal</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Dòng 2: Đồng bộ dữ liệu đám mây */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconWrap, { backgroundColor: pendingCount > 0 ? '#FEF3C7' : colors.primaryLight }]}>
              <Ionicons
                name="cloud-outline"
                size={18}
                color={pendingCount > 0 ? '#D97706' : colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Đồng bộ đám mây</Text>
              <Text
                style={[
                  styles.settingSubtitle,
                  { color: pendingCount > 0 ? '#D97706' : colors.textSecondary },
                ]}
              >
                {getSyncStatusText()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.inlineSyncBtn,
              { backgroundColor: colors.primaryLight },
              isSyncing && { opacity: 0.6 },
            ]}
            onPress={syncNow}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="sync" size={14} color={colors.primary} />
                <Text style={[styles.inlineSyncBtnText, { color: colors.primary }]}>Đồng bộ ngay</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Nút Đăng xuất */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color="#DC2626" />
        <Text style={styles.logoutBtnText}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Modal Chỉnh sửa Mục tiêu Calo */}
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

            {/* Shortcut tính lại thể trạng TDEE */}
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
                Tính toán lại theo thể trạng (TDEE Onboarding)
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
    paddingBottom: 40,
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
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
  inlineSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  inlineSyncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
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
  modalInputWrap: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
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
    flex: 1,
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
