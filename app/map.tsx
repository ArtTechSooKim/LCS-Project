import CultureCard from '@/components/CultureCard';
import SectionHeader from '@/components/SectionHeader';
import { useApp } from '@/constants/store';
import { colors, font, radius, shadow, spacing, layout } from '@/constants/theme';
import { apiGetNearbyEvents, type ApiEvent } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

declare global {
  interface Window {
    kakao: any;
    ReactNativeWebView: any;
  }
}

// 서울시청 (위치 권한이 없거나 가져오지 못했을 때 기본 위치)
const DEFAULT_COORDS = { lat: 37.5665, lng: 126.978 };
const KAKAO_APP_KEY = '8ea1d804b6487d88298dce1248d75855';
const MAP_BASE_URL = 'https://distweb-rosy.vercel.app';

// [모바일 앱 전용] 카카오 지도 HTML (현재 위치 + 주변 문화공간 마커)
const getMapHtml = (myLat: number, myLng: number, placesJson: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}"></script>
    <style> body, html { margin: 0; padding: 0; width: 100%; height: 100%; } #map { width: 100%; height: 100%; } </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map;
      kakao.maps.load(function() {
        var mapContainer = document.getElementById('map');
        var mapOption = { center: new kakao.maps.LatLng(${myLat}, ${myLng}), level: 4 };
        map = new kakao.maps.Map(mapContainer, mapOption);

        var myMarker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(${myLat}, ${myLng}) });
        var myInfoWindow = new kakao.maps.InfoWindow({
          content: '<div style="padding:5px;font-size:12px;color:blue;font-weight:bold;text-align:center;">현재 내 위치</div>'
        });
        myInfoWindow.open(map, myMarker);

        var places = ${placesJson};
        places.forEach(function(place) {
          if (place.lat == null || place.lng == null) return;
          var marker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(place.lat, place.lng) });
          var infowindow = new kakao.maps.InfoWindow({
            content: '<div style="padding:5px;font-size:12px;text-align:center;color:black;white-space:nowrap;cursor:pointer;font-weight:bold;">' + place.title + '<br/><span style="color:#007AFF; font-size:10px;">클릭하여 카카오맵 열기👆</span></div>'
          });
          kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(place.location);
            }
          });
        });

        window.addEventListener('message', function(e) {
          if (e.data === 'moveToCurrent') {
            map.panTo(new kakao.maps.LatLng(${myLat}, ${myLng}));
          }
        });
        document.addEventListener('message', function(e) {
          if (e.data === 'moveToCurrent') {
            map.panTo(new kakao.maps.LatLng(${myLat}, ${myLng}));
          }
        });
      });
    </script>
  </body>
  </html>
`;

export default function MapScreen() {
  const { toggleLike, likedIds } = useApp();
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      let c = DEFAULT_COORDS;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } else {
          setNotice('위치 권한이 없어 서울 중심 기준으로 보여드려요.');
        }
      } catch {
        setNotice('현재 위치를 가져오지 못해 서울 중심 기준으로 보여드려요.');
      }
      setCoords(c);

      try {
        const data = await apiGetNearbyEvents(c.lat, c.lng, 5);
        setEvents(data.events ?? []);
      } catch (e: any) {
        setNotice(e?.message ?? '주변 문화생활 정보를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // [웹 전용] 카카오 지도 스크립트 로드 및 렌더링
  useEffect(() => {
    if (Platform.OS !== 'web' || loading) return;
    const scriptId = 'kakao-map-script';

    const draw = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('kakaomap');
        if (!container) return;
        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(coords.lat, coords.lng),
          level: 4,
        });
        new window.kakao.maps.Marker({ map, position: new window.kakao.maps.LatLng(coords.lat, coords.lng) });

        events.forEach((place: any) => {
          if (place.lat == null || place.lng == null) return;
          const marker = new window.kakao.maps.Marker({
            map,
            position: new window.kakao.maps.LatLng(place.lat, place.lng),
          });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:black;font-weight:bold;text-align:center;white-space:nowrap;cursor:pointer;">${place.title}<br/><span style="color:#007AFF; font-size:10px;">클릭하여 길찾기👆</span></div>`,
          });
          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
            window.open(`https://map.kakao.com/link/search/${encodeURIComponent(place.location)}`, '_blank');
          });
        });
      });
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
      document.head.appendChild(script);
      script.onload = draw;
    } else {
      draw();
    }
  }, [coords, events, loading]);

  const handleMoveToCurrent = () => {
    if (Platform.OS === 'web') {
      if (window.kakao?.maps) {
        const container = document.getElementById('kakaomap');
        if (container) {
          new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(coords.lat, coords.lng),
            level: 4,
          });
        }
      }
    } else {
      webviewRef.current?.postMessage('moveToCurrent');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      {notice && (
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSub} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <View style={styles.mapWrap}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {Platform.OS === 'web' ? (
              <View nativeID="kakaomap" style={{ width: '100%', height: '100%', backgroundColor: colors.surface }} />
            ) : (
              <WebView
                ref={webviewRef}
                originWhitelist={['*']}
                source={{
                  html: getMapHtml(coords.lat, coords.lng, JSON.stringify(events)),
                  baseUrl: MAP_BASE_URL,
                }}
                onMessage={(e) => {
                  const clicked = e.nativeEvent.data;
                  if (clicked && clicked !== 'moveToCurrent') {
                    Linking.openURL(`https://map.kakao.com/link/search/${encodeURIComponent(clicked)}`);
                  }
                }}
                style={{ flex: 1 }}
              />
            )}
            <TouchableOpacity style={styles.myLocationBtn} onPress={handleMoveToCurrent}>
              <Ionicons name="locate" size={22} color={colors.primary} />
            </TouchableOpacity>
          </>
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
  mapWrap: { height: 280, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface, position: 'relative' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  myLocationBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
    ...shadow.card,
  },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.gridGap },
  empty: { color: colors.textSub, textAlign: 'center', paddingVertical: spacing.xl },
});
