import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../theme/colors';

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: string;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  consumed,
  goal,
  unit,
  color,
}) => {
  const { colors } = useAppTheme();
  const safeGoal = goal > 0 ? goal : 1;
  const targetRatio = Math.min(Math.max(consumed / safeGoal, 0), 1);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(targetRatio, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetRatio, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(consumed)} trên ${goal} ${unit}`}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.textSecondary }]}>
          <Text style={[styles.consumedText, { color: colors.text }]}>{Math.round(consumed)}</Text>
          {' / '}{goal} {unit}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.borderLight }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  consumedText: {
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
