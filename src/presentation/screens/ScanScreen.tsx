import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, AppColors } from '../theme';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';
import { useRecognize } from '../hooks/useRecognize';
import { ScanOverlay } from '../components/ScanOverlay';
import { networkInfo } from '../../di/container';
import { notify } from '../utils/notify';

export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const {
    selectedImage,
    setSelectedImage,
    isRecognizing,
    candidates,
    error,
    recognize,
    reset,
  } = useRecognize();

  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    networkInfo.isConnected().then(setIsOnline).catch(() => setIsOnline(false));
  }, []);

  const handlePickImage = useCallback(
    async (useCamera: boolean) => {
      try {
        const permissionResult = useCamera
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          notify.warning(
            'Quyền truy cập',
            'Vui lòng cấp quyền truy cập để ứng dụng có thể chụp hoặc chọn ảnh món ăn.'
          );
          return;
        }

        const result = useCamera
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.85,
              allowsEditing: true,
              aspect: [4, 3],
              base64: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.85,
              allowsEditing: true,
              aspect: [4, 3],
              base64: true,
            });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setSelectedImage(asset.uri);
          const imagePayload = asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri;

          await recognize(imagePayload);
        }
      } catch (err) {
        console.error('Pick image error:', err);
        notify.error('Lỗi', 'Không thể mở máy ảnh hoặc thư viện ảnh.');
      }
    },
    [recognize, setSelectedImage]
  );

  const handleSelectDish = useCallback(
    (candidate: RecognitionResult) => {
      router.push({
        pathname: '/modal/food-review',
        params: {
          foodId: candidate.food.id,
          photoUri: selectedImage || undefined,
          suggestedGrams: String(candidate.food.servingWeightGrams || 100),
          foodJson: JSON.stringify(candidate.food),
        },
      });
    },
    [selectedImage]
  );

  const handleManualEntry = useCallback(() => {
    router.push('/modal/manual-entry');
  }, []);

  const bestCandidate = candidates.length > 0 ? candidates[0] : null;
  const alternativeCandidates = candidates.length > 1 ? candidates.slice(1) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 16) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header with Title & Engine status */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quét món AI</Text>
          <Text style={styles.headerSubtitle}>
            Nhận diện món ăn Việt & tính calo tự động
          </Text>
        </View>

        <View style={styles.engineBadge}>
          <View
            style={[
              styles.engineDot,
              { backgroundColor: isOnline ? colors.neonMint : colors.offline },
            ]}
          />
          <Text style={styles.engineText}>
            {isOnline ? 'AI Cloud' : 'AI Offline'}
          </Text>
        </View>
      </View>

      {/* 2. Main Camera / Image Viewport */}
      <View style={styles.viewportContainer}>
        {selectedImage ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />

            {/* Scan Overlay on top of image during analysis */}
            <ScanOverlay
              isAnalyzing={isRecognizing}
              hintText={
                isRecognizing
                  ? 'AI đang phân tích bức ảnh...'
                  : 'Chạm vào món ăn đề xuất để tiếp tục'
              }
            />

            {/* Retake Quick Action Button */}
            <TouchableOpacity
              style={styles.retakeFloatingBtn}
              onPress={reset}
              activeOpacity={0.8}
              accessibilityLabel="Chụp lại ảnh"
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.retakeFloatingText}>Chụp lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewfinderBox}>
            <ScanOverlay
              isAnalyzing={false}
              hintText="Đặt món ăn vào chính giữa khung ngắm"
            />
          </View>
        )}
      </View>

      {/* 3. Control Panel (Visible when no image selected) */}
      {!selectedImage && (
        <View style={styles.controlsSection}>
          <View style={styles.controlBar}>
            {/* Gallery Picker */}
            <TouchableOpacity
              style={styles.controlSecondaryBtn}
              onPress={() => handlePickImage(false)}
              activeOpacity={0.7}
              accessibilityLabel="Chọn ảnh từ thư viện"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="images-outline" size={22} color={colors.text} />
              </View>
              <Text style={styles.controlSecondaryText}>Thư viện</Text>
            </TouchableOpacity>

            {/* Main Shutter Button */}
            <TouchableOpacity
              style={styles.shutterOuterRing}
              onPress={() => handlePickImage(true)}
              activeOpacity={0.85}
              accessibilityLabel="Chụp ảnh món ăn"
            >
              <View style={styles.shutterInnerCircle}>
                <Ionicons name="camera" size={30} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Manual Entry Fallback */}
            <TouchableOpacity
              style={styles.controlSecondaryBtn}
              onPress={handleManualEntry}
              activeOpacity={0.7}
              accessibilityLabel="Nhập món thủ công"
            >
              <View style={styles.iconCircle}>
                <Ionicons name="create-outline" size={22} color={colors.text} />
              </View>
              <Text style={styles.controlSecondaryText}>Nhập tay</Text>
            </TouchableOpacity>
          </View>

          {/* Shooting Tips Pill */}
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={16} color={colors.primary} />
            <Text style={styles.tipText}>
              Chụp ảnh từ trên xuống góc 45° đủ sáng để AI nhận diện nguyên liệu tốt nhất.
            </Text>
          </View>
        </View>
      )}

      {/* 4. Analyzing Feedback Card */}
      {isRecognizing && (
        <View style={styles.analyzingCard}>
          <ActivityIndicator size="small" color={colors.primary} />
          <View style={styles.analyzingTextBox}>
            <Text style={styles.analyzingTitle}>
              Đang phân tích hình ảnh...
            </Text>
            <Text style={styles.analyzingDesc}>
              Hệ thống đang đối soát với thư viện món Việt và tính toán dinh dưỡng.
            </Text>
          </View>
        </View>
      )}

      {/* 5. Error Message Display */}
      {error && !isRecognizing && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.danger} />
          <View style={styles.errorTextBox}>
            <Text style={styles.errorTitle}>Không thể nhận diện</Text>
            <Text style={styles.errorDesc}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.errorRetryBtn} onPress={reset}>
            <Text style={styles.errorRetryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6. Proposed Results List (Candidates) */}
      {!isRecognizing && candidates.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Kết quả đề xuất</Text>
            <Text style={styles.resultsBadge}>
              {candidates.length} món phù hợp
            </Text>
          </View>

          {/* 6.1 Primary Best Match Card */}
          {bestCandidate && (
            <TouchableOpacity
              style={styles.bestMatchCard}
              onPress={() => handleSelectDish(bestCandidate)}
              activeOpacity={0.85}
            >
              <View style={styles.bestMatchHeader}>
                <View style={styles.bestMatchTitleGroup}>
                  <View style={styles.bestTag}>
                    <Ionicons name="star" size={12} color="#D97706" />
                    <Text style={styles.bestTagText}>Khớp nhất</Text>
                  </View>
                  <Text style={styles.dishName}>{bestCandidate.food.name}</Text>
                  <Text style={styles.dishMeta}>
                    {bestCandidate.food.category} • Khẩu phần:{' '}
                    {bestCandidate.food.servingWeightGrams}g / {bestCandidate.food.servingUnit}
                  </Text>
                </View>

                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceNumber}>
                    {Math.round(bestCandidate.confidence * 100)}%
                  </Text>
                  <Text style={styles.confidenceLabel}>độ tin cậy</Text>
                </View>
              </View>

              {/* Nutrition Grid */}
              <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroEmoji}>🔥</Text>
                  <Text style={styles.macroValue}>
                    {bestCandidate.food.calories}
                  </Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>

                <View style={styles.macroDivider} />

                <View style={styles.macroItem}>
                  <Text style={styles.macroEmoji}>🥩</Text>
                  <Text style={styles.macroValue}>
                    {bestCandidate.food.protein}g
                  </Text>
                  <Text style={styles.macroLabel}>đạm</Text>
                </View>

                <View style={styles.macroDivider} />

                <View style={styles.macroItem}>
                  <Text style={styles.macroEmoji}>🍚</Text>
                  <Text style={styles.macroValue}>
                    {bestCandidate.food.carbs}g
                  </Text>
                  <Text style={styles.macroLabel}>tinh bột</Text>
                </View>

                <View style={styles.macroDivider} />

                <View style={styles.macroItem}>
                  <Text style={styles.macroEmoji}>🥑</Text>
                  <Text style={styles.macroValue}>
                    {bestCandidate.food.fat}g
                  </Text>
                  <Text style={styles.macroLabel}>chất béo</Text>
                </View>
              </View>

              {/* Action Button inside Best Match */}
              <View style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Xác nhận & Tùy chỉnh</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* 6.2 Alternative Candidates */}
          {alternativeCandidates.length > 0 && (
            <View style={styles.alternativesSection}>
              <Text style={styles.alternativesTitle}>
                Các gợi ý tương tự khác:
              </Text>

              {alternativeCandidates.map((candidate) => (
                <TouchableOpacity
                  key={candidate.food.id}
                  style={styles.altCard}
                  onPress={() => handleSelectDish(candidate)}
                  activeOpacity={0.7}
                >
                  <View style={styles.altLeft}>
                    <Text style={styles.altName}>{candidate.food.name}</Text>
                    <Text style={styles.altMeta}>
                      {candidate.food.category} • {candidate.food.calories} kcal •{' '}
                      {candidate.food.servingUnit}
                    </Text>
                  </View>

                  <View style={styles.altRight}>
                    <View style={styles.altConfidenceBadge}>
                      <Text style={styles.altConfidenceText}>
                        {Math.round(candidate.confidence * 100)}%
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 6.3 Manual Entry Fallback Button */}
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackText}>
              Chưa đúng món bạn đang ăn?
            </Text>
            <TouchableOpacity
              style={styles.manualEntryBtn}
              onPress={handleManualEntry}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={16} color={colors.primary} />
              <Text style={styles.manualEntryText}>Tìm kiếm hoặc Nhập thủ công</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 120,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    engineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.cardElevated : colors.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      gap: 6,
    },
    engineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    engineText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    viewportContainer: {
      width: '100%',
      aspectRatio: 4 / 3,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#0F172A',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    viewfinderBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0A0F1D',
    },
    previewWrapper: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    retakeFloatingBtn: {
      position: 'absolute',
      top: 14,
      right: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
      zIndex: 20,
    },
    retakeFloatingText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    controlsSection: {
      marginTop: 18,
    },
    controlBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: 8,
    },
    controlSecondaryBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 72,
    },
    iconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    controlSecondaryText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    shutterOuterRing: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 4,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    shutterInnerCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      marginTop: 16,
      gap: 10,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 17,
    },
    analyzingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.primary,
      padding: 14,
      borderRadius: 16,
      marginTop: 18,
      gap: 12,
    },
    analyzingTextBox: {
      flex: 1,
    },
    analyzingTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    analyzingDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
      borderWidth: 1,
      borderColor: colors.danger,
      padding: 14,
      borderRadius: 16,
      marginTop: 18,
      gap: 10,
    },
    errorTextBox: {
      flex: 1,
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.danger,
    },
    errorDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    errorRetryBtn: {
      backgroundColor: colors.danger,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    errorRetryText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    resultsContainer: {
      marginTop: 20,
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    resultsTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },
    resultsBadge: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    bestMatchCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      borderWidth: 2,
      borderColor: colors.neonMint,
      shadowColor: colors.neonMint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 5,
    },
    bestMatchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    bestMatchTitleGroup: {
      flex: 1,
      paddingRight: 8,
    },
    bestTag: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      gap: 4,
      marginBottom: 6,
    },
    bestTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#D97706',
    },
    dishName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 26,
    },
    dishMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    confidenceBadge: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
    },
    confidenceNumber: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary,
    },
    confidenceLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.primary,
      marginTop: -2,
    },
    macroGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? colors.cardElevated : colors.borderLight,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 14,
    },
    macroItem: {
      alignItems: 'center',
      flex: 1,
    },
    macroEmoji: {
      fontSize: 13,
      marginBottom: 2,
    },
    macroValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    macroLabel: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 1,
    },
    macroDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
    },
    confirmBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 14,
      gap: 6,
    },
    confirmBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    alternativesSection: {
      marginTop: 18,
    },
    alternativesTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    altCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    altLeft: {
      flex: 1,
      paddingRight: 8,
    },
    altName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    altMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    altRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    altConfidenceBadge: {
      backgroundColor: isDark ? colors.cardElevated : colors.borderLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    altConfidenceText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    fallbackBox: {
      alignItems: 'center',
      marginTop: 16,
      paddingVertical: 8,
    },
    fallbackText: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 8,
    },
    manualEntryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 8,
    },
    manualEntryText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
  });

export default ScanScreen;
