import CultureCard from '@/components/CultureCard';
import SectionHeader from '@/components/SectionHeader';
import { useApp } from '@/constants/store';
import { colors, font, radius, spacing, layout } from '@/constants/theme';
import { categories, type Category } from '@/data/mock';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@/services/api';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { toggleLike, likedIds } = useApp();
  
  // 상태 관리
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

// search.tsx의 fetchEvents 함수 내부
const fetchEvents = async () => {
  setLoading(true);
  try {
    const categoryLabel = activeCat ? categories.find((c) => c.id === activeCat)?.label : '전체';

    const response = await axios.get(`${BASE_URL}/events/search`, {
      params: {
        genre: categoryLabel,
        keyword: query
      }
    });
    setResults(response.data);
  } catch (error) {
    console.error("검색 데이터 로드 실패:", error);
  } finally {
    setLoading(false);
  }
};



  // 카테고리나 검색어 변경 시 자동 호출
  useEffect(() => {
    fetchEvents();
  }, [activeCat, query]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>탐색</Text>

      {/* 검색바 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="어떤 문화생활을 찾으세요?"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={fetchEvents}
        />
      </View>

      {/* 주변 문화생활 지도 보기 */}
      <Pressable style={styles.mapEntry} onPress={() => router.push('/map' as any)}>
        <Ionicons name="map-outline" size={20} color={colors.primary} />
        <Text style={styles.mapEntryText}>주변 문화생활 지도 보기</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSub} />
      </Pressable>

      {/* 카테고리 타일 */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title="카테고리" />
        <View style={styles.grid}>
          {categories.map((cat) => (
            <CategoryTile
              key={cat.id}
              cat={cat}
              active={activeCat === cat.id}
              onPress={() => setActiveCat((prev) => (prev === cat.id ? null : cat.id))}
            />
          ))}
        </View>
      </View>

      {/* 검색 결과 */}
      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title={`결과 ${results.length}건`} />
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : (
          <View style={styles.cardRow}>
            {results.map((it: any) => (
              <CultureCard
                key={it.id}
                item={{ ...it, liked: likedIds.has(String(it.id)) }}
                width="48%"
                onToggleLike={() => toggleLike(it)}
              />
            ))}
          </View>
        )}
        {!loading && results.length === 0 && <Text style={styles.empty}>조건에 맞는 문화생활이 없어요.</Text>}
      </View>

    </ScrollView>
  );
}

// 카테고리 타일 컴포넌트
function CategoryTile({ cat, active, onPress }: { cat: Category; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={[styles.tileIcon, { backgroundColor: active ? cat.color : cat.color + '22' }]}>
        <Ionicons name={cat.icon as any} size={22} color={active ? colors.white : cat.color} />
      </View>
      <Text style={styles.tileLabel} numberOfLines={2}>{cat.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.lg, height: 46 },
  input: { flex: 1, fontSize: font.body, color: colors.text },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  trendingTitle: { fontSize: font.subtitle, fontWeight: '700', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipText: { color: colors.textSub, fontSize: font.caption, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  // 4열 고정 + 왼쪽 정렬 → 마지막 줄 항목이 가운데 비고 양끝에 붙는 문제 해결
  tile: { width: '25%', alignItems: 'center', gap: spacing.sm },
  tileIcon: { width: 52, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  // 라벨 높이를 고정해 긴 라벨(서커스/마술)이 줄바꿈돼도 타일 높이가 같아짐
  tileLabel: { fontSize: font.caption, color: colors.text, fontWeight: '600', textAlign: 'center', height: layout.catLabelHeight, lineHeight: 14 },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.gridGap },
  empty: { color: colors.textSub, textAlign: 'center', paddingVertical: spacing.xl },
  mapEntry: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl },
  mapEntryText: { flex: 1, fontSize: font.body, fontWeight: '600', color: colors.text },
});