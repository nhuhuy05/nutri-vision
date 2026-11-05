import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useAuthStore, useGoalStore } from '../store';
import { useSync } from '../hooks/useSync';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { goals, updateGoals } = useGoalStore();
  const { pendingCount, isOnline, syncNow, isSyncing } = useSync();

  const [calories, setCalories] = useState(String(goals.calories));
  const [protein, setProtein] = useState(String(goals.protein));
  const [carbs, setCarbs] = useState(String(goals.carbs));
  const [fat, setFat] = useState(String(goals.fat));

  const handleSaveGoals = () => {
    const c = parseInt(calories, 10);
    const p = parseInt(protein, 10);
    const cb = parseInt(carbs, 10);
    const f = parseInt(fat, 10);

    if (isNaN(c) || isNaN(p) || isNaN(cb) || isNaN(f)) {
      Alert.alert('Lỗi', 'Vui lòng nhập các chỉ số dinh dưỡng hợp lệ dạng số.');
      return;
    }

    updateGoals({ calories: c, protein: p, carbs: cb, fat: f });
    Alert.alert('Thành công', 'Đã lưu mục tiêu dinh dưỡng cá nhân!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name}>{user?.name || 'Người dùng NutriVision'}</Text>
            <Text style={styles.email}>{user?.email || 'minhnhat@example.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Tài khoản Cá nhân</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Target Goals Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🎯 Thiết lập mục tiêu hàng ngày</Text>
        <Text style={styles.sectionDesc}>
          Cập nhật mục tiêu năng lượng và tỷ lệ dinh dưỡng phù hợp với thể trạng
        </Text>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Calo (kcal)</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Chất đạm (g Protein)</Text>
          <TextInput
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Tinh bột (g Carbs)</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Chất béo (g Fat)</Text>
          <TextInput
            style={styles.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoals}>
          <Text style={styles.saveBtnText}>Lưu mục tiêu mới</Text>
        </TouchableOpacity>
      </View>

      {/* System & Offline Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⚙️ Trạng thái đồng bộ & Bộ nhớ</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Trạng thái mạng:</Text>
          <Text style={{ fontWeight: '600', color: isOnline ? COLORS.primary : COLORS.danger }}>
            {isOnline ? 'Đang kết nối' : 'Ngoại tuyến'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Bản ghi SQLite chờ đồng bộ:</Text>
          <Text style={{ fontWeight: '600', color: COLORS.text }}>
            {pendingCount} bản ghi
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.syncBtn, (!isOnline || pendingCount === 0) && styles.syncBtnDisabled]}
          onPress={syncNow}
          disabled={!isOnline || isSyncing}
        >
          <Ionicons name="sync" size={16} color="#FFFFFF" />
          <Text style={styles.syncBtnText}>
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay lên Supabase'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  formLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    width: 90,
    height: 36,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: '#FAFAFA',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 14,
  },
  syncBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    gap: 8,
    marginTop: 10,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ProfileScreen;

