// 백엔드 API 연동 모듈
// 서버: https://lcs-backend-production.up.railway.app

export const BASE_URL = 'https://lcs-backend-production.up.railway.app';

// ─────────────────────────────────────────────
// 백엔드 응답 타입 정의
// ─────────────────────────────────────────────

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type ApiEvent = {
  id: number;
  title: string;
  category: string;
  city: string | null;
  // 실제 DB 컬럼명 (lcs_db_events.sql 기준)
  location: string | null;       // 공연장명
  lat: number | null;
  lng: number | null;
  start_date: string | null;     // YYYYMMDD 형식
  end_date: string | null;       // YYYYMMDD 형식
  min_price: number | null;
  max_price: number | null;
  poster: string | null;         // 포스터 이미지 URL
  price_text: string | null;     // 가격 텍스트 설명
  genre: string | null;
  source: string | null;
  api_id: string | null;
  distance_km?: number;
};

export type ApiReview = {
  user_name: string;
  rating: number;
  content: string;
  created_at?: string;
};

export type ApiScore = {
  score: number;
  grade: string;
  visited_categories: string[];
  missing_categories: string[];
  radar: { category: string; count: number; visited: boolean }[];
  message: string;
};

export type ApiStats = {
  total_visits: number;
  total_points: number;
  lcs_score: number;
  lcs_grade: string;
  by_category: { category: string; count: number }[];
  by_month: { month: string; count: number }[];
};

export type ApiSchedule = {
  id: number;
  event_id: number;
  title: string;
  date_start: string;
  booking_url: string | null;
  notify_before: number;
};

export type ApiBadge = {
  badge_code: string;
  name: string;
  description: string;
  earned_at: string;
};

export type ApiPointHistory = {
  points: number;
  reason: string;
  created_at: string;
};

export type ApiCheckinResult = {
  message: string;
  total_points: number;
  new_badges: { code: string; name: string; description: string }[];
};

// ─────────────────────────────────────────────
// 공통 fetch 래퍼
// ─────────────────────────────────────────────

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  token?: string | null;
};

async function apiCall<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // 15초 안에 응답이 없으면 중단 (서버가 잠들어 있을 때 무한 대기 방지)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timeout);
    // fetch 자체가 실패 = 서버에 닿지 못함 (서버 다운/슬립, 인터넷, 잘못된 주소 등)
    if (e?.name === 'AbortError') {
      throw new Error('서버 응답이 너무 느려요. 서버가 켜져 있는지 확인 후 다시 시도해주세요.');
    }
    throw new Error('서버에 연결할 수 없어요. 인터넷 연결과 백엔드 서버 상태를 확인해주세요.');
  }
  clearTimeout(timeout);

  // 서버가 JSON이 아닌 응답(예: 502 HTML 페이지)을 줄 수도 있어 안전하게 파싱
  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error ?? `서버 오류 (${res.status})`);
  }

  return data as T;
}

// ─────────────────────────────────────────────
// 1. 인증 (Auth)
// ─────────────────────────────────────────────

export async function apiSignup(email: string, password: string, name: string) {
  return apiCall<{ message: string; userId: number }>('/auth/signup', {
    method: 'POST',
    body: { email, password, name },
  });
}

export async function apiLogin(email: string, password: string) {
  return apiCall<{ message: string; token: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function apiGetMe(token: string) {
  return apiCall<ApiUser>('/auth/me', { token });
}

// 회원 탈퇴 (백엔드에 DELETE /auth/me 엔드포인트 필요 — 동우님 확인)
// 엔드포인트가 아직 없어도 앱에서는 로컬 데이터를 지우고 로그아웃 처리됩니다.
export async function apiDeleteAccount(token: string) {
  return apiCall<{ message: string }>('/auth/me', { method: 'DELETE', token });
}

// hours(0~23 배열) → 백엔드 preferred_time 문자열 변환
function hoursToPreferredTime(hours: number[]): string {
  if (hours.length === 0) return 'evening';
  const morning = hours.filter((h) => h >= 6 && h < 12).length;
  const afternoon = hours.filter((h) => h >= 12 && h < 18).length;
  const evening = hours.filter((h) => h >= 18 || h < 6).length;
  if (morning >= afternoon && morning >= evening) return 'morning';
  if (afternoon >= morning && afternoon >= evening) return 'afternoon';
  return 'evening';
}

export async function apiSetPreferences(
  token: string,
  categories: string[],
  prefTimes: number[]
) {
  return apiCall<{ message: string }>('/auth/preferences', {
    method: 'PUT',
    token,
    body: {
      categories,
      preferred_time: hoursToPreferredTime(prefTimes),
    },
  });
}

// ─────────────────────────────────────────────
// 2. 행사 (Events)
// ─────────────────────────────────────────────

type EventFilter = {
  category?: string;
  city?: string;
  date?: string;
  price_max?: number;
  indoor?: boolean;
};

export async function apiGetEvents(filter: EventFilter = {}) {
  const params = new URLSearchParams();
  if (filter.category) params.set('category', filter.category);
  if (filter.city) params.set('city', filter.city);
  if (filter.date) params.set('date', filter.date);
  if (filter.price_max !== undefined) params.set('price_max', String(filter.price_max));
  if (filter.indoor !== undefined) params.set('indoor', String(filter.indoor));

  const qs = params.toString();
  return apiCall<{ count: number; events: ApiEvent[] }>(`/events${qs ? `?${qs}` : ''}`);
}

export async function apiGetNearbyEvents(lat: number, lng: number, radius = 5, category?: string) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radius) });
  if (category) params.set('category', category);
  return apiCall<{ count: number; radius_km: number; events: ApiEvent[] }>(
    `/events/nearby?${params.toString()}`
  );
}

