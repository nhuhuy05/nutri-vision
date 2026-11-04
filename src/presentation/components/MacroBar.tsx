import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../core/theme';

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
  const percentage = Math.min(Math.round((consumed / (goal || 1)) * 100), 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          <Text style={{ fontWeight: '700', color: COLORS.text }}>{Math.round(consumed)}</Text>
          {' / '}{goal} {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: color },
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
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

