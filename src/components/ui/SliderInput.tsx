import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (v: number) => void;
  formatValue?: (v: number) => string;
  hint?: string;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  formatValue,
  hint,
}: SliderInputProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);

  // Web: use native <input type="range">
  // React Native: use simple increment/decrement buttons
  const handleDecrease = () => {
    const next = Math.max(min, value - step);
    onValueChange(next);
  };

  const handleIncrease = () => {
    const next = Math.min(max, value + step);
    onValueChange(next);
  };

  const progress = (value - min) / (max - min);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>

      <View style={styles.controls}>
        <Text style={styles.btn} onPress={handleDecrease}>−</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.btn} onPress={handleIncrease}>+</Text>
      </View>

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{formatValue ? formatValue(min) : min}</Text>
        <Text style={styles.rangeText}>{formatValue ? formatValue(max) : max}</Text>
      </View>

      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    fontFamily: 'System',
  },
  value: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.primary,
    fontFamily: 'System',
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btn: {
    fontSize: 24,
    fontWeight: Typography.bold,
    color: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 36,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  rangeText: { fontSize: Typography.xs, color: Colors.textMuted, fontFamily: 'System' },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontFamily: 'System',
  },
});
