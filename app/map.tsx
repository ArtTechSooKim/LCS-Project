import CultureCard from '@/components/CultureCard';
import SectionHeader from '@/components/SectionHeader';
import { useApp } from '@/constants/store';
import { colors, font, radius, spacing, layout } from '@/constants/theme';
import { apiGetNearbyEvents, type ApiEvent } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// 서울시청 (위치 권한이 없거나 가져오지 못했을 때 기본 위치)
const DEFAULT_COORDS = { lat: 37.5665, lng: 126.978 };

// 카카오 지도 공개 링크 - 앱키/도메인 등록 없이 특정 좌표를 보여줌
function kakaoMapLink(name: string, lat: number, lng: number) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;
}

export default function MapScreen() {
  const { toggleLike, likedIds } = useApp();
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let coords = DEFAULT_COORDS;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } else {
          setNotice('위치 권한이 없어 서울 중심 기준으로 보여드려요.');
        }
      } catch {
        setNotice('현재 위치를 가져오지 못해 서울 중심 기준으로 보여드려요.');
      }
      setCoords(coords);

      try {
        const data = await apiGetNearbyEvents(coords.lat, coords.lng, 5);
        setEvents(data.events ?? []);
      } catch (e: any) {
        setNotice(e?.message ?? '주변 문화생활 정보를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mapUrl = kakaoMapLink('내 위치', coords.lat, coords.lng);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      {notice && (
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSub} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <View style={styles.mapWrap}>
        {Platform.OS === 'web' ? (
          <iframe src={mapUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
        ) : (
          <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
        )}
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <SectionHeader title={`주변 문화생활 ${events.length}건 (반경 5km)`} />
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : events.length === 0 ? (
          <Text style={styles.empty}>주변에 등록된 문화생활이 없어요.</Text>
        ) : (
          <View style={styles.cardRow}>
            {events.map((e: any) => (
              <CultureCard
                key={e.id}
                item={{ ...e, liked: likedIds.has(String(e.id)) }}
                width="48%"
                onToggleLike={() => toggleLike(e)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  noticeBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { fontSize: font.caption, color: colors.textSub, flex: 1 },
  mapWrap: { height: 240, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.gridGap },
  empty: { color: colors.textSub, textAlign: 'center', paddingVertical: spacing.xl },
});
