import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../theme';

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
}

function scoreColor(score: number): string {
  if (score >= 70) return Colors.scoreHigh;
  if (score >= 40) return Colors.scoreMid;
  return Colors.scoreLow;
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Excelent';
  if (score >= 55) return 'Bun';
  if (score >= 40) return 'Mediu';
  return 'Slab';
}

export function ScoreRing({ score, size = 64 }: ScoreRingProps) {
  const color = scoreColor(score);
  const fontSize = size < 50 ? Typography.sm : Typography.base;

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <Text style={[styles.score, { color, fontSize: fontSize + 2, fontWeight: Typography.bold }]}>
        {Math.round(score)}
      </Text>
      <Text style={[styles.label, { color, fontSize: Typography.xs - 1 }]}>
        {scoreLabel(score)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: 'System',
    lineHeight: 20,
  },
  label: {
    fontFamily: 'System',
    fontWeight: '600',
  },
});
