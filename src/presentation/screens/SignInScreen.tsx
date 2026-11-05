import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useAuthStore } from '../store/authStore';

export function SignInScreen() {
  const [email, setEmail] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleSignIn = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    const success = await login(email.trim());
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập thất bại', error || 'Vui lòng thử lại sau.');
    }
  };

  const handleContinueAsGuest = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="nutrition" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>NutriVision</Text>
        <Text style={styles.subtitle}>
          Theo dõi dinh dưỡng & nhận diện món ăn Việt bằng AI
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email của bạn</Text>
        <TextInput
          style={styles.input}
          placeholder="vd: user@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.btn, isLoading && { opacity: 0.7 }]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.btnText}>Đăng nhập / Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestBtn} onPress={handleContinueAsGuest}>
          <Text style={styles.guestBtnText}>Tiếp tục chế độ ngoại tuyến (Khách)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  guestBtn: {
    marginTop: 14,
    alignItems: 'center',
    padding: 8,
  },
  guestBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SignInScreen;

