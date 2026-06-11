import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/constants/theme';
import { useApp } from '@/constants/store';
import { apiGetSchedules, apiGetBadges, apiGetPoints } from '@/services/api';

type NotifItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  highlight?: boolean;
};

// YYYYMMDD 문자열 → Date (시각은 자정으로 고정)
function parseEventDate(d: string | null): Date | null {
  if (!d || d.length !== 8) return null;
  const date = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dDayText(d: string | null): string {
  const target = parseEventDate(d);
  if (!target) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return '오늘';
  if (diff > 0) return `D-${diff}`;
  return `${-diff}일 전`;
}

export default function NotificationsScreen() {
  const { token } = useApp();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) {
        setNotice('로그인하면 알림을 확인할 수 있어요.');
        setLoading(false);
        return;
      }
      try {
        const [schedData, badgeData, pointData] = await Promise.all([
          apiGetSchedules(token),
          apiGetBadges(token),
          apiGetPoints(token),
        ]);

        const list: NotifItem[] = [];

        // 다가오는 일정 (오늘 이후, 가까운 순으로 최대 5개)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = (schedData.schedules ?? [])
          .filter((s) => {
            const d = parseEventDate(s.date_start);
            return d !== null && d.getTime() >= today.getTime();
          })
          .sort((a, b) => a.date_start.localeCompare(b.date_start))
          .slice(0, 5);

        upcoming.forEach((s) => {
          const dday = dDayText(s.date_start);
          list.push({
            id: `sched-${s.id}`,
            icon: 'time-outline',
            title: `관람 ${dday}`,
            body: `${s.title} 일정이 있어요.`,
            highlight: dday === '오늘' || dday === 'D-1',
          });
        });

        // 최근 획득한 배지 (최대 5개)
        (badgeData.badges ?? []).slice(0, 5).forEach((b) => {
          list.push({
            id: `badge-${b.badge_code}`,
            icon: 'ribbon-outline',
            title: '배지 획득',
            body: `'${b.name}' 배지를 획득했어요. ${b.description}`,
          });
        });

        // 최근 포인트 적립 내역 (최대 5개)
        (pointData.history ?? []).slice(0, 5).forEach((h, i) => {
          list.push({
            id: `point-${i}`,
            icon: 'pricetag-outline',
            title: `포인트 적립 +${h.points}P`,
            body: h.reason,
          });
        });

        setItems(list);
      } catch (e: any) {
        setNotice(e?.message ?? '알림을 불러오지 못했어요.');
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.section}>최근 알림</Text>

      {notice && (
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSub} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {!notice && items.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>아직 알림이 없어요.</Text>
        </View>
      )}

      {items.map((n) => (
        <View key={n.id} style={[styles.item, n.highlight && styles.itemHighlight]}>
          <View style={styles.iconWrap}>
            <Ionicons name={n.icon} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  section: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  noticeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { fontSize: font.caption, color: colors.textSub, flex: 1 },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  emptyText: { fontSize: font.body, color: colors.textSub },
  item: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: colors.white },
  itemHighlight: { backgroundColor: colors.surfaceAlt },
  iconWrap: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.body, fontWeight: '700', color: colors.text },
  body: { fontSize: font.caption, color: colors.textSub, marginTop: 2, lineHeight: 17 },
});
