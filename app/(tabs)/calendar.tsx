import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing, layout } from '@/constants/theme';
import { useApp } from '@/constants/store';
import CultureCard from '@/components/CultureCard';

// ── 날짜 유틸 ─────────────────────────────────────────────────
// YYYYMMDD 또는 YYYY-MM-DD → YYYY-MM-DD
function normDate(d: string): string {
  const s = d.split('T')[0];
  if (s.length === 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return s;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end && out.length < 400) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

// 카테고리 → 고정 색상
const PALETTE = ['#17B4C4', '#D85A30', '#378ADD', '#6C5CE7', '#E84393', '#00B894'];
function colorFor(cat?: string): string {
  let h = 0;
  for (const ch of cat || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function shadeVariant(hex: string, step: number): string {
  if (step <= 0) return hex;
  const amt = Math.min(step * 0.24, 0.62);
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r + (255 - r) * amt);
  g = Math.round(g + (255 - g) * amt);
  b = Math.round(b + (255 - b) * amt);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const MAX_LANES = 3;
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { likedItems, toggleLike } = useApp();

  // start_date 있는 찜 항목만, 날짜 정규화
  const likedRanges = useMemo(
    () =>
      likedItems
        .filter((it) => it.start_date)
        .map((it) => {
          const start = normDate(String(it.start_date));
          const end = it.end_date ? normDate(String(it.end_date)) : start;
          return { item: it, range: { start, end } };
        })
        .sort((a, b) => (a.range.start < b.range.start ? -1 : 1)),
    [likedItems]
  );

  const [selected, setSelected] = useState(() => likedRanges[0]?.range.start || todayISO());

  // multi-period 마킹 생성
  const marked = useMemo(() => {
    const md: Record<string, any> = {};
    const laneEnds: string[] = [];
    const catCount: Record<string, number> = {};

    for (const { item, range } of likedRanges) {
      let lane = laneEnds.findIndex((end) => end < range.start);
      if (lane === -1) {
        if (laneEnds.length < MAX_LANES) {
          lane = laneEnds.length;
          laneEnds.push(range.end);
        } else {
          continue;
        }
      } else {
        laneEnds[lane] = range.end;
      }

      const occ = catCount[item.category ?? ''] ?? 0;
      catCount[item.category ?? ''] = occ + 1;
      const color = shadeVariant(colorFor(item.category), occ);

      const days = daysBetween(range.start, range.end);
      days.forEach((day, idx) => {
        if (!md[day]) md[day] = { periods: [] };
        const periods = md[day].periods as any[];
        while (periods.length < lane) periods.push({ color: 'transparent' });
        periods[lane] = {
          startingDay: idx === 0,
          endingDay: idx === days.length - 1,
          color,
        };
      });
    }

    md[selected] = { ...(md[selected] ?? {}), selected: true, selectedColor: colors.primary };
    return md;
  }, [likedRanges, selected]);

  // 카테고리 범례
  const legend = useMemo(() => {
    const seen = new Set<string>();
    const out: { cat: string; color: string }[] = [];
    likedRanges.forEach(({ item }) => {
      const cat = item.category || '기타';
      if (!seen.has(cat)) {
        seen.add(cat);
        out.push({ cat, color: colorFor(item.category) });
      }
    });
    return out;
  }, [likedRanges]);

  // 선택일에 걸치는 찜 항목
  const dayItems = likedRanges
    .filter(({ range }) => selected >= range.start && selected <= range.end)
    .map(({ item }) => item);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>문화 캘린더</Text>

      <View style={styles.calendarWrap}>
        <Calendar
          current={selected}
          onDayPress={(d) => setSelected(d.dateString)}
          markedDates={marked}
          markingType="multi-period"
          theme={{
            todayTextColor: colors.primary,
            arrowColor: colors.primary,
            textMonthFontWeight: '800',
            textDayFontWeight: '500',
          }}
        />
      </View>

      {legend.length > 0 && (
        <View style={styles.legend}>
          {legend.map((l) => (
            <View key={l.cat} style={styles.legendItem}>
              <View style={[styles.legendBar, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.cat}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>{selected} 일정</Text>
      {dayItems.length > 0 ? (
        <View style={styles.cardRow}>
          {dayItems.map((it) => (
            <CultureCard
              key={String(it.id)}
              item={{ ...it, liked: true }}
              width="48%"
              onToggleLike={() => toggleLike(it)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>이 날짜에는 찜한 일정이 없어요.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  calendarWrap: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBar: { width: 18, height: 4, borderRadius: 2 },
  legendText: { fontSize: font.caption, color: colors.textSub, fontWeight: '600' },
  sectionTitle: { fontSize: font.title, fontWeight: '800', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.gridGap },
  empty: { color: colors.textSub, paddingVertical: spacing.lg },
});
