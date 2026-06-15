import AuthModal from '@/components/AuthModal';
import CultureCard from '@/components/CultureCard';
import ScoreGauge from '@/components/ScoreGauge';
import SectionHeader from '@/components/SectionHeader';
import { useApp } from '@/constants/store';
import { colors, font, radius, shadow, spacing, layout } from '@/constants/theme';
import { myProfile, categories } from '@/data/mock';
import { apiGetScore, BASE_URL } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, toggleLike, likedIds, token, prefs } = useApp();
  const [loginPrompt, setLoginPrompt] = useState(false);
  // 홈 문화 스코어: 로그인 시 서버 실제 점수, 아니면 mock(75)로 폴백 → 점수 화면과 동일 출처
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
  
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 화면이 켜질 때 DB 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/list`);
        setDbEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("데이터 통신 에러:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 내가 고른 관심사 카테고리의 한글 라벨 (취향 맞춤 추천 검색용)
  const prefLabels = useMemo(
    () => categories.filter((c) => prefs.includes(c.id) && c.id !== 'all').map((c) => c.label),
    [prefs]
  );

  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  // 관심사 카테고리별로 검색해서 합침: /events/list는 일부 카테고리만 보유해 관심사 변경 시 결과가 비는 문제가 있어 /events/search 사용
  useEffect(() => {
    if (!isLoggedIn || prefLabels.length === 0) {
      setRecommendedEvents([]);
      setRecLoading(false);
      return;
    }
    let cancelled = false;
    setRecLoading(true);
    (async () => {
      try {
        const results = await Promise.all(
          prefLabels.map((genre) =>
            axios.get(`${BASE_URL}/events/search`, { params: { genre, keyword: '' } }).then((r) => r.data)
          )
        );
        if (cancelled) return;
        // 카테고리별 결과를 한 카테고리씩 번갈아 섞어서 특정 카테고리만 몰리지 않게 함
        const seen = new Set<string>();
        const merged: any[] = [];
        const maxLen = Math.max(0, ...results.map((r) => r.length));
        for (let i = 0; i < maxLen; i++) {
          for (const r of results) {
            const it = r[i];
            if (!it) continue;
            const key = String(it.id);
            if (seen.has(key)) continue;
            seen.add(key);
            merged.push(it);
          }
        }
        setRecommendedEvents(merged);
      } catch (error) {
        console.error("취향 맞춤 추천 로드 실패:", error);
        setRecommendedEvents([]);
      } finally {
        if (!cancelled) setRecLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, prefLabels]);

  // 인기 문화생활: 전체 데이터 중 상위 2개 (이미 전체가 반영됨)
  const popular = dbEvents.slice(0, 2);
  const popularIds = new Set(popular.map((it) => it.id));
  // 취향 맞춤 추천: 로그인 + 관심사가 있으면 관심사 카테고리 검색 결과(스크롤로 계속 노출), 없으면 인기 다음 항목
  const recommended = isLoggedIn && prefLabels.length > 0
    ? recommendedEvents.filter((it) => !popularIds.has(it.id))
    : dbEvents.slice(2, 4);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.logo}>문화생활</Text>
        <View style={styles.headerIcons}>
          <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/search')}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {isLoggedIn ? (
          <>
            {/* 문화 스코어 */}
            <View style={[styles.scoreCard, shadow.card]}>
              <Text style={styles.scoreLabel}>나의 문화 스코어</Text>
              <ScoreGauge score={cultureScore} />
              <Pressable style={styles.scoreLink} onPress={() => router.push('/score')}>
                <Text style={styles.scoreLinkText}>AI 분석 결과 보기</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Pressable>
            </View>

            {/* 다가오는 일정 알림 */}
            <View style={[styles.notice, shadow.card]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={styles.noticeText}>영화 관람까지 1일 남았습니다.</Text>
            </View>
          </>
        ) : (
          /* 비로그인 안내 */
          <View style={[styles.loginCard, shadow.card]}>
            <Text style={styles.loginTitle}>로그인을 하시면{'\n'}맞춤 문화생활을 추천해드릴게요.</Text>
            <Pressable style={styles.loginBtn} onPress={() => setLoginPrompt(true)}>
              <Text style={styles.loginBtnText}>회원가입 / 로그인하기</Text>
            </Pressable>
          </View>
        )}

        {/* 인기 문화생활 */}
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title="지금 인기 있는 문화생활"
            onMore={() => router.push('/(tabs)/search')}
          />
          <View style={styles.cardRow}>
            {popular.map((it) => (
              <CultureCard
                key={String(it.id)}
                item={{ ...it, liked: likedIds.has(String(it.id)) }}
                width={layout.cardColWidth}
                onToggleLike={() => toggleLike(it)}
              />
            ))}
          </View>
        </View>

        {/* 추천 (로그인 시에만 개인화) */}
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title={isLoggedIn ? '취향 맞춤 추천' : '오늘의 추천'} />
          {recLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : recommended.length > 0 ? (
            <View style={styles.cardRow}>
              {recommended.map((it) => (
                <CultureCard
                  key={String(it.id)}
                  item={{ ...it, liked: likedIds.has(String(it.id)) }}
                  width={layout.cardColWidth}
                  onToggleLike={() => toggleLike(it)}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>관심사에 맞는 문화생활이 아직 없어요.</Text>
          )}
        </View>
      </ScrollView>

      {/* 로그인/회원가입 모달 */}
      <AuthModal visible={loginPrompt} onClose={() => setLoginPrompt(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  logo: { fontSize: font.h2, fontWeight: '800', color: colors.primary },
  headerIcons: { flexDirection: 'row', gap: spacing.lg },

  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  scoreLabel: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  scoreLink: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.lg },
  scoreLinkText: { color: colors.primary, fontWeight: '700', fontSize: font.body },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  noticeText: { fontSize: font.body, color: colors.text, fontWeight: '600' },

  loginCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  loginTitle: { fontSize: font.subtitle, fontWeight: '700', color: colors.text, lineHeight: 24, marginBottom: spacing.lg },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loginBtnText: { color: colors.white, fontWeight: '700', fontSize: font.body },

  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.gridGap },
  empty: { color: colors.textSub, paddingVertical: spacing.md },
});