export async function apiGetEventById(id: string | number) {
  return apiCall<ApiEvent>(`/events/${id}`);
}

export async function apiGetEventReviews(id: string | number) {
  return apiCall<{ count: number; avg_rating: number; reviews: ApiReview[] }>(
    `/events/${id}/reviews`
  );
}

export async function apiPostReview(token: string, eventId: string | number, rating: number, content: string) {
  return apiCall<{ message: string; total_points: number; new_badges: unknown[] }>(
    `/events/${eventId}/review`,
    { method: 'POST', token, body: { rating, content } }
  );
}

// ─────────────────────────────────────────────
// 3. LCS 점수
// ─────────────────────────────────────────────

export async function apiGetScore(token: string) {
  return apiCall<ApiScore>('/users/score', { token });
}

export async function apiPostScoreGuest(name: string, visited_categories: string[]) {
  return apiCall<ApiScore>('/users/score', {
    method: 'POST',
    body: { name, visited_categories },
  });
}

// ─────────────────────────────────────────────
// 4. 맞춤 피드
// ─────────────────────────────────────────────

export async function apiGetFeed(token: string, lat?: number, lng?: number) {
  const params = new URLSearchParams();
  if (lat !== undefined) params.set('lat', String(lat));
  if (lng !== undefined) params.set('lng', String(lng));
  const qs = params.toString();
  return apiCall<{ count: number; missing_categories: string[]; feed: ApiEvent[] }>(
    `/feed${qs ? `?${qs}` : ''}`,
    { token }
  );
}

// ─────────────────────────────────────────────
// 5. 체크인
// ─────────────────────────────────────────────

export async function apiCheckin(token: string, eventId: number, method: 'gps' | 'ticket' | 'manual' = 'manual') {
  return apiCall<ApiCheckinResult>('/checkin', {
    method: 'POST',
    token,
    body: { event_id: eventId, method },
  });
}

// ─────────────────────────────────────────────
// 6. 일정 (Schedules)
// ─────────────────────────────────────────────

export async function apiGetSchedules(token: string) {
  return apiCall<{ count: number; schedules: ApiSchedule[] }>('/schedules', { token });
}

export async function apiAddSchedule(token: string, eventId: number, notifyBefore = 60) {
  return apiCall<{ message: string; event: ApiEvent }>('/schedules', {
    method: 'POST',
    token,
    body: { event_id: eventId, notify_before: notifyBefore },
  });
}

export async function apiDeleteSchedule(token: string, scheduleId: number) {
  return apiCall<{ message: string }>(`/schedules/${scheduleId}`, {
    method: 'DELETE',
    token,
  });
}

// ─────────────────────────────────────────────
// 7. 유저 통계 / 리포트 / 포인트 / 배지
// ─────────────────────────────────────────────

export async function apiGetStats(token: string) {
  return apiCall<ApiStats>('/users/stats', { token });
}

export async function apiGetReport(token: string) {
  return apiCall<{
    summary: { score: number; grade: string; total_visits: number; missing_categories: string[] };
    visit_log: { title: string; category: string; city: string; checked_at: string }[];
    badges: { code: string; name: string }[];
  }>('/users/report', { token });
}

export async function apiGetPoints(token: string) {
  return apiCall<{ total_points: number; history: ApiPointHistory[] }>('/users/points', { token });
}

export async function apiGetBadges(token: string) {
  return apiCall<{ count: number; badges: ApiBadge[] }>('/users/badges', { token });
}

// ─────────────────────────────────────────────
// 8. 코스 추천
// ─────────────────────────────────────────────

export async function apiGetNearbyCourses(lat: number, lng: number, radius = 3) {
  return apiCall<{
    culture_spots: ApiEvent[];
    food_spots: unknown[];
    cafe_spots: unknown[];
  }>(`/courses/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
}

// ─────────────────────────────────────────────
// 유틸: ApiEvent → CultureItem 변환 (UI 컴포넌트용)
// ─────────────────────────────────────────────

import type { CultureItem } from '@/data/mock';

// YYYYMMDD → YYYY-MM-DD 변환
function formatDate(d: string | null): string {
  if (!d) return '';
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return d;
}

export function toCultureItem(event: ApiEvent, liked = false): CultureItem {
  const start = formatDate(event.start_date);
  const end = formatDate(event.end_date);
  return {
    id: String(event.id),
    title: event.title,
    category: event.category,
    venue: event.location ?? '',
    address: event.city ?? '',
    period: start && end ? `${start} ~ ${end}` : start || '',
    time: '',
    phone: '',
    price: event.min_price ?? 0,
    rating: 0,
    reviewCount: 0,
    image: event.poster ?? '',
    cast: [],
    liked,
  };
}
