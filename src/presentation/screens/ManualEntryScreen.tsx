import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, AppColors } from '../theme';
import { FoodItem } from '../../domain/entities/FoodItem';
import { MealType } from '../../domain/entities/MealType';
import { RecognitionResult } from '../../domain/entities/RecognitionResult';
import {
  getAllFoodsUseCase,
  searchFoodsUseCase,
  createCustomFoodUseCase,
  recognizeDishUseCase,
} from '../../di/container';
import { useAuthStore } from '../store/authStore';
import { notify } from '../utils/notify';

export function ManualEntryScreen() {
  const params = useLocalSearchParams<{ defaultMealType?: MealType }>();
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [keyword, setKeyword] = useState('');
  const [foodList, setFoodList] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal tạo món ăn tùy chỉnh
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customServing, setCustomServing] = useState('1 khẩu phần');
  const [customGrams, setCustomGrams] = useState('100');
  const [customProtein, setCustomProtein] = useState('0');
  const [customCarbs, setCustomCarbs] = useState('0');
  const [customFat, setCustomFat] = useState('0');
  const [customPhotoUri, setCustomPhotoUri] = useState('');
  const [isAnalyzingCustomPhoto, setIsAnalyzingCustomPhoto] = useState(false);
  const [customAiSuggestion, setCustomAiSuggestion] = useState<string | null>(null);
  const [customCandidates, setCustomCandidates] = useState<RecognitionResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFoods = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const result = query.trim()
        ? await searchFoodsUseCase.execute(query)
        : await getAllFoodsUseCase.execute();
      if (result.success) {
        setFoodList(result.data);
      }
    } catch (e) {
      console.error('Error fetching foods:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      if (!isCancelled) {
        void fetchFoods(keyword);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [keyword, fetchFoods]);

  const handleSelectFood = (item: FoodItem) => {
    router.push({
      pathname: '/modal/food-review',
      params: {
        foodId: item.id,
        defaultMealType: params.defaultMealType,
      },
    });
  };

  const handleOpenCreateModal = () => {
    if (keyword.trim()) {
      setCustomName(keyword.trim());
    } else {
      setCustomName('');
    }
    setCustomCalories('');
    setCustomServing('1 khẩu phần');
    setCustomGrams('100');
    setCustomProtein('0');
    setCustomCarbs('0');
    setCustomFat('0');
    setCustomPhotoUri('');
    setCustomAiSuggestion(null);
    setCustomCandidates([]);
    setIsAnalyzingCustomPhoto(false);
    setIsCreateModalVisible(true);
  };

  const handlePickCustomImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        notify.warning('Quyền truy cập', 'Vui lòng cấp quyền để chụp hoặc chọn ảnh từ thiết bị.');
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
        setCustomPhotoUri(asset.uri);
        const imagePayload = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        // Tự động phân tích ảnh và ước tính các chất dinh dưỡng
        setIsAnalyzingCustomPhoto(true);
        setCustomAiSuggestion(null);
        setCustomCandidates([]);
        try {
          const aiResult = await recognizeDishUseCase.execute(imagePayload);
          if (aiResult.success && aiResult.data.length > 0) {
            const top = aiResult.data[0];
            setCustomCandidates(aiResult.data);
            setCustomAiSuggestion(
              `✨ AI nhận diện: "${top.food.name}". Đã tự động tính calo và các chất, bạn có thể chỉnh sửa thủ công bên dưới.`
            );
            if (!customName.trim()) {
              setCustomName(top.food.name);
            }
            setCustomCalories(String(top.food.calories));
            setCustomServing(top.food.servingUnit || '1 khẩu phần');
            setCustomGrams(String(top.food.servingWeightGrams || 100));
            setCustomProtein(String(top.food.protein));
            setCustomCarbs(String(top.food.carbs));
            setCustomFat(String(top.food.fat));
          } else {
            setCustomAiSuggestion(
              'Không tự động tính được dinh dưỡng từ ảnh. Bạn vui lòng tự nhập các chỉ số bên dưới.'
            );
          }
        } catch {
          setCustomAiSuggestion(
            'Chưa thể tự động tính chất từ ảnh lúc này. Bạn vui lòng tự nhập các chỉ số bên dưới.'
          );
        } finally {
          setIsAnalyzingCustomPhoto(false);
        }
      }
    } catch {
      notify.error('Lỗi', 'Không thể mở máy ảnh hoặc thư viện ảnh.');
    }
  };

  const handleApplyCustomCandidate = (candidate: RecognitionResult) => {
    setCustomName(candidate.food.name);
    setCustomCalories(String(candidate.food.calories));
    setCustomServing(candidate.food.servingUnit || '1 khẩu phần');
    setCustomGrams(String(candidate.food.servingWeightGrams || 100));
    setCustomProtein(String(candidate.food.protein));
    setCustomCarbs(String(candidate.food.carbs));
    setCustomFat(String(candidate.food.fat));
    setCustomAiSuggestion(
      `✨ Đã áp dụng thông tin của "${candidate.food.name}". Bạn có thể chỉnh sửa thêm bên dưới.`
    );
  };

  const handleSaveCustomFood = async () => {
    if (!customName.trim()) {
      notify.warning('Thiếu thông tin', 'Vui lòng nhập tên món ăn.');
      return;
    }

    const cals = parseFloat(customCalories);
    if (isNaN(cals) || cals < 0) {
      notify.warning('Sai định dạng', 'Vui lòng nhập lượng Calo hợp lệ.');
      return;
    }

    const grams = parseFloat(customGrams) || 100;
    const protein = parseFloat(customProtein) || 0;
    const carbs = parseFloat(customCarbs) || 0;
    const fat = parseFloat(customFat) || 0;

    setIsSubmitting(true);
    try {
      const result = await createCustomFoodUseCase.execute(
        {
          name: customName.trim(),
          category: 'Món tùy chỉnh',
          calories: Math.round(cals),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          servingUnit: customServing.trim() || '1 khẩu phần',
          servingWeightGrams: grams,
        },
        user?.id
      );

      if (result.success) {
        setIsCreateModalVisible(false);
        notify.toast('Đã tạo món ăn thành công! 🎉');
        // Refresh list
        void fetchFoods(keyword);
        // Chuyển luôn sang Review kèm ảnh trên thiết bị để người dùng lưu vào nhật ký
        router.push({
          pathname: '/modal/food-review',
          params: {
            foodId: result.data.id,
            defaultMealType: params.defaultMealType,
            photoUri: customPhotoUri || undefined,
            foodJson: JSON.stringify(result.data),
          },
        });
      } else {
        notify.error('Lỗi tạo món', result.error.message);
      }
    } catch {
      notify.error('Lỗi', 'Không thể tạo món ăn lúc này. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Search & Quick Add */}
      <View style={styles.topRow}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm món ăn (phở bò, cơm tấm, v.v.)..."
            placeholderTextColor={colors.textMuted}
            value={keyword}
            onChangeText={setKeyword}
            autoFocus
            clearButtonMode="while-editing"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleOpenCreateModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Tạo món</Text>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={foodList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.resultsHeader}>
            {keyword
              ? `Kết quả tìm kiếm (${foodList.length} món)`
              : `Danh mục món ăn Việt Nam (${foodList.length} món sẵn có offline)`}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodRow}
            onPress={() => handleSelectFood(item)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodSub}>
                {item.category} • {item.servingUnit}
              </Text>
              <Text style={styles.macroPills}>
                🥩 {item.protein}g đạm • 🍚 {item.carbs}g carb • 🥑 {item.fat}g béo
              </Text>
            </View>

            <View style={styles.rightBadge}>
              <View style={styles.caloriesWrap}>
                <Text style={styles.caloriesNumber}>{item.calories}</Text>
                <Text style={styles.caloriesUnit}>kcal</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  Không tìm thấy món ăn nào khớp với từ khóa &quot;{keyword}&quot;
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={handleOpenCreateModal}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.emptyAddBtnText}>Tạo món &quot;{keyword}&quot; mới</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />

      {/* Modal Tạo món ăn tùy chỉnh */}
      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo món ăn mới</Text>
              <TouchableOpacity
                onPress={() => setIsCreateModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View>
                <Text style={styles.inputLabel}>📸 Ảnh món ăn (Chụp/chọn ảnh để AI tự tính các chất)</Text>
                {customPhotoUri ? (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: customPhotoUri }} style={styles.photoPreview} />
                    <View style={styles.photoActions}>
                      <TouchableOpacity
                        style={styles.photoBtn}
                        onPress={() => handlePickCustomImage(false)}
                      >
                        <Ionicons name="images-outline" size={16} color={colors.primary} />
                        <Text style={styles.photoBtnText}>Đổi ảnh</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.photoBtn}
                        onPress={() => handlePickCustomImage(true)}
                      >
                        <Ionicons name="camera-outline" size={16} color={colors.primary} />
                        <Text style={styles.photoBtnText}>Chụp lại</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.photoBtn, styles.photoBtnDanger]}
                        onPress={() => {
                          setCustomPhotoUri('');
                          setCustomAiSuggestion(null);
                          setCustomCandidates([]);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        <Text style={[styles.photoBtnText, { color: colors.danger }]}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.pickImageRow}>
                    <TouchableOpacity
                      style={styles.pickImageBtn}
                      onPress={() => handlePickCustomImage(false)}
                    >
                      <Ionicons name="images-outline" size={20} color={colors.primary} />
                      <Text style={styles.pickImageText}>Chọn từ thư viện</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pickImageBtn}
                      onPress={() => handlePickCustomImage(true)}
                    >
                      <Ionicons name="camera-outline" size={20} color={colors.primary} />
                      <Text style={styles.pickImageText}>Chụp ảnh</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {isAnalyzingCustomPhoto && (
                <View style={styles.aiAnalyzingBox}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.aiAnalyzingText}>
                    ✨ AI đang nhận diện món & tính toán các chất dinh dưỡng...
                  </Text>
                </View>
              )}

              {customAiSuggestion && !isAnalyzingCustomPhoto && (
                <View style={styles.aiSuggestionBox}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <Text style={styles.aiSuggestionText}>{customAiSuggestion}</Text>
                </View>
              )}

              {customCandidates.length > 1 && !isAnalyzingCustomPhoto && (
                <View style={styles.candidatesRow}>
                  <Text style={styles.candidatesLabel}>Gợi ý món khác từ ảnh:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.candidatesScroll}
                  >
                    {customCandidates.slice(1).map((c) => (
                      <TouchableOpacity
                        key={c.food.id}
                        style={styles.candidateChip}
                        onPress={() => handleApplyCustomCandidate(c)}
                      >
                        <Text style={styles.candidateChipText}>
                          {c.food.name} ({c.food.calories} kcal)
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.inputLabel}>Tên món ăn (*)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ví dụ: Salad ức gà áp chảo"
                placeholderTextColor={colors.textMuted}
                value={customName}
                onChangeText={setCustomName}
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Calo (*) (kcal)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="350"
                    placeholderTextColor={colors.textMuted}
                    value={customCalories}
                    onChangeText={setCustomCalories}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Khẩu phần (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="100"
                    placeholderTextColor={colors.textMuted}
                    value={customGrams}
                    onChangeText={setCustomGrams}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Đơn vị khẩu phần</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="1 đĩa, 1 tô, 1 phần..."
                placeholderTextColor={colors.textMuted}
                value={customServing}
                onChangeText={setCustomServing}
              />

              <Text style={styles.inputSubheading}>Chất đa lượng (Tùy chọn)</Text>
              <View style={styles.macroRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>🥩 Protein (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={customProtein}
                    onChangeText={setCustomProtein}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>🍚 Carbs (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>🥑 Fat (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={customFat}
                    onChangeText={setCustomFat}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCustomFood}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Lưu & Thêm vào nhật ký</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
      gap: 10,
    },
    searchBarContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      height: 46,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      height: 46,
      borderRadius: 12,
      gap: 4,
    },
    createBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
    },
    resultsHeader: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 10,
    },
    foodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    foodName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    foodSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    macroPills: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },
    rightBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    caloriesWrap: {
      alignItems: 'flex-end',
    },
    caloriesNumber: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
    caloriesUnit: {
      fontSize: 11,
      color: colors.textMuted,
    },
    emptyContainer: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 20,
    },
    emptyAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primaryLight,
    },
    emptyAddBtnText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    modalScroll: {
      gap: 10,
      paddingBottom: 8,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    inputSubheading: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginTop: 6,
    },
    modalInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 14,
      color: colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 12,
    },
    macroRow: {
      flexDirection: 'row',
      gap: 8,
    },
    photoContainer: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    photoPreview: {
      width: '100%',
      height: 140,
      borderRadius: 8,
      resizeMode: 'cover',
    },
    photoActions: {
      flexDirection: 'row',
      gap: 8,
      width: '100%',
      justifyContent: 'center',
    },
    photoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoBtnDanger: {
      borderColor: colors.danger,
    },
    photoBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    pickImageRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    pickImageBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 10,
      paddingVertical: 12,
    },
    pickImageText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    aiAnalyzingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      padding: 10,
      borderRadius: 10,
      marginTop: 8,
      gap: 8,
    },
    aiAnalyzingText: {
      fontSize: 12,
      color: colors.primaryDark,
      fontWeight: '600',
      flex: 1,
    },
    aiSuggestionBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primaryLight,
      padding: 10,
      borderRadius: 10,
      marginTop: 8,
      gap: 6,
    },
    aiSuggestionText: {
      fontSize: 12,
      color: colors.primaryDark,
      lineHeight: 17,
      flex: 1,
      fontWeight: '500',
    },
    candidatesRow: {
      marginTop: 8,
    },
    candidatesLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    candidatesScroll: {
      flexDirection: 'row',
      gap: 6,
    },
    candidateChip: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    candidateChipText: {
      fontSize: 11,
      color: colors.primaryDark,
      fontWeight: '600',
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 14,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });

export default ManualEntryScreen;
