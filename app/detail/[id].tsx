import { colors, font, radius, shadow, spacing } from '@/constants/theme';
import { useApp } from '@/constants/store';
import { apiCheckin, apiGetEventById, apiGetEventReviews, apiPostReview, type ApiReview } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

declare global {
  interface Window {
    kakao: any;
    ReactNativeWebView: any;
  }
}

const KAKAO_APP_KEY = '8ea1d804b6487d88298dce1248d75855';
const MAP_BASE_URL = 'https://distweb-rosy.vercel.app';

// [모바일 앱 전용] 위치 정보 카카오 지도 HTML (키워드 검색 + 마커 클릭 시 RN으로 전달)
const getDetailMapHtml = (keyword: string) => {
  const safeKeyword = keyword ? keyword.replace(/["'\r\n]/g, ' ').trim() : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services"></script>
      <style> body, html { margin: 0; padding: 0; width: 100%; height: 100%; } #map { width: 100%; height: 100%; } </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        kakao.maps.load(function() {
          var mapContainer = document.getElementById('map');
          var mapOption = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 3 };
          var map = new kakao.maps.Map(mapContainer, mapOption);

          var ps = new kakao.maps.services.Places();
          var geocoder = new kakao.maps.services.Geocoder();
          var keyword = "${safeKeyword}";

          function displayMarker(locPosition) {
            var marker = new kakao.maps.Marker({ map: map, position: locPosition });
            var infowindow = new kakao.maps.InfoWindow({
              content: '<div style="padding:5px;font-size:12px;color:black;font-weight:bold;text-align:center;white-space:nowrap;cursor:pointer;">' + keyword + '<br/><span style="color:#007AFF; font-size:10px;">클릭하여 카카오맵 열기👆</span></div>'
            });
            infowindow.open(map, marker);
            map.setCenter(locPosition);

            kakao.maps.event.addListener(marker, 'click', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(keyword);
              }
            });
          }

          ps.keywordSearch(keyword, function(data, status) {
            if (status === kakao.maps.services.Status.OK) {
              displayMarker(new kakao.maps.LatLng(data[0].y, data[0].x));
            } else {
              geocoder.addressSearch(keyword, function(result, status2) {
                if (status2 === kakao.maps.services.Status.OK) {
                  displayMarker(new kakao.maps.LatLng(result[0].y, result[0].x));
                }
              });
            }
          });
        });
      </script>
    </body>
    </html>
  `;
};

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { token, user, addMyReview } = useApp();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 리뷰 관련 상태
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myReview, setMyReview] = useState<ApiReview | null>(null);

  // 작성 폼 상태
  const [myRating, setMyRating] = useState(0);
  const [myContent, setMyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await apiGetEventById(id as string);
        setEvent(data);
      } catch {
        // 에러 무시, event=null 유지
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await apiGetEventReviews(id as string);
        const all = data.reviews ?? [];
        setAvgRating(data.avg_rating ?? 0);

        // 내 리뷰는 상단 고정, 나머지는 아래
        if (user) {
          const mine = all.find((r) => r.user_name === user.name) ?? null;
          setMyReview(mine);
          setReviews(all.filter((r) => r.user_name !== user.name));
        } else {
          setReviews(all);
        }
      } catch {
        // 서버 오류 시 빈 목록 유지
      } finally {
        setReviewsLoading(false);
      }
    })();
  }, [id, user]);

  // [웹 전용] 위치 정보 카카오 지도 렌더링
  useEffect(() => {
    if (Platform.OS !== 'web' || !event?.location) return;

    const scriptId = 'kakao-map-script-detail';

    const drawMap = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('kakaomap-detail');
        if (!container) return;

        const map = new window.kakao.maps.Map(container, { center: new window.kakao.maps.LatLng(37.5665, 126.9780), level: 3 });
        const ps = new window.kakao.maps.services.Places();
        const geocoder = new window.kakao.maps.services.Geocoder();
        const keyword = event.location.replace(/["'\r\n]/g, ' ').trim();

        const displayMarker = (locPosition: any) => {
          const marker = new window.kakao.maps.Marker({ map, position: locPosition });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:black;font-weight:bold;text-align:center;white-space:nowrap;cursor:pointer;">${keyword}<br/><span style="color:#007AFF; font-size:10px;">클릭하여 길찾기👆</span></div>`
          });
          infowindow.open(map, marker);
          map.setCenter(locPosition);

          window.kakao.maps.event.addListener(marker, 'click', () => {
            window.open(`https://map.kakao.com/link/search/${encodeURIComponent(keyword)}`, '_blank');
          });
        };

        ps.keywordSearch(keyword, (data: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            displayMarker(new window.kakao.maps.LatLng(data[0].y, data[0].x));
          } else {
            geocoder.addressSearch(keyword, (result: any, status2: any) => {
              if (status2 === window.kakao.maps.services.Status.OK) {
                displayMarker(new window.kakao.maps.LatLng(result[0].y, result[0].x));
              }
            });
          }
        });
      });
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);
      script.onload = () => drawMap();
    } else {
      drawMap();
    }
  }, [event?.location]);

  const submitReview = async () => {
    if (!token || myRating === 0 || !myContent.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiPostReview(token, id as string, myRating, myContent.trim());
      const now = new Date().toISOString();
      const newReview: ApiReview = {
        user_name: user?.name ?? '나',
        rating: myRating,
        content: myContent.trim(),
        created_at: now,
      };
      setMyReview(newReview);
      addMyReview({
        eventId: String(id),
        eventTitle: event?.title ?? '',
        rating: myRating,
        content: myContent.trim(),
        created_at: now,
      });
      setMyContent('');
      setMyRating(0);
    } catch (e: any) {
      setSubmitError(e?.message ?? '리뷰 작성에 실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  // 인터파크 티켓 검색으로 연결 (행사명 기준 검색)
  const interparkUrl = `https://tickets.interpark.com/contents/search?keyword=${encodeURIComponent(event?.title ?? '')}`;

  const openHomepage = () => {
    Linking.openURL(interparkUrl);
  };

  const handleBooking = async () => {
    if (token) {
      try {
        await apiCheckin(token, Number(event.id), 'ticket');
      } catch {
        // 이미 체크인했거나 서버 오류 - 무시하고 예매 페이지로 이동
      }
    }
    Linking.openURL(interparkUrl);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>데이터를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 상단 바 */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{event.title}</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: event.poster }} style={styles.poster} />

        <View style={{ padding: spacing.lg }}>
          <Text style={styles.category}>{event.category}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.star} />
            <Text style={styles.ratingText}>{avgRating > 0 ? avgRating.toFixed(1) : '-'}</Text>
            <Text style={styles.reviewCount}>({reviews.length + (myReview ? 1 : 0)}개 리뷰)</Text>
          </View>

          {/* 공연 정보 */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>공연 정보</Text>
            <InfoRow icon="calendar-outline" text={`${event.start_date} ~ ${event.end_date}`} />
            <InfoRow icon="location-outline" text={`${event.location}, ${event.city}`} />
            <InfoRow icon="card-outline" text={`${event.min_price}원 ~ ${event.max_price}원`} />
            <Pressable style={styles.homepage} onPress={openHomepage}>
              <Text style={styles.homepageText}>공식 홈페이지 바로가기</Text>
            </Pressable>
          </View>

          {/* 리뷰 */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>리뷰</Text>

            {/* 내 리뷰 상단 고정 */}
            {myReview && (
              <View style={[styles.review, styles.myReview]}>
                <View style={styles.reviewHead}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="person-circle" size={16} color={colors.primary} />
                    <Text style={[styles.reviewNick, { color: colors.primary }]}>내 리뷰</Text>
                  </View>
                  <StarRow rating={myReview.rating} />
                </View>
                <Text style={styles.reviewText}>{myReview.content}</Text>
              </View>
            )}

            {/* 리뷰 작성 폼 */}
            {!myReview && (
              token ? (
                <View style={styles.writeBox}>
                  <Text style={styles.writeTitle}>리뷰 작성하기</Text>
                  <View style={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Pressable key={s} hitSlop={6} onPress={() => setMyRating(s)}>
                        <Ionicons
                          name={s <= myRating ? 'star' : 'star-outline'}
                          size={28}
                          color={s <= myRating ? colors.star : colors.border}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="관람 후기를 남겨주세요."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    value={myContent}
                    onChangeText={setMyContent}
                  />
                  {submitError && (
                    <Text style={styles.errorText}>{submitError}</Text>
                  )}
                  <Pressable
                    style={[styles.submitBtn, (myRating === 0 || !myContent.trim() || submitting) && styles.submitBtnDisabled]}
                    disabled={myRating === 0 || !myContent.trim() || submitting}
                    onPress={submitReview}
                  >
                    {submitting
                      ? <ActivityIndicator size="small" color={colors.white} />
                      : <Text style={styles.submitText}>등록</Text>
                    }
                  </Pressable>
                </View>
              ) : (
                <View style={styles.loginPrompt}>
                  <Text style={styles.loginPromptText}>로그인하면 리뷰를 작성할 수 있어요.</Text>
                </View>
              )
            )}

            {/* 다른 사람 리뷰 */}
            {reviewsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing.md }} />
            ) : reviews.length === 0 && !myReview ? (
              <Text style={styles.emptyReview}>아직 리뷰가 없어요. 첫 번째 리뷰를 남겨보세요!</Text>
            ) : (
              reviews.map((r, i) => (
                <View key={i} style={styles.review}>
                  <View style={styles.reviewHead}>
                    <Text style={styles.reviewNick}>{r.user_name}</Text>
                    <StarRow rating={r.rating} />
                  </View>
                  <Text style={styles.reviewText}>{r.content}</Text>
                  {r.created_at && (
                    <Text style={styles.reviewDate}>{r.created_at.split('T')[0]}</Text>
                  )}
                </View>
              ))
            )}
          </View>

          {/* 위치 정보 */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>위치 정보</Text>
            <View style={{ height: 300, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface }}>
              {Platform.OS === 'web' ? (
                <View nativeID="kakaomap-detail" style={{ width: '100%', height: '100%' }} />
              ) : (
                <WebView
                  originWhitelist={['*']}
                  source={{
                    html: getDetailMapHtml(event?.location || ''),
                    baseUrl: MAP_BASE_URL,
                  }}
                  onMessage={(e) => {
                    const clickedKeyword = e.nativeEvent.data;
                    if (clickedKeyword) {
                      Linking.openURL(`https://map.kakao.com/link/search/${encodeURIComponent(clickedKeyword)}`);
                    }
                  }}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 예매 버튼 */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <Pressable style={styles.bookBtn} onPress={handleBooking}>
          <Text style={styles.bookText}>
            예매하기 · {(event.min_price ?? 0).toLocaleString()}원
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSub} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name="star" size={12} color={i < rating ? colors.star : colors.border} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  topTitle: { flex: 1, fontSize: font.subtitle, fontWeight: '700', color: colors.text },

  poster: { width: '100%', height: 240, backgroundColor: colors.surface },
  category: { fontSize: font.body, color: colors.primary, fontWeight: '700' },
  title: { fontSize: font.h2, fontWeight: '800', color: colors.text, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  ratingText: { fontSize: font.body, fontWeight: '700', color: colors.text },
  reviewCount: { fontSize: font.caption, color: colors.textSub },

  block: { marginTop: spacing.xl },
  blockTitle: { fontSize: font.title, fontWeight: '800', color: colors.text, marginBottom: spacing.md },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  infoText: { fontSize: font.body, color: colors.text, flex: 1 },
  homepage: { marginTop: spacing.sm },
  homepageText: { color: colors.primary, fontWeight: '600', fontSize: font.body },

  // 리뷰
  review: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  myReview: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewNick: { fontSize: font.body, fontWeight: '700', color: colors.text },
  reviewText: { fontSize: font.body, color: colors.textSub, lineHeight: 19 },
  reviewDate: { fontSize: font.caption, color: colors.textMuted, marginTop: 4 },
  emptyReview: { color: colors.textSub, textAlign: 'center', paddingVertical: spacing.lg },

  // 작성 폼
  writeBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  writeTitle: { fontSize: font.body, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  starPicker: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.body,
    color: colors.text,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  errorText: { color: colors.danger, fontSize: font.caption, marginTop: spacing.sm },
  submitBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: colors.border },
  submitText: { color: colors.white, fontWeight: '700', fontSize: font.body },

  loginPrompt: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  loginPromptText: { fontSize: font.body, color: colors.textSub },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.card,
  },
  bookBtn: { height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  bookText: { color: colors.white, fontWeight: '700', fontSize: font.subtitle },
});
