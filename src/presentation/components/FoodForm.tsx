import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';
import { MealLog, MealType } from '../../domain/entities';
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

  const setField = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

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
            <Field label="Ảnh món ăn (URI, không bắt buộc)" value={form.photoUri} onChangeText={(v) => setField('photoUri', v)} placeholder="file:// hoặc https://" autoCapitalize="none" styles={styles} colors={colors} />
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
    errorBox: { backgroundColor: colors.background, borderColor: colors.danger, borderRadius: 10, borderWidth: 1, marginBottom: 16, padding: 12 },
    errorText: { color: colors.danger, fontSize: 13, lineHeight: 20 },
    actions: { flexDirection: 'row', gap: 12 },
    cancelButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 52 },
    cancelText: { color: colors.text, fontSize: 16, fontWeight: '700' },
    saveButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 14, flex: 1.4, justifyContent: 'center', minHeight: 52 },
    saveText: { color: colors.inverseText, fontSize: 16, fontWeight: '800' },
    disabled: { opacity: 0.6 },
  });
