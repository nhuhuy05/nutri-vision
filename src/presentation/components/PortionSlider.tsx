import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppTheme } from '../theme/colors';

interface PortionSliderProps {
  grams: number;
  onGramsChange: (grams: number) => void;
  min?: number;
  max?: number;
  step?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  unitLabel?: string;
}

export const PortionSlider: React.FC<PortionSliderProps> = ({
  grams,
  onGramsChange,
  min = 10,
  max = 1000,
  step = 5,
  calories,
  protein,
  carbs,
  fat,
  unitLabel = 'grams',
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Khối lượng khẩu phần</Text>
        <Text style={[styles.gramsValue, { color: colors.primary }]}>
          {Math.round(grams)} <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unitLabel}</Text>
        </Text>
      </View>

      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={grams}
          onValueChange={(val: number) => onGramsChange(Math.round(val))}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          accessibilityLabel="Thanh điều chỉnh khối lượng khẩu phần"
        />
      </View>

      <View style={styles.minMaxRow}>
        <Text style={[styles.limitText, { color: colors.textMuted }]}>{min}g</Text>
        <Text style={[styles.limitText, { color: colors.textMuted }]}>{max}g</Text>
      </View>

      {calories !== undefined && (
        <View style={[styles.summaryCard, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            <Text style={[styles.summaryHighlight, { color: colors.text }]}>{Math.round(calories)} kcal</Text>
            {protein !== undefined && carbs !== undefined && fat !== undefined ? (
              <>
                {'  ·  '}
                <Text style={{ color: colors.danger }}>P {protein}g</Text>
                {'  ·  '}
                <Text style={{ color: colors.accent }}>C {carbs}g</Text>
                {'  ·  '}
                <Text style={{ color: colors.yellow }}>F {fat}g</Text>
              </>
            ) : null}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  gramsValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sliderWrapper: {
    height: 48,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 44,
  },
  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 8,
  },
  limitText: {
    fontSize: 16,
  },
  summaryCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    fontSize: 16,
    textAlign: 'center',
  },
  summaryHighlight: {
    fontWeight: '700',
  },
});

