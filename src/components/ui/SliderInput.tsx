import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
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
  const trackWidthRef = useRef(0);

  // Keep latest props accessible from the PanResponder (created once, no stale closures)
  const propsRef = useRef({ min, max, step, onValueChange });
  useEffect(() => { propsRef.current = { min, max, step, onValueChange }; });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { min, max, step, onValueChange } = propsRef.current;
        const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidthRef.current));
        const raw = min + ratio * (max - min);
        const snapped = Math.round((raw - min) / step) * step + min;
        onValueChange(Math.max(min, Math.min(max, snapped)));
      },
      onPanResponderMove: (e) => {
        const { min, max, step, onValueChange } = propsRef.current;
        const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidthRef.current));
        const raw = min + ratio * (max - min);
        const snapped = Math.round((raw - min) / step) * step + min;
        onValueChange(Math.max(min, Math.min(max, snapped)));
      },
    })
  ).current;

  const progress = (value - min) / (max - min);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>

      <View style={styles.controls}>
        <Text style={styles.btn} onPress={() => onValueChange(Math.max(min, value - step))}>−</Text>

        <View
          style={styles.trackWrapper}
          onLayout={(e) => { trackWidthRef.current = e.nativeEvent.layout.width; }}
          {...panResponder.panHandlers}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` as any }]} />
          </View>
          <View
            style={[
              styles.thumb,
              { left: `${progress * 100}%` as any, transform: [{ translateX: -9 }] },
            ]}
          />
        </View>

        <Text style={styles.btn} onPress={() => onValueChange(Math.min(max, value + step))}>+</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
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
  trackWrapper: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    cursor: 'pointer' as any,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%' as any,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    top: 5, // (28 - 18) / 2
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rangeText: { fontSize: Typography.xs, color: Colors.textMuted, fontFamily: 'System' },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontFamily: 'System',
  },
});
