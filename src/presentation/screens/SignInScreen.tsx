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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useAuthStore } from '../store/authStore';
import { notify } from '../utils/notify';

export function SignInScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [isSignUpMode, setIsSignUpMode] = useState(params.mode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  const {
    login,
    register,
    resetPassword,
    loadSavedEmail,
    isLoading,
    error,
  } = useAuthStore();

  useEffect(() => {
    const initScreen = async () => {
      await loadSavedEmail();
      const saved = useAuthStore.getState().savedEmail;
      if (saved) {
        setEmail((prev) => prev || saved);
      }

      try {
        const setupDone = await AsyncStorage.getItem('@nutrivision_has_completed_setup');
        setHasCompletedSetup(setupDone === 'true');
      } catch {
        setHasCompletedSetup(false);
      }
    };
    initScreen();
  }, [loadSavedEmail]);

  const handleSubmit = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      notify.warning('Email không hợp lệ', 'Vui lòng nhập địa chỉ email chính xác (ví dụ: ten@gmail.com).');
      return;
    }

    if (!password || password.length < 6) {
      notify.warning('Mật khẩu quá ngắn', 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      return;
    }

    if (isSignUpMode) {
      if (!name.trim()) {
        notify.warning('Thiếu họ tên', 'Vui lòng nhập họ và tên của bạn để tạo tài khoản.');
        return;
      }

      if (password !== confirmPassword) {
        notify.warning('Mật khẩu không khớp', 'Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.');
        return;
      }

      const success = await register(cleanEmail, password, name.trim());
      if (success) {
        notify.confirm(
          'Đăng ký thành công! 🎉',
          'Chào mừng bạn đến với NutriVision! Hãy cùng thiết lập chỉ số dinh dưỡng cá nhân nhé.',
          () => router.replace('/(auth)/onboarding'),
          () => router.replace('/(tabs)'),
          'Thiết lập ngay',
          'Để sau'
        );
      } else {
        notify.error(
          'Đăng ký không thành công',
          error || 'Không thể tạo tài khoản lúc này, vui lòng thử lại sau.'
        );
      }
    } else {
      const success = await login(cleanEmail, password, rememberMe);
      if (success) {
        notify.toast('Chào mừng bạn quay trở lại NutriVision!');
        router.replace('/(tabs)');
      } else {
        notify.error(
          'Đăng nhập không thành công',
          error || 'Email hoặc mật khẩu không chính xác.'
        );
      }
    }
  };

  const handleForgotPassword = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      notify.warning(
        'Nhập email',
        'Vui lòng điền địa chỉ email của bạn vào ô bên trên để NutriVision gửi liên kết đặt lại mật khẩu.'
      );
      return;
    }

    notify.confirm(
      'Khôi phục mật khẩu',
      `Gửi email hướng dẫn đặt lại mật khẩu đến: ${cleanEmail}?`,
      async () => {
        const ok = await resetPassword(cleanEmail);
        if (ok) {
          notify.success(
            'Đã gửi liên kết thành công!',
            'Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác) để hoàn tất đặt lại mật khẩu mới.'
          );
        } else {
          notify.error('Lỗi gửi email', error || 'Không thể gửi email khôi phục lúc này. Vui lòng thử lại sau.');
        }
      },
      () => {},
      'Gửi liên kết',
      'Hủy'
    );
  };

  const handleShowTerms = () => {
    notify.info(
      'Điều khoản dịch vụ',
      'NutriVision cung cấp công cụ tính toán calo và dinh dưỡng dựa trên ảnh chụp AI nhằm mục đích tham khảo và hỗ trợ lối sống lành mạnh. Ứng dụng không thay thế chẩn đoán y khoa chuyên nghiệp.'
    );
  };

  const handleShowPrivacy = () => {
    notify.info(
      'Chính sách bảo mật',
      'NutriVision cam kết bảo mật 100% hình ảnh bữa ăn và chỉ số sinh học cá nhân của bạn, không chia sẻ cho bên thứ ba vì mục đích thương mại.'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />

        <Text style={styles.topBarTitle}>
          {isSignUpMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
        </Text>

        <TouchableOpacity
          style={styles.circleBtn}
          accessibilityRole="button"
          accessibilityLabel="Trợ giúp NutriVision"
          onPress={() =>
            notify.info(
              'Trợ giúp NutriVision',
              'Nếu bạn gặp sự cố đăng nhập hoặc cần hỗ trợ tài khoản, vui lòng liên hệ đội ngũ cố vấn: support@nutrivision.app'
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
            {isSignUpMode ? 'Tạo tài khoản mới 🌱' : 'Chào mừng trở lại! 👋'}
          </Text>

          <Text style={styles.greetingSubtitle}>
            {isSignUpMode
              ? 'Đăng ký để cá nhân hoá thực đơn và theo dõi dinh dưỡng thông minh.'
              : 'Nhập thông tin tài khoản NutriVision của bạn để tiếp tục theo dõi thực đơn lành mạnh mỗi ngày.'}
          </Text>
        </View>

        {/* Ambient Visual Bento Insight Chip with Checkmark Badge (Sign In Only) */}
        {!isSignUpMode && (
          <View style={styles.bentoChip}>
            <View style={styles.bentoIconBox}>
              <Ionicons name="book-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bentoTitle}>Thực đơn cá nhân hoá</Text>
              <Text style={styles.bentoSubtitle}>Hơn 1,200 món ăn Việt chuẩn calo</Text>
            </View>
            <View style={styles.bentoBadgeBox}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
            </View>
          </View>
        )}

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Full Name Field (Sign Up Only) */}
          {isSignUpMode && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Họ và tên <Text style={{ color: COLORS.danger }}>*</Text>
              </Text>
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

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {isSignUpMode ? 'Email đăng ký' : 'Email đăng nhập'}{' '}
              <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
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
            <Text style={styles.fieldLabel}>
              Mật khẩu <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
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

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUpMode && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Xác nhận lại mật khẩu <Text style={{ color: COLORS.danger }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={COLORS.textSecondary}
                  style={styles.leftIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập lại mật khẩu vừa đặt"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.rightIconBtn}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Helper Row: Remember Me & Forgot Password (Sign In Only) */}
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

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Primary Action CTA Button */}
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
                  {isSignUpMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Terms & Privacy Note (Sign Up Only) */}
          {isSignUpMode && (
            <View style={styles.termsBox}>
              <Text style={styles.termsText}>
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Text style={styles.termsLink} onPress={handleShowTerms}>
                  Điều khoản dịch vụ
                </Text>
                {' & '}
                <Text style={styles.termsLink} onPress={handleShowPrivacy}>
                  Chính sách bảo mật
                </Text>
                {' của NutriVision.'}
              </Text>
            </View>
          )}

          {/* Quick Setup Action: visible if user has NOT completed setup before */}
          {!hasCompletedSetup && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.quickSetupBtn}
                onPress={() => router.push('/(auth)/onboarding')}
              >
                <Text style={styles.quickSetupText}>Thiết lập nhanh</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primaryDark} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bottom Switch Auth: ALWAYS AT THE VERY BOTTOM */}
        <View style={styles.footerSection}>
          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthPrompt}>
              {isSignUpMode ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
            </Text>
            <TouchableOpacity
              onPress={() => setIsSignUpMode(!isSignUpMode)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
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
    backgroundColor: COLORS.background,
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
  topBarSpacer: {
    width: 38,
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
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
  bentoBadgeBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
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
  termsBox: {
    marginTop: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 17,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.primaryDark,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  primaryCtaBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 9999,
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
  switchAuthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchAuthPrompt: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  switchAuthAction: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
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
  quickSetupBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    gap: 8,
    shadowColor: COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  quickSetupText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.2,
  },
  footerSection: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SignInScreen;
