import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';
import { useApp } from '@/constants/store';

export default function CommentsScreen() {
  const { isLoggedIn, myReviews } = useApp();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
    >
      <Text style={styles.screenTitle}>나의 코멘트</Text>

      {myReviews.length === 0 ? (
        <>
          <View style={styles.empty}>
            <Ionicons name="chatbubble-ellipses-outline" size={44} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>아직 작성한 코멘트가 없어요.</Text>
            <Text style={styles.emptySub}>
              {isLoggedIn
                ? '문화생활을 관람한 뒤 리뷰를 남기면 여기에 모여요.'
                : '로그인하고 리뷰를 남기면 여기에서 모아볼 수 있어요.'}
            </Text>
          </View>
          <View style={[styles.tipCard, shadow.card]}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={styles.tipText}>리뷰를 작성하면 포인트와 배지를 받을 수 있어요!</Text>
          </View>
        </>
      ) : (
        myReviews.map((r, i) => (
          <View key={i} style={[styles.card, shadow.card]}>
            <Text style={styles.eventTitle} numberOfLines={1}>{r.eventTitle}</Text>
            <View style={styles.starRow}>
              {Array.from({ length: 5 }).map((_, s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={14}
                  color={s < r.rating ? colors.star : colors.border}
                />
              ))}
              <Text style={styles.dateText}>{r.created_at.split('T')[0]}</Text>
            </View>
            <Text style={styles.content}>{r.content}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  emptySub: { fontSize: font.body, color: colors.textSub, textAlign: 'center', lineHeight: 20 },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg },
  tipText: { flex: 1, fontSize: font.body, color: colors.text },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  eventTitle: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: spacing.sm },
  dateText: { fontSize: font.caption, color: colors.textMuted, marginLeft: spacing.sm },
  content: { fontSize: font.body, color: colors.textSub, lineHeight: 20 },
});
