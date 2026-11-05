import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const DISH_OPTIONS = [
  {
    name: 'Phở bò tái lăn',
    shortName: 'Phở tái lăn',
    region: 'Món Bắc',
    desc: 'Bánh phở tươi • Thịt bò xào lăn • Hành hoa',
    cal: '520',
    unit: 'KCAL',
    thumb: require('../../../assets/images/onboarding/dish_pho.png'),
  },
  {
    name: 'Cơm tấm sườn nướng',
    shortName: 'Cơm tấm sườn',
    region: 'Món Nam',
    desc: 'Gạo tấm • Sườn nướng mật ong • Trứng ốp la',
    cal: '685',
    unit: 'KCAL',
    thumb: require('../../../assets/images/onboarding/dish_comtam.png'),
  },
  {
    name: 'Bún bò Huế đặc biệt',
    shortName: 'Bún bò Huế',
    region: 'Món Trung',
    desc: 'Bún sợi to • Bắp bò hoa • Chả cua • Nước dùng ruốc',
    cal: '590',
    unit: 'KCAL',
    thumb: require('../../../assets/images/onboarding/dish_bunbo.png'),
  },
];

export function OnboardingIntroScreen() {
  const [currentSlide, setCurrentSlide] = useState<1 | 2 | 3>(1);
  const [selectedDishIndex, setSelectedDishIndex] = useState(0);

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      handleFinishOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 1) {
      setCurrentSlide((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSkip = () => {
    handleFinishOnboarding();
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@nutrivision_has_seen_intro', 'true');
    } catch {
      // ignore
    }
    // Navigate to profile setup wizard so user can personalize their goals
    router.replace('/(auth)/onboarding');
  };

  const handleGoToSignIn = async () => {
    try {
      await AsyncStorage.setItem('@nutrivision_has_seen_intro', 'true');
    } catch {
      // ignore
    }
    router.replace('/(auth)/sign-in');
  };

  const handleExploreAsGuest = async () => {
    try {
      await AsyncStorage.setItem('@nutrivision_has_seen_intro', 'true');
    } catch {
      // ignore
    }
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        {currentSlide > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={handlePrev}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <View style={styles.logoIconBox}>
              <Ionicons name="leaf" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.logoText}>
              Nutri<Text style={{ color: COLORS.primary }}>Lens</Text>
            </Text>
          </View>
        )}

        {currentSlide > 1 && (
          <View style={styles.logoRow}>
            <View style={styles.logoIconBox}>
              <Ionicons name="leaf" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.logoText}>
              Nutri<Text style={{ color: COLORS.primary }}>Lens</Text>
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= SLIDE 1 ================= */}
        {currentSlide === 1 && (
          <View style={styles.slideWrap}>
            {/* Innovation Badge */}
            <View style={styles.badgePill}>
              <Ionicons name="sparkles" size={13} color={COLORS.primary} />
              <Text style={styles.badgeText}>KỶ NGUYÊN DINH DƯỠNG MỚI</Text>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Thấu hiểu bữa ăn{'\n'}trong nháy mắt
            </Text>

            {/* Tagline & Subtitle */}
            <Text style={styles.tagline}>“See your food. Know your nutrition.”</Text>
            <Text style={styles.subtext}>
              Trợ lý AI thế hệ mới giúp bạn kiểm soát năng lượng và nâng niu sức khỏe mỗi ngày qua từng bức ảnh chụp.
            </Text>

            {/* Hero Visual Card: Interactive AI Scanner Viewfinder */}
            <View style={styles.scannerHeroCard}>
              {/* Camera Viewport Mockup */}
              <View style={styles.viewport}>
                {/* Real Food Image from Figma */}
                <Image
                  source={require('../../../assets/images/onboarding/onboarding_1_hero.png')}
                  style={styles.heroViewportImg}
                  resizeMode="cover"
                />
                <View style={styles.heroImgOverlay} />

                {/* Center Viewfinder Reticle Corners */}
                <View style={[styles.reticleCorner, styles.reticleTL]} />
                <View style={[styles.reticleCorner, styles.reticleTR]} />
                <View style={[styles.reticleCorner, styles.reticleBL]} />
                <View style={[styles.reticleCorner, styles.reticleBR]} />

                {/* Top-Left: Meal Name Tag */}
                <View style={styles.mealNameTag}>
                  <Ionicons name="restaurant" size={12} color={COLORS.primary} />
                  <Text style={styles.mealNameTagText}>Phở Bò Tái Lăn</Text>
                </View>

                {/* Top-Right: Accuracy Tag */}
                <View style={styles.matchTag}>
                  <Ionicons name="checkmark-circle" size={13} color={COLORS.primary} />
                  <Text style={styles.matchTagText}>98% chính xác</Text>
                </View>

                {/* Floating Bottom Nutrient Pills */}
                <View style={styles.floatingPillsRow}>
                  <View style={styles.nutrientFloatingPill}>
                    <Ionicons name="flame" size={14} color="#EF4444" />
                    <View>
                      <Text style={styles.floatingPillLabel}>Năng lượng</Text>
                      <Text style={styles.floatingPillValue}>520 kcal</Text>
                    </View>
                  </View>

                  <View style={styles.nutrientFloatingPill}>
                    <Ionicons name="fitness" size={14} color={COLORS.purple} />
                    <View>
                      <Text style={styles.floatingPillLabel}>Chất đạm</Text>
                      <Text style={styles.floatingPillValue}>28g Đạm</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= SLIDE 2 ================= */}
        {currentSlide === 2 && (
          <View style={styles.slideWrap}>
            {/* Category Badge */}
            <View style={styles.badgePill}>
              <Ionicons name="book" size={13} color={COLORS.primary} />
              <Text style={styles.badgeText}>CƠ SỞ DỮ LIỆU ĐẶC BIỆT</Text>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Chuyên gia nhận diện{'\n'}món ăn Việt Nam
            </Text>

            {/* Subtext */}
            <Text style={styles.subtext}>
              NutriLens được huấn luyện chuyên sâu với hơn{' '}
              <Text style={{ fontWeight: '700', color: COLORS.primaryDark }}>
                5.000+ món ăn truyền thống & đường phố Việt Nam
              </Text>
              , bóc tách chính xác từng loại gia vị, dầu mỡ và thành phần.
            </Text>

            {/* Micro-delight Value Highlights */}
            <View style={styles.valueChipsRow}>
              <View style={styles.valueChip}>
                <Ionicons name="map-outline" size={14} color={COLORS.primary} />
                <Text style={styles.valueChipText}>
                  Khẩu vị Bắc • Trung • Nam
                </Text>
              </View>
              <View style={styles.valueChip}>
                <Ionicons name="water-outline" size={14} color={COLORS.primary} />
                <Text style={styles.valueChipText}>
                  Tính dầu mỡ & nước dùng
                </Text>
              </View>
            </View>

            {/* Live AI Camera Recognition Showcase */}
            <View style={styles.vietnameseShowcaseCard}>
              {/* Camera Preview HUD */}
              <View style={styles.slide2CameraViewport}>
                <Image
                  source={require('../../../assets/images/onboarding/onboarding_2_hero.png')}
                  style={styles.slide2CameraImg}
                  resizeMode="cover"
                />
                <View style={styles.slide2CameraOverlay} />
                <View style={styles.showcaseTopRow}>
                  <View style={styles.aiScanHudBadge}>
                    <View style={styles.pulsingDot} />
                    <Text style={styles.aiScanHudText}>AI SCAN • 99% CHÍNH XÁC</Text>
                  </View>
                  <View style={styles.regionalTag}>
                    <Text style={styles.regionalTagText}>
                      {DISH_OPTIONS[selectedDishIndex].region}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Main Detected Food Card */}
              <View style={styles.detectedDishCard}>
                <View style={styles.detectedDishHeader}>
                  <Image
                    source={DISH_OPTIONS[selectedDishIndex].thumb}
                    style={styles.detectedDishImg}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.detectedDishTitle}>
                      {DISH_OPTIONS[selectedDishIndex].name}
                    </Text>
                    <Text style={styles.detectedDishDesc}>
                      {DISH_OPTIONS[selectedDishIndex].desc}
                    </Text>
                  </View>
                  <View style={styles.calorieBadge}>
                    <Text style={styles.calorieBadgeNum}>
                      {DISH_OPTIONS[selectedDishIndex].cal}
                    </Text>
                    <Text style={styles.calorieBadgeUnit}>
                      {DISH_OPTIONS[selectedDishIndex].unit}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Multimodal Alternative Interactive Selector */}
              <View style={styles.alternativesSection}>
                <Text style={styles.alternativesTitle}>Thử chuyển đổi món nhận diện:</Text>
                <View style={styles.thumbnailsRow}>
                  {DISH_OPTIONS.map((item, idx) => {
                    const isSelected = selectedDishIndex === idx;
                    return (
                      <TouchableOpacity
                        key={item.name}
                        style={[
                          styles.thumbnailBtn,
                          isSelected && styles.thumbnailBtnActive,
                        ]}
                        onPress={() => setSelectedDishIndex(idx)}
                      >
                        <Image
                          source={item.thumb}
                          style={styles.thumbDishImg}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            styles.thumbName,
                            isSelected && styles.thumbNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.shortName}
                        </Text>
                        <Text style={styles.thumbCal}>{item.cal} kcal</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= SLIDE 3 ================= */}
        {currentSlide === 3 && (
          <View style={styles.slideWrap}>
            {/* Badge */}
            <View style={styles.badgePill}>
              <Ionicons name="analytics" size={13} color={COLORS.primary} />
              <Text style={styles.badgeText}>KHOA HỌC & CÁ NHÂN HÓA</Text>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Theo dõi đa lượng &{'\n'}Thấu hiểu cơ thể
            </Text>

            {/* Subtext */}
            <Text style={styles.subtext}>
              Không chỉ đếm calo thuần túy, NutriLens cân bằng tối ưu tỷ lệ chất đạm, tinh bột và chất béo phù hợp với thể trạng riêng của bạn.
            </Text>

            {/* Hero Visual Card: Macro Target Dashboard Preview */}
            <View style={styles.macroDashboardCard}>
              <View style={styles.macroCardHeader}>
                <View>
                  <Text style={styles.macroHeaderLabel}>MỤC TIÊU HÔM NAY</Text>
                  <View style={styles.macroHeaderValRow}>
                    <Text style={styles.macroHeaderValNum}>1.850</Text>
                    <Text style={styles.macroHeaderValUnit}>/ 2.100 kcal</Text>
                  </View>
                </View>
                <View style={styles.macroPercentPill}>
                  <Text style={styles.macroPercentText}>88%</Text>
                </View>
              </View>

              {/* Progress Track */}
              <View style={styles.macroMainTrack}>
                <View style={[styles.macroMainBar, { width: '88%' }]} />
              </View>

              {/* Tri-Macro Distribution Grid */}
              <View style={styles.triGrid}>
                {/* Protein */}
                <View style={styles.triCol}>
                  <View style={styles.triColTop}>
                    <View style={[styles.triDot, { backgroundColor: COLORS.purple }]} />
                    <Text style={styles.triColTitle}>Đạm</Text>
                  </View>
                  <Text style={styles.triColVal}>105g</Text>
                  <Text style={styles.triColPct}>30% • 420 kcal</Text>
                </View>

                {/* Carbs */}
                <View style={styles.triCol}>
                  <View style={styles.triColTop}>
                    <View style={[styles.triDot, { backgroundColor: COLORS.accent }]} />
                    <Text style={styles.triColTitle}>Carbs</Text>
                  </View>
                  <Text style={styles.triColVal}>210g</Text>
                  <Text style={styles.triColPct}>45% • 840 kcal</Text>
                </View>

                {/* Fat */}
                <View style={styles.triCol}>
                  <View style={styles.triColTop}>
                    <View style={[styles.triDot, { backgroundColor: COLORS.yellow }]} />
                    <Text style={styles.triColTitle}>Chất béo</Text>
                  </View>
                  <Text style={styles.triColVal}>48g</Text>
                  <Text style={styles.triColPct}>25% • 432 kcal</Text>
                </View>
              </View>

              {/* AI Smart Assistant Advice Card */}
              <View style={styles.aiAdviceBox}>
                <View style={styles.aiAdviceHeader}>
                  <Ionicons name="bulb" size={15} color={COLORS.primary} />
                  <Text style={styles.aiAdviceTitle}>Gợi ý từ NutriLens AI</Text>
                </View>
                <Text style={styles.aiAdviceDesc}>
                  Lượng đạm hôm nay rất lý tưởng cho quá trình duy trì cơ bắp! Bữa tối hãy ưu tiên món thanh đạm ít dầu mỡ nhé.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Area */}
      <View style={styles.bottomArea}>
        {/* Step Indicator Dots */}
        <View style={styles.dotsRow}>
          {[1, 2, 3].map((step) => {
            const isActive = currentSlide === step;
            return (
              <View
                key={step}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>
            {currentSlide === 1 && 'KHÁM PHÁ NGAY'}
            {currentSlide === 2 && 'TIẾP TỤC'}
            {currentSlide === 3 && 'BẮT ĐẦU NGAY'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Secondary Links Row */}
        <View style={styles.secondaryLinksRow}>
          {currentSlide === 1 && (
            <TouchableOpacity onPress={handleGoToSignIn}>
              <Text style={styles.secondaryLinkText}>
                Tôi đã có tài khoản NutriLens • <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          )}

          {currentSlide === 2 && (
            <TouchableOpacity onPress={handleExploreAsGuest}>
              <Text style={styles.secondaryLinkText}>
                Dùng thử nhanh với tư cách khách
              </Text>
            </TouchableOpacity>
          )}

          {currentSlide === 3 && (
            <TouchableOpacity onPress={handleGoToSignIn}>
              <Text style={styles.secondaryLinkText}>
                Đã có tài khoản? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Đăng nhập ngay</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },
  slideWrap: {
    width: '100%',
  },
  badgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 35,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  scannerHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 10,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  viewport: {
    height: 240,
    borderRadius: 16,
    backgroundColor: '#F3F9F4',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
  },
  reticleTL: {
    top: 24,
    left: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  reticleTR: {
    top: 24,
    right: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  reticleBL: {
    bottom: 48,
    left: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  reticleBR: {
    bottom: 48,
    right: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  heroViewportImg: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroImgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  mealNameTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  mealNameTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  matchTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  matchTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  floatingPillsRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 10,
  },
  nutrientFloatingPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  floatingPillLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  floatingPillValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  valueChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  valueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  valueChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  vietnameseShowcaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  slide2CameraViewport: {
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  slide2CameraImg: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  slide2CameraOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  showcaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  aiScanHudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  aiScanHudText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  regionalTag: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  regionalTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  detectedDishCard: {
    backgroundColor: '#F9FCF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    marginBottom: 14,
  },
  detectedDishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detectedDishImg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  detectedDishTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  detectedDishDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
  calorieBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  calorieBadgeNum: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  calorieBadgeUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  alternativesSection: {
    marginTop: 2,
  },
  alternativesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbnailBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  thumbnailBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  thumbDishImg: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
  },
  thumbName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  thumbNameActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  thumbCal: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  macroDashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 18,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  macroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  macroHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  macroHeaderValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  macroHeaderValNum: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  macroHeaderValUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  macroPercentPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  macroPercentText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  macroMainTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
    overflow: 'hidden',
    marginBottom: 16,
  },
  macroMainBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  triGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FCF8',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginBottom: 14,
  },
  triCol: {
    flex: 1,
    alignItems: 'center',
  },
  triColTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  triDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  triColTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  triColVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  triColPct: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  aiAdviceBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 12,
  },
  aiAdviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiAdviceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  aiAdviceDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  bottomArea: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: COLORS.background,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: COLORS.border,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryLinksRow: {
    alignItems: 'center',
    marginTop: 14,
  },
  secondaryLinkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
