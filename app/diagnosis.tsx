import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';
import { useApp } from '@/constants/store';
import { apiGetScore, type ApiScore } from '@/services/api';

// 서버 실패/비로그인 시 보여줄 샘플
const SAMPLE: { category: string; count: number; visited: boolean }[] = [
  { category: '영화', count: 8, visited: true },
  { category: '전시', count: 5, visited: true },
  { category: '뮤지컬', count: 3, visited: true },
  { category: '연극', count: 1, visited: true },
  { category: '클래식', count: 0, visited: false },
  { category: '무용', count: 0, visited: false },
];

export default function DiagnosisScreen() {
  const { token } = useApp();
  const [loading, setLoading] = useState(true);
  const [radar, setRadar] = useState(SAMPLE);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) {
        setNotice('로그인하면 실제 내 지역 문화 점수를 진단해드려요.');
        setLoading(false);
        return;
      }
      try {
        const data: ApiScore = await apiGetScore(token);
        if (data.radar?.length) setRadar(data.radar);
      } catch {
        setNotice('서버에 연결하지 못해 샘플 데이터를 표시 중이에요.');
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

  const max = Math.max(...radar.map((r) => r.count), 1);
  const visitedCount = radar.filter((r) => r.visited).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      {notice && (
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSub} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.cardTitle}>카테고리별 경험 분포</Text>
        <Text style={styles.cardSub}>{radar.length}개 분야 중 {visitedCount}개 경험</Text>
        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {radar.map((r) => (
            <View key={r.category} style={styles.row}>
              <Text style={styles.rowLabel}>{r.category}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(r.count / max) * 100}%`, backgroundColor: r.visited ? colors.primary : colors.border },
                  ]}
                />
              </View>
              <Text style={styles.rowCount}>{r.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.cardTitle}>진단 결과</Text>
        <Text style={styles.diag}>
          아직 경험하지 못한 분야는{' '}
          <Text style={{ fontWeight: '800', color: colors.primary }}>
            {radar.filter((r) => !r.visited).map((r) => r.category).join(', ') || '없어요'}
          </Text>
          {' '}예요. 새로운 분야에 도전해 균형 잡힌 문화생활을 만들어보세요!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  noticeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { fontSize: font.caption, color: colors.textSub, flex: 1 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: font.caption, color: colors.textSub, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { width: 48, fontSize: font.caption, color: colors.text },
  barTrack: { flex: 1, height: 12, borderRadius: 6, backgroundColor: colors.surface, overflow: 'hidden' },
  barFill: { height: 12, borderRadius: 6 },
  rowCount: { width: 24, textAlign: 'right', fontSize: font.caption, color: colors.textSub },
  diag: { fontSize: font.body, color: colors.text, lineHeight: 22, marginTop: spacing.sm },
});
