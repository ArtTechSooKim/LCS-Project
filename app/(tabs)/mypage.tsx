import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';
import { myProfile, categories } from '@/data/mock';
import { useApp } from '@/constants/store';
import { apiGetScore } from '@/services/api';
import CultureCard from '@/components/CultureCard';
import AuthModal from '@/components/AuthModal';
import PreferenceModal from '@/components/PreferenceModal';
import ConfirmModal from '@/components/ConfirmModal';

const MENU: { label: string; icon: string; route: string }[] = [
  { label: '예약/결제 내역 조회', icon: 'receipt-outline', route: '/schedules' },
  { label: '루틴 요일/주기', icon: 'repeat-outline', route: '/routine' },
  { label: '1:1 문의', icon: 'help-circle-outline', route: '/inquiry' },
  { label: '문화 점수 확인하기', icon: 'sparkles-outline', route: '/score' },
  { label: '나의 코멘트 모아보기', icon: 'chatbubble-ellipses-outline', route: '/comments' },
  { label: '나의 지역 문화 점수 진단하기', icon: 'analytics-outline', route: '/diagnosis' },
];

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, likedItems, toggleLike, user, prefs, logout, token } = useApp();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [prefModalVisible, setPrefModalVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  // 문화 스코어: 로그인 시 서버 실제 점수, 아니면 mock(75)로 폴백 → 점수 화면과 동일 출처
  const [cultureScore, setCultureScore] = useState<number>(myProfile.cultureScore);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiGetScore(token);
        if (typeof data?.score === 'number') setCultureScore(data.score);
      } catch {
        // 서버 실패 시 mock 값 유지
      }
    })();
  }, [token]);

  // 내가 고른 관심사 → 카테고리 아이콘 뱃지 (관심사를 바꾸면 자동으로 바뀜)
  const myCategories = useMemo(
    () => categories.filter((c) => prefs.includes(c.id)),
    [prefs]
  );

  const handleLogout = () => {
    setLogoutConfirmVisible(false);
    logout();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Text style={styles.screenTitle}>마이페이지</Text>
        <Pressable hitSlop={8} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {isLoggedIn ? (
        <View style={[styles.profileCard, shadow.card]}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.nickname}>{user?.name ?? myProfile.nickname}</Text>
                <Pressable style={styles.prefBtn} onPress={() => setPrefModalVisible(true)}>
                  <Ionicons name="options-outline" size={13} color={colors.primary} />
                  <Text style={styles.prefBtnText}>관심사 재설정</Text>
                </Pressable>
              </View>
              <Text style={styles.scoreText}>문화 스코어 {cultureScore}점</Text>
            </View>
          </View>

          {/* 내가 설정한 관심사 아이콘 */}
          {myCategories.length > 0 ? (
            <View style={styles.badges}>
              {myCategories.map((c) => (
                <View key={c.id} style={[styles.badge, { backgroundColor: c.color + '18' }]}>
                  <Ionicons name={c.icon as any} size={20} color={c.color} />
                </View>
              ))}
            </View>
          ) : (
            <Pressable style={styles.emptyPrefs} onPress={() => setPrefModalVisible(true)}>
              <Text style={styles.emptyPrefsText}>아직 관심사가 없어요. 설정하러 가기 →</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={[styles.profileCard, shadow.card]}>
          <Text style={styles.guideText}>로그인을 하시면 자신에게 맞는{'\n'}문화생활을 추천해드릴게요.</Text>
          <Pressable style={styles.loginBtn} onPress={() => setAuthModalVisible(true)}>
            <Text style={styles.loginBtnText}>회원가입 / 로그인하기</Text>
          </Pressable>
        </View>
      )}

      {/* 내가 찜한 목록 */}
      <View style={{ marginTop: spacing.xl }}>
        <Text style={styles.sectionTitle}>내가 찜한 목록</Text>
        {likedItems.length > 0 ? (
          <View style={styles.cardRow}>
            {likedItems.map((it) => (
              <CultureCard key={String(it.id)} item={{ ...it, liked: true }} width="48%" onToggleLike={() => toggleLike(it)} />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>아직 찜한 문화생활이 없어요.</Text>
        )}
      </View>

      {/* 메뉴 */}
      <View style={[styles.menu, shadow.card]}>
        {MENU.map((m, i) => (
          <Pressable
            key={m.label}
            style={[styles.menuItem, i < MENU.length - 1 && styles.menuDivider]}
            onPress={() => router.push(m.route as any)}
          >
            <Ionicons name={m.icon as any} size={18} color={colors.textSub} />
            <Text style={styles.menuText}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      {isLoggedIn && (
        <Pressable style={styles.logout} onPress={() => setLogoutConfirmVisible(true)}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      )}

      <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
      <PreferenceModal visible={prefModalVisible} onClose={() => setPrefModalVisible(false)} />
      <ConfirmModal
        visible={logoutConfirmVisible}
        title="정말 로그아웃 하시겠습니까?"
        confirmColor={colors.dangerSoft}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  screenTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text },

  profileCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: radius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  nickname: { fontSize: font.title, fontWeight: '800', color: colors.text },
  prefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.primary + '0D',
  },
  prefBtnText: { fontSize: font.caption, fontWeight: '700', color: colors.primary },
  scoreText: { fontSize: font.body, color: colors.primary, fontWeight: '600', marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  badge: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emptyPrefs: { marginTop: spacing.lg },
  emptyPrefsText: { fontSize: font.body, color: colors.textSub },

  guideText: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, lineHeight: 24, marginBottom: spacing.lg },
  loginBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  loginBtnText: { color: colors.white, fontWeight: '700', fontSize: font.body },

  sectionTitle: { fontSize: font.title, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  empty: { color: colors.textSub, paddingVertical: spacing.md },

  menu: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.xl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuText: { flex: 1, fontSize: font.body, color: colors.text },

  logout: { alignItems: 'center', paddingVertical: spacing.xl },
  logoutText: { color: colors.dangerSoft, fontSize: font.body, fontWeight: '600' },
});
