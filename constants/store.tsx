import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cultureItems as seed, type CultureItem } from '@/data/mock';
import { apiLogin, apiSignup, apiGetMe, apiSetPreferences, apiDeleteAccount, apiGetSchedules, apiAddSchedule, apiDeleteSchedule, type ApiUser, type ApiSchedule } from '@/services/api';
import { saveToken, getToken, deleteToken, saveOnboarded, getOnboarded, clearOnboarded, savePrefs, getPrefs, saveLikedEvents, getLikedEvents, saveMyReviews, getMyReviews } from '@/services/storage';
import type { DbCultureItem } from '@/components/CultureCard';

export type MyReviewEntry = {
  eventId: string;
  eventTitle: string;
  rating: number;
  content: string;
  created_at: string;
};

type AppState = {
  isInitializing: boolean;
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  token: string | null;
  user: ApiUser | null;
  prefs: string[];
  items: CultureItem[];

  // 찜 관련
  schedules: ApiSchedule[];
  likedIds: Set<string>;
  likedItems: DbCultureItem[];

  // 내 리뷰
  myReviews: MyReviewEntry[];
  addMyReview: (entry: MyReviewEntry) => void;

  // 액션
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  completeOnboarding: (prefs: string[]) => Promise<void>;
  updatePrefs: (prefs: string[]) => Promise<void>;
  toggleLike: (item: DbCultureItem) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setInitializing] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [hasOnboarded, setOnboarded] = useState(false);
  const [prefs, setPrefs] = useState<string[]>([]);
  const [items] = useState<CultureItem[]>(seed);
  const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
  const [likedCache, setLikedCache] = useState<DbCultureItem[]>([]);
  const [myReviews, setMyReviews] = useState<MyReviewEntry[]>([]);

  const likedIds = useMemo(
    () => new Set(likedCache.map((e) => String(e.id))),
    [likedCache]
  );

  // 앱 시작: 토큰 + 온보딩 + 찜 캐시 복원
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, onboarded, storedPrefs, cachedLiked, cachedReviews] = await Promise.all([
          getToken(),
          getOnboarded(),
          getPrefs(),
          getLikedEvents(),
          getMyReviews(),
        ]);
        setOnboarded(onboarded);
        setPrefs(storedPrefs);
        setLikedCache(cachedLiked as DbCultureItem[]);
        setMyReviews(cachedReviews as MyReviewEntry[]);

        if (storedToken) {
          try {
            const [me, schedData] = await Promise.all([
              apiGetMe(storedToken),
              apiGetSchedules(storedToken),
            ]);
            setToken(storedToken);
            setUser(me);
            setSchedules(schedData.schedules ?? []);
          } catch {
            await deleteToken();
          }
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await saveToken(res.token);
    const [me, schedData] = await Promise.all([
      apiGetMe(res.token),
      apiGetSchedules(res.token),
    ]);
    setToken(res.token);
    setUser(me);
    setSchedules(schedData.schedules ?? []);
  };

  const signup = async (email: string, password: string, name: string) => {
    await apiSignup(email, password, name);
    await login(email, password);
    // 새로 가입한 사용자는 관심사 설정(온보딩)을 다시 거치도록 초기화
    setPrefs([]);
    setOnboarded(false);
    await Promise.all([clearOnboarded(), savePrefs([])]);
  };

  const logout = async () => {
    await deleteToken();
    setToken(null);
    setUser(null);
    setSchedules([]);
  };

  // 회원 탈퇴: 서버 삭제 시도 후 로컬 데이터 전부 초기화
  const deleteAccount = async () => {
    if (token) {
      try {
        await apiDeleteAccount(token);
      } catch {
        // 백엔드에 탈퇴 엔드포인트가 아직 없어도 로컬에서는 탈퇴 처리
      }
    }
    await Promise.all([deleteToken(), clearOnboarded(), savePrefs([]), saveLikedEvents([]), saveMyReviews([])]);
    setToken(null);
    setUser(null);
    setSchedules([]);
    setLikedCache([]);
    setMyReviews([]);
    setPrefs([]);
    setOnboarded(false);
  };

  const completeOnboarding = async (selectedPrefs: string[]) => {
    setPrefs(selectedPrefs);
    setOnboarded(true);
    await Promise.all([saveOnboarded(), savePrefs(selectedPrefs)]);

    if (token) {
      try {
        await apiSetPreferences(token, selectedPrefs, []);
      } catch {}
    }
  };

  // 마이페이지 '관심사 재설정'에서 호출
  const updatePrefs = async (selectedPrefs: string[]) => {
    setPrefs(selectedPrefs);
    await savePrefs(selectedPrefs);

    if (token) {
      try {
        await apiSetPreferences(token, selectedPrefs, []);
      } catch {}
    }
  };

  const addMyReview = (entry: MyReviewEntry) => {
    setMyReviews((prev) => {
      const updated = [entry, ...prev.filter((r) => r.eventId !== entry.eventId)];
      saveMyReviews(updated);
      return updated;
    });
  };

  const toggleLike = (item: DbCultureItem) => {
    const id = String(item.id);
    const isLiked = likedCache.some((e) => String(e.id) === id);

    // 즉시 로컬 상태 업데이트
    const newCache = isLiked
      ? likedCache.filter((e) => String(e.id) !== id)
      : [...likedCache, item];
    setLikedCache(newCache);
    saveLikedEvents(newCache);

    // 로그인 시 서버 동기화
    if (token) {
      if (isLiked) {
        const schedule = schedules.find((s) => String(s.event_id) === id);
        if (schedule) {
          setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
          apiDeleteSchedule(token, schedule.id).catch(() => {
            // 실패 시 롤백
            setLikedCache((prev) => [...prev, item]);
          });
        }
      } else {
        apiAddSchedule(token, Number(item.id))
          .then(async () => {
            const data = await apiGetSchedules(token);
            setSchedules(data.schedules ?? []);
          })
          .catch(() => {
            setLikedCache((prev) => prev.filter((e) => String(e.id) !== id));
          });
      }
    }
  };

  const value = useMemo<AppState>(
    () => ({
      isInitializing,
      isLoggedIn: !!token,
      hasOnboarded,
      token,
      user,
      prefs,
      items,
      schedules,
      likedIds,
      likedItems: likedCache,
      myReviews,
      addMyReview,
      login,
      signup,
      logout,
      deleteAccount,
      completeOnboarding,
      updatePrefs,
      toggleLike,
    }),
    [isInitializing, token, user, hasOnboarded, prefs, items, schedules, likedCache, likedIds, myReviews]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
