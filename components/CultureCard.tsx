import { colors, font, radius, shadow, spacing, layout } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';

// 💡 백엔드 DB 구조에 맞춘 타입 (기존 로직 유지)
export type DbCultureItem = {
  id: string | number;
  api_id?: string;
  title: string;
  poster?: string;         // 백엔드 포스터 이미지 URL
  category?: string;       // 백엔드 장르(카테고리)
  genre?: string;          // 영화 세부 장르(액션, 스릴러 등)
  start_date?: string;     // 개봉/시작일자
  end_date?: string;       // 종료일자
  location?: string;       // 공연장 이름
  min_price?: number;      // 최저가
  liked?: boolean;

  // 기존 Mock 데이터 호환용 옵셔널
  image?: string;
  venue?: string;
  rating?: number;
};

type Props = {
  item: DbCultureItem;
  width?: DimensionValue;
  onToggleLike: () => void;
};

export default function CultureCard({ item, width, onToggleLike }: Props) {
  // 진짜 DB 데이터 / 가짜 Mock 데이터 중 있는 값을 사용
  const imageUrl = item.poster || item.image || null; // 없으면 null → 로컬 플레이스홀더
  const categoryText = item.category || '장르 미상';
  const venueText = item.location || item.venue || '장소 미상';

  const priceText =
    item.min_price === 0
      ? '무료'
      : item.min_price
      ? `${item.min_price.toLocaleString()}원~`
      : '가격 확인';

  const detailGenreText = item.genre || '장르 미상';
  const releaseDate = item.start_date ? String(item.start_date).split('T')[0] : '미상';

  return (
    <Pressable
      style={[styles.card, width ? { width } : { flex: 1 }, shadow.card]}
      onPress={() => router.push(`/detail/${item.id}`)}
    >
      {/* 썸네일 (없으면 아이콘 플레이스홀더) */}
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePh]}>
            <Ionicons name="image-outline" size={26} color={colors.textMuted} />
          </View>
        )}
        <Pressable hitSlop={8} style={styles.likeBtn} onPress={() => onToggleLike?.()}>
          <Ionicons
            name={item.liked ? 'heart' : 'heart-outline'}
            size={18}
            color={item.liked ? colors.danger : colors.white}
          />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>{categoryText}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          {item.category === '영화' ? (
            <>
              <Ionicons name="film-outline" size={12} color={colors.primary} />
              <Text style={styles.meta} numberOfLines={1}>
                {detailGenreText} · 개봉 {releaseDate}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="ticket-outline" size={12} color={colors.primary} />
              <Text style={styles.meta} numberOfLines={1}>
                {priceText} · {venueText}
              </Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: layout.cardImageHeight, backgroundColor: colors.surface },
  imagePh: { alignItems: 'center', justifyContent: 'center' },
  likeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.full,
    padding: 6,
  },
  body: { padding: spacing.md },
  category: { fontSize: font.caption, color: colors.primary, fontWeight: '700', marginBottom: 2 },
  // 제목 높이를 2줄로 고정 → 제목 길이가 달라도 카드 높이가 같아져 줄이 반듯해짐
  title: { fontSize: font.body, fontWeight: '700', color: colors.text, lineHeight: 19, height: layout.cardTitleHeight },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  meta: { fontSize: font.caption, color: colors.textSub, flexShrink: 1 },
});
