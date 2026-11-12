import React, { useState, useMemo } from 'react';
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
import { recognizeDishUseCase } from '../../di/container';
import { notify } from '../utils/notify';

export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState<RecognitionResult[]>([]);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        notify.warning(
          'Quyền truy cập',
          'Vui lòng cấp quyền để ứng dụng có thể chụp hoặc chọn ảnh món ăn.'
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
            base64: true,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri);
        const imagePayload = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        analyzeFoodImage(imagePayload);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      notify.error('Lỗi', 'Không thể mở máy ảnh hoặc thư viện ảnh.');
    }
  };

  const analyzeFoodImage = async (uri: string) => {
    setIsAnalyzing(true);
    setCandidates([]);
    try {
      const result = await recognizeDishUseCase.execute(uri);
      if (result.success) {
        setCandidates(result.data);
      } else {
        notify.error('Lỗi nhận diện', result.error.message);
      }
    } catch (error) {
      console.error('AI recognition error:', error);
      notify.error('Lỗi nhận diện', 'Không thể nhận diện món ăn. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDish = (candidate: RecognitionResult) => {
    router.push({
      pathname: '/modal/food-review',
      params: {
        foodId: candidate.food.id,
        photoUri: selectedImage || undefined,
        suggestedGrams: String(candidate.food.servingWeightGrams || 100),
        foodJson: JSON.stringify(candidate.food),
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
    >
      {/* Photo Preview / Capture Area */}
      <View style={styles.previewBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="fast-food-outline" size={64} color={colors.textMuted} />
            <Text style={styles.placeholderText}>
              Chụp ảnh món ăn hoặc chọn từ thư viện để AI nhận diện
            </Text>
          </View>
        )}
      </View>

      {/* Camera Action Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.cameraBtn, styles.primaryCameraBtn]}
          onPress={() => handlePickImage(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.btnTextLight}>Chụp ảnh món</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cameraBtn, styles.secondaryCameraBtn]}
          onPress={() => handlePickImage(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={20} color={colors.text} />
          <Text style={styles.btnTextDark}>Chọn từ máy</Text>
        </TouchableOpacity>
      </View>

      {/* AI Analyzing Indicator */}
      {isAnalyzing && (
        <View style={styles.analyzingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.analyzingText}>
            AI đang phân tích hình ảnh món ăn...
          </Text>
        </View>
      )}

      {/* Recognition Results List */}
      {candidates.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>
            Kết quả đề xuất ({candidates.length} món phù hợp)
          </Text>
          <Text style={styles.resultSubtitle}>
            Chọn món ăn chính xác để xác nhận khẩu phần và dinh dưỡng:
          </Text>

          {candidates.map((cand, idx) => (
            <TouchableOpacity
              key={cand.food.id}
              style={styles.candidateCard}
              onPress={() => handleSelectDish(cand)}
              activeOpacity={0.7}
            >
              <View style={styles.candidateHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.dishName}>{cand.food.name}</Text>
                    {idx === 0 && (
                      <View style={styles.bestMatchBadge}>
                        <Text style={styles.bestMatchText}>Khớp nhất</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dishMeta}>
                    {cand.food.category} • Đơn vị: {cand.food.servingUnit}
                  </Text>
                </View>

                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(cand.confidence * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.macroPillRow}>
                <Text style={styles.macroPill}>🔥 {cand.food.calories} kcal</Text>
                <Text style={styles.macroPill}>🥩 {cand.food.protein}g đạm</Text>
                <Text style={styles.macroPill}>🍚 {cand.food.carbs}g tinh bột</Text>
                <Text style={styles.macroPill}>🥑 {cand.food.fat}g béo</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 110,
    },
    previewBox: {
      height: 240,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    placeholderContainer: {
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    placeholderText: {
      marginTop: 10,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
    btnRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 14,
    },
    cameraBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    primaryCameraBtn: {
      backgroundColor: colors.primary,
    },
    secondaryCameraBtn: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnTextLight: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    btnTextDark: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    analyzingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
      padding: 12,
      borderRadius: 10,
      marginTop: 16,
      gap: 8,
    },
    analyzingText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
    resultsContainer: {
      marginTop: 20,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    resultSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: 12,
    },
    candidateCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    candidateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dishName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    bestMatchBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    bestMatchText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#D97706',
    },
    dishMeta: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    confidenceBadge: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    confidenceText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    macroPillRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
      flexWrap: 'wrap',
    },
    macroPill: {
      fontSize: 11,
      color: colors.textSecondary,
      backgroundColor: colors.borderLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
  });

export default ScanScreen;
