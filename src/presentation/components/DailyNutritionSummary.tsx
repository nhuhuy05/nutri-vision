import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { DailyGoals } from '../../domain/entities/DailyGoals';
import { AppColors, useAppTheme } from '../theme';
import { MacroBar } from './MacroBar';

interface DailyNutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals: DailyGoals;
}

const safePercent = (value: number, goal: number) =>
  goal > 0 ? Math.max(0, Math.round((value / goal) * 100)) : 0;

export function DailyNutritionSummary({
  calories,
  protein,
  carbs,
  fat,
  goals,
}: DailyNutritionSummaryProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const percentage = safePercent(calories, goals.calories);
  const remaining = goals.calories - calories;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(percentage, 100);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Tổng quan dinh dưỡng. ${Math.round(calories)} trên ${Math.round(
        goals.calories
      )} kilocalories, đạt ${percentage} phần trăm. ${
        remaining >= 0
          ? `Còn ${Math.round(remaining)} kilocalories`
          : `Vượt ${Math.round(Math.abs(remaining))} kilocalories`
      }.`}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>NĂNG LƯỢNG HÔM NAY</Text>
          <Text style={styles.remaining}>
            {remaining >= 0 ? 'Còn lại' : 'Vượt mục tiêu'}{' '}
            <Text style={styles.remainingStrong}>{Math.round(Math.abs(remaining))} kcal</Text>
          </Text>
          <Text style={styles.goal}>Mục tiêu {Math.round(goals.calories)} kcal</Text>
        </View>
        <View style={styles.ring}>
          <Svg width={104} height={104} accessibilityElementsHidden>
            <Circle
              cx={52}
              cy={52}
              r={radius}
              fill="none"
              stroke={colors.borderLight}
              strokeWidth={9}
            />
            <Circle
              cx={52}
              cy={52}
              r={radius}
              fill="none"
              stroke={remaining >= 0 ? colors.primary : colors.warning}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * (1 - progress / 100)}
              rotation="-90"
              origin="52, 52"
            />
          </Svg>
          <View style={styles.ringText}>
            <Text style={styles.calories}>{Math.round(calories)}</Text>
            <Text style={styles.kcal}>kcal · {percentage}%</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <MacroBar label="Protein" consumed={protein} goal={goals.protein} unit="g" color={colors.purple} />
      <MacroBar label="Carbohydrate" consumed={carbs} goal={goals.carbs} unit="g" color={colors.accent} />
      <MacroBar label="Chất béo" consumed={fat} goal={goals.fat} unit="g" color={colors.yellow} />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 16,
      padding: 18,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 14,
      elevation: 2,
    },
    topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    eyebrow: { color: colors.primaryDark, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
    remaining: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 10 },
    remainingStrong: { fontWeight: '800' },
    goal: { color: colors.textSecondary, fontSize: 13, marginTop: 5 },
    ring: { height: 104, width: 104 },
    ringText: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
    calories: { color: colors.text, fontSize: 22, fontWeight: '800' },
    kcal: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 1 },
    divider: { backgroundColor: colors.borderLight, height: 1, marginVertical: 14 },
  });
