import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '@/constants/theme';
import { categories } from '@/data/mock';
import { useApp } from '@/constants/store';

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const canNext = selected.length >= 3;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const finish = () => {
    completeOnboarding(selected);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxl }]}>
      <Text style={styles.kicker}>관심사 설정</Text>
      <Text style={styles.title}>어떤 문화생활을{'\n'}가장 좋아하세요?</Text>
      <Text style={styles.sub}>취향에 맞는 활동을 추천해 드릴게요. (3개 이상)</Text>

      <View style={styles.grid}>
        {categories.map((cat) => {
          const active = selected.includes(cat.id);
          return (
            <Pressable
              key={cat.id}
              style={[styles.tile, active && { borderColor: colors.primary, backgroundColor: colors.primary + '11' }]}
              onPress={() => toggle(cat.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: cat.color + '22' }]}>
                <Ionicons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={styles.tileLabel}>{cat.label}</Text>
              {active && (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        style={[styles.nextBtn, !canNext && styles.nextBtnDisabled, { marginBottom: insets.bottom + spacing.lg }]}
        disabled={!canNext}
        onPress={finish}
      >
        <Text style={styles.nextText}>{canNext ? '시작하기' : `${3 - selected.length}개 더 선택해주세요`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  kicker: { color: colors.accent, fontWeight: '800', fontSize: font.caption, letterSpacing: 1 },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginTop: spacing.sm, lineHeight: 36 },
  sub: { fontSize: font.body, color: colors.textSub, marginTop: spacing.sm, marginBottom: spacing.xl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: {
    width: '31%',
    aspectRatio: 0.95,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
  },
  iconWrap: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: font.body, fontWeight: '600', color: colors.text },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: colors.border },
  nextText: { color: colors.white, fontWeight: '700', fontSize: font.subtitle },
});
