import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/theme';
import { RecognitionResult } from '../../domain/entities';
import { recognizeDishUseCase } from '../../core/di';

export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState<RecognitionResult[]>([]);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
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
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        analyzeFoodImage(uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể mở máy ảnh hoặc thư viện ảnh.');
    }
  };

  const analyzeFoodImage = async (uri: string) => {
    setIsAnalyzing(true);
    setCandidates([]);
    try {
      const results = await recognizeDishUseCase.execute(uri);
      setCandidates(results);
    } catch (error) {
      console.error('AI recognition error:', error);
      Alert.alert('Lỗi nhận diện', 'Không thể nhận diện món ăn. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDish = (candidate: RecognitionResult) => {
    // Navigate to food-review modal with selected dish details
    router.push({
      pathname: '/modal/food-review',
      params: {
        foodId: candidate.food.id,
        photoUri: selectedImage || undefined,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo Preview / Capture Area */}
      <View style={styles.previewBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="fast-food-outline" size={64} color={COLORS.textMuted} />
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
        >
          <Ionicons name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.btnTextLight}>Chụp ảnh món</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cameraBtn, styles.secondaryCameraBtn]}
          onPress={() => handlePickImage(false)}
        >
          <Ionicons name="images-outline" size={20} color={COLORS.text} />
          <Text style={styles.btnTextDark}>Chọn từ máy</Text>
        </TouchableOpacity>
      </View>

      {/* AI Analyzing Indicator */}
      {isAnalyzing && (
        <View style={styles.analyzingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.analyzingText}>
            AI (TensorFlow Lite) đang phân tích hình ảnh món ăn...
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
            >
              <View style={styles.candidateHeader}>
                <View style={{ flex: 1 }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  previewBox: {
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.primary,
  },
  secondaryCameraBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnTextLight: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnTextDark: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  analyzingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },
  analyzingText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  bestMatchBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestMatchText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  dishMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  confidenceBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  macroPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  macroPill: {
    fontSize: 11,
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

