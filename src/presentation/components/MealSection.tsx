import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { MealLog, MealType } from '../../domain/entities';

interface MealSectionProps {
  title: string;
  type: MealType;
  logs: MealLog[];
  onAddPress: () => void;
  onEditPress?: (log: MealLog) => void;
  onDeletePress: (id: string) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  title,
  logs,
  onAddPress,
  onEditPress,
  onDeletePress,
}) => {
  const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.calories}>
            {Math.round(totalCalories)} <Text style={styles.unit}>kcal</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
          <Ionicons name="add" size={18} color={COLORS.primary} />
          <Text style={styles.addText}>Thêm món</Text>
        </TouchableOpacity>
      </View>

      {logs.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có món ăn nào được ghi lại</Text>
      ) : (
        logs.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemRow}
            activeOpacity={onEditPress ? 0.7 : 1}
            onPress={() => onEditPress?.(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{item.foodName}</Text>
              <Text style={styles.foodMacros}>
                {item.portionMultiplier}x phần • {Math.round(item.protein)}g P • {Math.round(item.carbs)}g C • {Math.round(item.fat)}g F
              </Text>
            </View>
            <View style={styles.rightAction}>
              <Text style={styles.itemCalories}>{Math.round(item.calories)} kcal</Text>
              <TouchableOpacity
                onPress={() => onDeletePress(item.id)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  calories: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unit: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  foodName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  foodMacros: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemCalories: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    padding: 2,
  },
});

