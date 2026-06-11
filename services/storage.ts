import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'lcs_auth_token';
const ONBOARDED_KEY = 'lcs_has_onboarded';

// 웹은 SecureStore 미지원 → localStorage 폴백
const isWeb = Platform.OS === 'web';

async function set(key: string, value: string) {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function get(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function remove(key: string) {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveToken(token: string) {
  await set(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return get(TOKEN_KEY);
}

export async function deleteToken() {
  await remove(TOKEN_KEY);
}

export async function saveOnboarded() {
  await set(ONBOARDED_KEY, '1');
}

export async function getOnboarded(): Promise<boolean> {
  const val = await get(ONBOARDED_KEY);
  return val === '1';
}

// 새 회원가입 시 온보딩(관심사 설정)을 다시 띄우기 위해 초기화
export async function clearOnboarded() {
  await remove(ONBOARDED_KEY);
}

const PREFS_KEY = 'lcs_prefs';

export async function savePrefs(prefs: string[]) {
  await set(PREFS_KEY, JSON.stringify(prefs));
}

export async function getPrefs(): Promise<string[]> {
  const raw = await get(PREFS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

const LIKED_KEY = 'lcs_liked_events';

export async function saveLikedEvents(events: unknown[]) {
  await set(LIKED_KEY, JSON.stringify(events));
}

export async function getLikedEvents(): Promise<unknown[]> {
  const raw = await get(LIKED_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

const MY_REVIEWS_KEY = 'lcs_my_reviews';

export async function saveMyReviews(reviews: unknown[]) {
  await set(MY_REVIEWS_KEY, JSON.stringify(reviews));
}

export async function getMyReviews(): Promise<unknown[]> {
  const raw = await get(MY_REVIEWS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export type RoutinePrefs = { days: string[]; freq: string };

const ROUTINE_KEY = 'lcs_routine';

export async function saveRoutine(routine: RoutinePrefs) {
  await set(ROUTINE_KEY, JSON.stringify(routine));
}

export async function getRoutine(): Promise<RoutinePrefs | null> {
  const raw = await get(ROUTINE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
