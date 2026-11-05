import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useAuthStore } from '../store/authStore';
import { notify } from '../utils/notify';

export function SignInScreen() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    login,
    register,
    loginWithBiometrics,
    checkBiometrics,
    isBiometricAvailable,
    biometryType,
    isLoading,
    error,
  } = useAuthStore();

  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  const getBiometricTitle = () => {
    if (biometryType === 'FINGERPRINT') return 'Vân tay (Touch ID)';
    if (biometryType === 'FACE_ID') return 'Face ID';
    return 'Face ID / Sinh trắc học';
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    if (biometryType === 'FINGERPRINT') return 'finger-print-outline';
    return 'scan-outline';
  };

  const handleSubmit = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      notify.warning('Lỗi định dạng', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (!password || password.length < 6) {
      notify.warning('Mật khẩu quá ngắn', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (isSignUpMode && !name.trim()) {
      notify.warning('Thiếu thông tin', 'Vui lòng nhập họ tên của bạn để tạo hồ sơ.');
      return;
    }

    if (isSignUpMode) {
      const success = await register(cleanEmail, password, name.trim());
      if (success) {
        notify.confirm(
          'Đăng ký thành công! 🎉',
          'Chào mừng bạn đến với NutriLens! Hãy cùng thiết lập chỉ số dinh dưỡng cá nhân nhé.',
          () => router.replace('/(auth)/onboarding'),
          () => router.replace('/(tabs)'),
          'Thiết lập ngay',
          'Để sau'
        );
      } else {
        notify.error(
          'Đăng ký thất bại',
          error || 'Không thể tạo tài khoản, vui lòng thử lại sau.'
        );
      }
    } else {
      const success = await login(cleanEmail, password);
      if (success) {
        notify.toast('Chào mừng bạn quay trở lại NutriLens!');
        router.replace('/(tabs)');
      } else {
        notify.error(
          'Đăng nhập thất bại',
          error || 'Email hoặc mật khẩu không chính xác.'
        );
      }
    }
  };

  const handleContinueAsGuest = () => {
    router.replace('/(tabs)');
  };

  const handleBiometricPress = async () => {
    const success = await loginWithBiometrics();
    if (success) {
      notify.toast('Đăng nhập sinh trắc học thành công!');
      router.replace('/(tabs)');
    } else {
      const authErr = useAuthStore.getState().error;
      notify.error(
        'Xác thực ' + getBiometricTitle(),
        authErr || 'Xác thực sinh trắc học không thành công. Vui lòng đăng nhập bằng Email và Mật khẩu.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)');
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>
          {isSignUpMode ? 'Đăng Ký NutriLens' : 'Đăng Nhập NutriLens'}
        </Text>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() =>
            notify.info(
              'Trợ giúp NutriLens',
              'Nếu bạn gặp sự cố đăng nhập hoặc quên mật khẩu, hãy liên hệ hỗ trợ: support@nutrilens.app'
            )
          }
        >
          <Ionicons name="help-circle-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Ambient Sparkle & Greeting Block */}
        <View style={styles.greetingBlock}>
          <View style={styles.badgePill}>
            <Ionicons name="sparkles" size={13} color={COLORS.primary} />
            <Text style={styles.badgeText}>AI NUTRITIONIST</Text>
          </View>

          <Text style={styles.greetingTitle}>
            {isSignUpMode ? 'Khởi đầu bữa ăn mới! 🌱' : 'Chào mừng trở lại! 👋'}
          </Text>

          <Text style={styles.greetingSubtitle}>
            {isSignUpMode
              ? 'Tạo tài khoản để cá nhân hóa khẩu phần ăn và nhận gợi ý thực đơn thông minh.'
              : 'Nhập thông tin tài khoản NutriLens của bạn để tiếp tục theo dõi thực đơn lành mạnh mỗi ngày.'}
          </Text>
        </View>

        {/* Ambient Visual Bento Insight Chip */}
        <View style={styles.bentoChip}>
          <View style={styles.bentoIconBox}>
            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bentoTitle}>Thực đơn cá nhân hoá</Text>
            <Text style={styles.bentoSubtitle}>Hơn 1,200 món ăn Việt chuẩn calo</Text>
          </View>
          <View style={styles.bentoArrowBox}>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Segmented Mode Toggle */}
          <View style={styles.segmentedToggle}>
            <TouchableOpacity
              style={[styles.segmentBtn, !isSignUpMode && styles.segmentBtnActive]}
              onPress={() => setIsSignUpMode(false)}
            >
              <Text style={[styles.segmentText, !isSignUpMode && styles.segmentTextActive]}>
                Đăng nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, isSignUpMode && styles.segmentBtnActive]}
              onPress={() => setIsSignUpMode(true)}
            >
              <Text style={[styles.segmentText, isSignUpMode && styles.segmentTextActive]}>
                Đăng ký mới
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Field (Sign Up Only) */}
          {isSignUpMode && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Họ và tên</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.textSecondary}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="vd: Linh Nguyễn"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email or Phone Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email hoặc Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={COLORS.textSecondary}
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="linh.nguyen@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={COLORS.textSecondary}
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.rightIconBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Helper Row: Remember Me & Forgot Password */}
          {!isSignUpMode && (
            <View style={styles.helperRow}>
              <TouchableOpacity
                style={styles.rememberMeBtn}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  notify.info(
                    'Quên mật khẩu?',
                    'Vui lòng nhập email vào ô trên và liên hệ hỗ trợ để nhận liên kết đặt lại mật khẩu.'
                  )
                }
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Primary Action CTA Button (Forest Green Pill) */}
          <TouchableOpacity
            style={[styles.primaryCtaBtn, isLoading && { opacity: 0.75 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.ctaContentRow}>
                <Text style={styles.primaryCtaText}>
                  {isSignUpMode ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Biometric Face ID Authentication Section */}
        {!isSignUpMode && isBiometricAvailable && (
          <View style={styles.biometricSection}>
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometricPress}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name={getBiometricIcon()} size={26} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.biometricLabel}>
              Đăng nhập nhanh bằng {getBiometricTitle()}
            </Text>
          </View>
        )}

        {/* Elegant Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Secondary Action: Explore as Guest */}
        <TouchableOpacity style={styles.guestPillBtn} onPress={handleContinueAsGuest}>
          <Text style={styles.guestPillText}>Dùng thử với tư cách khách</Text>
          <Ionicons name="chevron-forward" size={15} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Action: Personalized Nutrition Profile Setup */}
        <TouchableOpacity
          style={styles.onboardingPillBtn}
          onPress={() => router.push('/(auth)/onboarding')}
        >
          <Ionicons name="sparkles" size={15} color={COLORS.primary} />
          <Text style={styles.onboardingPillText}>
            Thiết lập mục tiêu dinh dưỡng cá nhân
          </Text>
          <Ionicons name="chevron-forward" size={15} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Bottom Nutrition Quote Tagline & Footer CTA */}
        <View style={styles.footerSection}>
          <View style={styles.streakQuotePill}>
            <Ionicons name="heart" size={13} color={COLORS.primary} />
            <Text style={styles.streakQuoteText}>
              Đồng hành cùng 50,000+ bữa ăn lành mạnh
            </Text>
          </View>

          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthPrompt}>
              {isSignUpMode ? 'Đã có tài khoản NutriLens? ' : 'Chưa có tài khoản? '}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUpMode(!isSignUpMode)}>
              <Text style={styles.switchAuthAction}>
                {isSignUpMode ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // #F5FBF4
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  greetingBlock: {
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  greetingTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
  bentoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  bentoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  bentoSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bentoArrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: '#E8F8EC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
  },
  leftIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  rightIconBtn: {
    padding: 6,
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  rememberMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryCtaBtn: {
    backgroundColor: COLORS.primary, // Deep Forest Green #1B5E20
    height: 52,
    borderRadius: 9999, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 4,
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  biometricSection: {
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  biometricBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  biometricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  guestPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  guestPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  onboardingPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
    marginTop: 10,
  },
  onboardingPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  streakQuotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
  },
  streakQuoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchAuthPrompt: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  switchAuthAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SignInScreen;
