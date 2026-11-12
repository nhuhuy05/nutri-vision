import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { MealLog, MealType, RecognitionResult } from '../../domain/entities';
import { recognizeDishUseCase } from '../../di/container';
import { AppColors, useAppTheme } from '../theme';

export interface FoodFormValue {
  foodName: string;
  mealType: MealType;
  portionMultiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photoUri?: string;
}

interface FoodFormProps {
  visible: boolean;
  initialMealType: MealType;
  log?: MealLog | null;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (value: FoodFormValue) => Promise<void>;
}

type FormState = Record<
  'foodName' | 'portionMultiplier' | 'calories' | 'protein' | 'carbs' | 'fat' | 'photoUri',
  string
> & { mealType: MealType };

const MEALS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Bữa sáng' },
  { value: 'lunch', label: 'Bữa trưa' },
  { value: 'dinner', label: 'Bữa tối' },
  { value: 'snack', label: 'Bữa phụ' },
];

const makeState = (mealType: MealType, log?: MealLog | null): FormState => ({
  foodName: log?.foodName ?? '',
  mealType: log?.mealType ?? mealType,
  portionMultiplier: String(log?.portionMultiplier ?? 1),
  calories: log ? String(log.calories) : '',
  protein: log ? String(log.protein) : '',
  carbs: log ? String(log.carbs) : '',
  fat: log ? String(log.fat) : '',
  photoUri: log?.photoUri ?? '',
});

