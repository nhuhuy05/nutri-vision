import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  stroke?: number;
  centerLabel?: string;
  subLabel?: string;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  goal,
  size = 140,
  stroke = 12,
  centerLabel,
  subLabel,
}) => {
  const { colors } = useAppTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);

  const safeGoal = goal > 0 ? goal : 1;
  const targetProgress = Math.min(Math.max(consumed / safeGoal, 0), 1);

  useEffect(() => {
    p.value = withTiming(targetProgress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetProgress, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - p.value),
  }));

  const percent = Math.round((consumed / safeGoal) * 100);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${Math.round(consumed)} trên ${goal} kilocalo, đạt ${percent}% mục tiêu`}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.borderLight}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.centerContent} pointerEvents="none">
        <Text
          style={[
            styles.centerText,
            { color: colors.text, fontSize: size < 130 ? 20 : 24 },
          ]}
        >
          {centerLabel ?? `${percent}%`}
        </Text>
        <Text
          style={[
            styles.subText,
            { color: colors.textSecondary, fontSize: 16 },
          ]}
        >
          {subLabel ?? 'MỤC TIÊU'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontWeight: '800',
    lineHeight: 28,
  },
  subText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
