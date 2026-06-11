import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, font } from '@/constants/theme';

type Props = {
  score: number; // 0~100
  size?: number;
  label?: string;
};

export default function ScoreGauge({ score, size = 120, label = '점' }: Props) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          // 12시 방향에서 시작하도록 회전
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.unit}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  score: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  unit: { fontSize: font.caption, color: colors.textSub, marginTop: -2 },
});
