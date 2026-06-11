import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';
import { useApp } from '@/constants/store';
import { apiGetSchedules, type ApiSchedule } from '@/services/api';

export default function SchedulesScreen() {
  const { token } = useApp();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) {
        setNotice('로그인하면 예약·결제 내역을 볼 수 있어요.');
        setLoading(false);
        return;
      }
      try {
        const data = await apiGetSchedules(token);
        setSchedules(data.schedules ?? []);
      } catch (e: any) {
        setNotice(e?.message ?? '내역을 불러오지 못했어요.');
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
      {notice && (
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSub} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {schedules.length === 0 && !notice && (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>아직 예약·결제 내역이 없어요.</Text>
        </View>
      )}

      {schedules.map((s) => (
        <View key={s.id} style={[styles.row, shadow.card]}>
          <View style={styles.iconWrap}>
            <Ionicons name="ticket-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{s.title}</Text>
            <Text style={styles.meta}>{s.date_start}</Text>
          </View>
          {s.booking_url ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  noticeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { fontSize: font.caption, color: colors.textSub, flex: 1 },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  emptyText: { fontSize: font.body, color: colors.textSub },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.body, fontWeight: '700', color: colors.text },
  meta: { fontSize: font.caption, color: colors.textSub, marginTop: 2 },
});