export function FoodForm({
  visible,
  initialMealType,
  log,
  isSaving,
  onCancel,
  onSave,
}: FoodFormProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [form, setForm] = useState<FormState>(() => makeState(initialMealType, log));
  const [errors, setErrors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<RecognitionResult[]>([]);

  const setField = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setErrors(['Vui lòng cấp quyền để chụp hoặc chọn ảnh món ăn từ thiết bị.']);
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
        setField('photoUri', asset.uri);
        const imagePayload = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

        // Tự động phân tích ảnh và tính toán các chất dinh dưỡng
        setIsAnalyzing(true);
        setAiSuggestion(null);
        setCandidates([]);
        try {
          const aiResult = await recognizeDishUseCase.execute(imagePayload);
          if (aiResult.success && aiResult.data.length > 0) {
            const top = aiResult.data[0];
            setCandidates(aiResult.data);
            setAiSuggestion(
              `✨ AI nhận diện: "${top.food.name}" (~${top.food.calories} kcal). Đã tự động điền các chất dinh dưỡng bên dưới, bạn có thể chỉnh sửa thủ công.`
            );

            // Điền tự động các chất, người dùng vẫn có thể sửa thủ công bên dưới
            setForm((current) => ({
              ...current,
              foodName: current.foodName.trim() ? current.foodName : top.food.name,
              calories: String(top.food.calories),
              protein: String(top.food.protein),
              carbs: String(top.food.carbs),
              fat: String(top.food.fat),
            }));
          } else {
            setAiSuggestion(
              'Không nhận diện được dinh dưỡng từ ảnh. Bạn vui lòng nhập thủ công các chỉ số bên dưới.'
            );
          }
        } catch {
          setAiSuggestion(
            'Chưa thể tự động tính chất từ ảnh lúc này. Bạn vui lòng nhập thủ công các chỉ số bên dưới.'
          );
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (e) {
      console.error('Pick image error:', e);
      setErrors(['Không thể mở máy ảnh hoặc thư viện ảnh trên thiết bị.']);
    }
  };

  const handleApplyCandidate = (candidate: RecognitionResult) => {
    setForm((current) => ({
      ...current,
      foodName: candidate.food.name,
      calories: String(candidate.food.calories),
      protein: String(candidate.food.protein),
      carbs: String(candidate.food.carbs),
      fat: String(candidate.food.fat),
    }));
    setAiSuggestion(
      `✨ Đã áp dụng thông tin của "${candidate.food.name}". Bạn có thể chỉnh sửa thêm bên dưới.`
    );
  };

  const handleSave = async () => {
    const numericFields = [
      ['Khẩu phần', form.portionMultiplier],
      ['Calo', form.calories],
      ['Protein', form.protein],
      ['Carbohydrate', form.carbs],
      ['Chất béo', form.fat],
    ] as const;
    const validationErrors: string[] = [];
    if (!form.foodName.trim()) validationErrors.push('Vui lòng nhập tên món ăn.');
    numericFields.forEach(([label, raw]) => {
      const value = Number(raw.replace(',', '.'));
      if (!raw.trim() || !Number.isFinite(value) || value < 0) {
        validationErrors.push(`${label} phải là số không âm.`);
      }
    });
    if (Number(form.portionMultiplier.replace(',', '.')) <= 0) {
      validationErrors.push('Khẩu phần phải lớn hơn 0.');
    }
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    await onSave({
      foodName: form.foodName.trim(),
      mealType: form.mealType,
      portionMultiplier: Number(form.portionMultiplier.replace(',', '.')),
      calories: Number(form.calories.replace(',', '.')),
      protein: Number(form.protein.replace(',', '.')),
      carbs: Number(form.carbs.replace(',', '.')),
      fat: Number(form.fat.replace(',', '.')),
      photoUri: form.photoUri.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.dismissArea} onPress={onCancel} accessibilityLabel="Đóng biểu mẫu" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{log ? 'Chỉnh sửa món ăn' : 'Thêm món ăn'}</Text>
              <Text style={styles.subtitle}>Thông tin dinh dưỡng cho khẩu phần này</Text>
            </View>
            <Pressable
              onPress={onCancel}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Hủy và đóng"
            >
              <Ionicons name="close" color={colors.text} size={22} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Ảnh món ăn (Chụp/chọn ảnh để AI tự động tính dinh dưỡng)</Text>
              {form.photoUri ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: form.photoUri }} style={styles.photoPreview} />
                  <View style={styles.photoActions}>
                    <Pressable
                      style={styles.photoBtn}
                      onPress={() => handlePickImage(false)}
                      accessibilityRole="button"
                    >
                      <Ionicons name="images-outline" size={16} color={colors.primary} />
                      <Text style={styles.photoBtnText}>Chọn ảnh khác</Text>
                    </Pressable>
                    <Pressable
                      style={styles.photoBtn}
                      onPress={() => handlePickImage(true)}
                      accessibilityRole="button"
                    >
                      <Ionicons name="camera-outline" size={16} color={colors.primary} />
                      <Text style={styles.photoBtnText}>Chụp lại</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.photoBtn, styles.photoBtnDanger]}
                      onPress={() => {
                        setField('photoUri', '');
                        setAiSuggestion(null);
                        setCandidates([]);
                      }}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      <Text style={[styles.photoBtnText, { color: colors.danger }]}>Xóa</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.pickImageRow}>
                  <Pressable
                    style={styles.pickImageBtn}
                    onPress={() => handlePickImage(false)}
                    accessibilityRole="button"
                  >
                    <Ionicons name="images-outline" size={20} color={colors.primary} />
                    <Text style={styles.pickImageText}>Chọn từ thư viện</Text>
                  </Pressable>
                  <Pressable
                    style={styles.pickImageBtn}
                    onPress={() => handlePickImage(true)}
                    accessibilityRole="button"
                  >
                    <Ionicons name="camera-outline" size={20} color={colors.primary} />
                    <Text style={styles.pickImageText}>Chụp ảnh</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {isAnalyzing && (
              <View style={styles.aiAnalyzingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.aiAnalyzingText}>
                  ✨ AI đang phân tích ảnh & tính toán các chỉ số dinh dưỡng...
                </Text>
              </View>
            )}

            {aiSuggestion && !isAnalyzing && (
              <View style={styles.aiSuggestionBox}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text style={styles.aiSuggestionText}>{aiSuggestion}</Text>
              </View>
            )}

            {candidates.length > 1 && !isAnalyzing && (
              <View style={styles.candidatesRow}>
                <Text style={styles.candidatesLabel}>Gợi ý món khác từ ảnh:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.candidatesScroll}
                >
                  {candidates.slice(1).map((c) => (
                    <Pressable
                      key={c.food.id}
                      style={styles.candidateChip}
                      onPress={() => handleApplyCandidate(c)}
                    >
                      <Text style={styles.candidateChipText}>
                        {c.food.name} ({c.food.calories} kcal)
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <Field
              label="Tên món ăn *"
              value={form.foodName}
              onChangeText={(value) => setField('foodName', value)}
              placeholder="Ví dụ: Phở bò"
              styles={styles}
              colors={colors}
            />
            <Text style={styles.label}>Bữa ăn</Text>
            <View style={styles.mealRow}>
              {MEALS.map((meal) => {
                const selected = form.mealType === meal.value;
                return (
                  <Pressable
                    key={meal.value}
                    style={[styles.mealChip, selected && styles.mealChipSelected]}
                    onPress={() => setForm((current) => ({ ...current, mealType: meal.value }))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={meal.label}
                  >
                    <Text style={[styles.mealText, selected && styles.mealTextSelected]}>
                      {meal.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.twoColumns}>
              <View style={styles.half}>
                <Field label="Khẩu phần *" value={form.portionMultiplier} onChangeText={(v) => setField('portionMultiplier', v)} keyboardType="decimal-pad" placeholder="1" styles={styles} colors={colors} />
              </View>
              <View style={styles.half}>
                <Field label="Calo (kcal) *" value={form.calories} onChangeText={(v) => setField('calories', v)} keyboardType="decimal-pad" placeholder="0" styles={styles} colors={colors} />
              </View>
            </View>
            <View style={styles.twoColumns}>
              <View style={styles.half}>
                <Field label="Protein (g) *" value={form.protein} onChangeText={(v) => setField('protein', v)} keyboardType="decimal-pad" placeholder="0" styles={styles} colors={colors} />
              </View>
              <View style={styles.half}>
                <Field label="Carbohydrate (g) *" value={form.carbs} onChangeText={(v) => setField('carbs', v)} keyboardType="decimal-pad" placeholder="0" styles={styles} colors={colors} />
              </View>
            </View>
            <Field label="Chất béo (g) *" value={form.fat} onChangeText={(v) => setField('fat', v)} keyboardType="decimal-pad" placeholder="0" styles={styles} colors={colors} />
            {errors.length > 0 && (
              <View style={styles.errorBox} accessibilityRole="alert">
                {errors.map((error) => <Text key={error} style={styles.errorText}>• {error}</Text>)}
              </View>
            )}
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={onCancel} accessibilityRole="button">
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSaving && styles.disabled]}
                onPress={handleSave}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={log ? 'Lưu thay đổi món ăn' : 'Thêm món vào nhật ký'}
                accessibilityState={{ disabled: isSaving, busy: isSaving }}
              >
                {isSaving ? <ActivityIndicator color={colors.inverseText} /> : <Text style={styles.saveText}>{log ? 'Lưu thay đổi' : 'Thêm món'}</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad';
  autoCapitalize?: 'sentences' | 'none';
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}

function Field({ label, styles, colors, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: { backgroundColor: colors.overlay, flex: 1, justifyContent: 'flex-end' },
    dismissArea: { flex: 1 },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingTop: 8 },
    handle: { alignSelf: 'center', backgroundColor: colors.border, borderRadius: 3, height: 5, width: 42 },
    header: { alignItems: 'center', borderBottomColor: colors.borderLight, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
    title: { color: colors.text, fontSize: 20, fontWeight: '800' },
    subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
    iconButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
    content: { padding: 18, paddingBottom: 34 },
    field: { marginBottom: 14 },
    label: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 7 },
    input: { backgroundColor: colors.inputBg, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 48, paddingHorizontal: 14 },
    mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    mealChip: { borderColor: colors.border, borderRadius: 999, borderWidth: 1, minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
    mealChipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    mealText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    mealTextSelected: { color: colors.primaryDark, fontWeight: '800' },
    twoColumns: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    photoContainer: {
      backgroundColor: colors.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      alignItems: 'center',
      gap: 10,
    },
    photoPreview: {
      width: '100%',
      height: 160,
      borderRadius: 10,
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
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoBtnDanger: {
      borderColor: colors.danger,
    },
    photoBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    pickImageRow: {
      flexDirection: 'row',
      gap: 10,
    },
    pickImageBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 14,
    },
    pickImageText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    aiAnalyzingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      padding: 12,
      borderRadius: 12,
      marginBottom: 14,
      gap: 10,
    },
    aiAnalyzingText: {
      fontSize: 13,
      color: colors.primaryDark,
      fontWeight: '600',
      flex: 1,
    },
    aiSuggestionBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primaryLight,
      padding: 12,
      borderRadius: 12,
      marginBottom: 14,
      gap: 8,
    },
    aiSuggestionText: {
      fontSize: 13,
      color: colors.primaryDark,
      lineHeight: 18,
      flex: 1,
      fontWeight: '500',
    },
    candidatesRow: {
      marginBottom: 14,
    },
    candidatesLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 6,
    },
    candidatesScroll: {
      flexDirection: 'row',
      gap: 8,
    },
    candidateChip: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    candidateChipText: {
      fontSize: 12,
      color: colors.primaryDark,
      fontWeight: '600',
    },
    errorBox: { backgroundColor: colors.background, borderColor: colors.danger, borderRadius: 10, borderWidth: 1, marginBottom: 16, padding: 12 },
    errorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
    actions: { flexDirection: 'row', gap: 12 },
    cancelButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 52 },
    cancelText: { color: colors.text, fontSize: 16, fontWeight: '700' },
    saveButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, flex: 1.4, justifyContent: 'center', minHeight: 52 },
    saveText: { color: colors.inverseText, fontSize: 16, fontWeight: '800' },
    disabled: { opacity: 0.6 },
  });
