import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';
import { useApp } from '@/constants/store';
import { myProfile } from '@/data/mock';
import ScoreGauge from '@/components/ScoreGauge';
import { apiGetScore, type ApiScore } from '@/services/api';

export default function ScoreScreen() {
  const { token } = useApp();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<ApiScore | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) {
        setUsingFallback(true);
        setLoading(false);
        return;
      }
      try {
        const data = await apiGetScore(token);
        setScore(data);
      } catch {
        setUsingFallback(true); // 서버 실패 시 샘플로 표시
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const value = score?.score ?? myProfile.cultureScore;
  const grade = score?.grade ?? 'B';
  const message = score?.message ?? '문화생활을 조금씩 늘려가고 있어요!';
  const missing = score?.missing_categories ?? ['클래식', '무용'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      {usingFallback && (
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSub} />
          <Text style={styles.noticeText}>
            {token ? '서버에 연결하지 못해 샘플 점수를 표시 중이에요.' : '로그인하면 실제 내 점수를 볼 수 있어요.'}
          </Text>
        </View>
      )}

      <View style={[styles.card, shadow.card, { alignItems: 'center' }]}>
        <ScoreGauge score={value} size={140} />
        <Text style={styles.grade}>등급 {grade}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.cardTitle}>아직 경험이 부족한 분야</Text>
        <View style={styles.chips}>
          {missing.map((c) => (
            <View key={c} style={styles.chip}>
              <Text style={styles.chipText}>{c}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.hint}>이 분야를 경험하면 문화 점수를 더 올릴 수 있어요!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { fontSize: font.caption, color: colors.textSub, flex: 1 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.lg },
  grade: { fontSize: font.title, fontWeight: '800', color: colors.primary, marginTop: spacing.md },
  message: { fontSize: font.body, color: colors.textSub, marginTop: spacing.sm, textAlign: 'center' },
  cardTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.primary + '15', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipText: { color: colors.primaryDark, fontSize: font.caption, fontWeight: '700' },
  hint: { fontSize: font.caption, color: colors.textSub, marginTop: spacing.md },
});
