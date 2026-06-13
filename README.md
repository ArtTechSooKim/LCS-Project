# 문화생활 (Culture54)

> 모바일컴퓨팅 기말 프로젝트 — 내 주변 문화생활(공연/전시/영화 등)을 추천받고,
> 예약·관람 기록을 관리하며, 나만의 "문화 스코어"를 키워가는 모바일 앱

- **웹 데모**: https://distweb-rosy.vercel.app
- **안드로이드 APK**: [EAS 빌드 다운로드 링크](https://expo.dev/accounts/sookimarttechs-team/projects/culture54/builds/9fb28fb6-3899-4904-9ef8-aa3df0076e1c)
- **백엔드 저장소**: https://github.com/ArtTechSooKim/lcs-backend (Railway 자동 배포)
- **개발 워크플로우 보고서**: [WORKFLOW.md](./WORKFLOW.md)

웹 데모 QR 코드 (HTTPS — iOS/Android 브라우저에서 위치 권한까지 정상 동작):

![QR](./qr-distweb.png)

---

## 1. 프로젝트 개요

`문화생활`은 사용자의 관심사와 현재 위치를 기반으로 주변 문화 행사(영화, 연극, 뮤지컬,
전시, 무용, 클래식, 대중음악, 국악, 서커스/마술, 복합 등)를 추천하고, 예약 연동, 관람
인증(체크인), 리뷰, 루틴 관리, 문화 스코어/뱃지 등을 통해 사용자가 꾸준히 문화생활을
즐기도록 돕는 앱입니다.

- **프론트엔드**: Expo (React Native) — iOS / Android / Web 동시 지원
- **백엔드**: Express + MySQL (JWT 인증), Railway에 배포되어 GitHub push 시 자동 배포
- **지도**: Kakao Maps JS SDK (웹은 직접 스크립트 주입, 네이티브는 WebView)

## 2. 주요 기능

### 온보딩
- 관심 카테고리(3개 이상) 선택 → 맞춤 추천에 반영

### 홈 (`(tabs)/index`)
- 맞춤 피드 (`/feed`), 실시간 문화 스코어, 카테고리별 추천

### 탐색 (`(tabs)/search`)
- 카테고리/지역/날짜/가격/실내외 필터로 문화 행사 검색

### 주변 문화생활 지도 (`/map`)
- Kakao Maps 기반, 현재 위치(GPS, `Accuracy.High`) 반경 5km 내 행사 마커 표시
- 마커 클릭 시 카카오맵 길찾기로 연결
- "내 위치로" 버튼으로 지도 재중심

### 상세 (`/detail/[id]`)
- 행사 정보, 예약(인터파크 연동) / 홈페이지 이동, 체크인(GPS/티켓/수동)
- 리뷰 작성·조회, 좋아요(찜) 전역 동기화
- Kakao Maps로 공연장 위치 안내

### 캘린더 (`(tabs)/calendar`)
- 예약/관람 일정을 달력 뷰로 확인

### 예약·결제 내역 (`/schedules`)
- 예약 목록 확인, 항목 클릭 시 해당 행사 상세 페이지로 이동

### 마이페이지 (`(tabs)/mypage`)
- 프로필, 찜 목록, 실시간 문화 스코어(서버 `/users/score` 연동), 환경설정

### 문화 스코어 / 진단 (`/score`, `/diagnosis`)
- 방문 카테고리 기반 점수·등급·레이더 차트, 미방문 카테고리 추천

### 루틴 (`/routine`)
- 문화생활 요일/주기 설정 후 저장 → "루틴이 저장되었습니다" 안내

### 1:1 문의 (`/inquiry`)
- 문의 유형 선택 + 내용 작성 → 접수 완료 안내 팝업

### 알림 / 설정 (`/notifications`, `/settings`)
- 알림 목록, 로그인/로그아웃, 환경설정

## 3. 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Expo SDK 54, React Native 0.81, Expo Router 6 (typed routes, React Compiler) |
| 언어 | TypeScript |
| 상태관리 | React Context (`constants/store.tsx`) + AsyncStorage / SecureStore 캐싱 |
| 지도 | Kakao Maps JS SDK (`dapi.kakao.com`), 웹은 `<script>` 주입, 네이티브는 `react-native-webview` |
| 위치 | `expo-location` (`Accuracy.High`) |
| 통신 | `axios` → Express 백엔드(JWT 인증) |
| 백엔드 | Express + MySQL, Railway 배포 |
| 캘린더 | `react-native-calendars` |
| 배포(웹) | `expo export -p web` → Vercel (`distweb-rosy.vercel.app`) |
| 배포(앱) | EAS Build (Android APK, preview profile) |

## 4. 프로젝트 구조

```
app/                   화면(라우트) — Expo Router
  _layout.tsx          루트 레이아웃 + 전역 Provider
  index.tsx            진입점 (온보딩 완료 여부로 분기)
  onboarding/          온보딩 (관심 카테고리 선택)
  (tabs)/              하단 탭: 홈 / 탐색 / 캘린더 / 마이페이지
  detail/[id].tsx      문화 상세 (지도·예약·리뷰·체크인)
  map.tsx              주변 문화생활 지도
  schedules.tsx        예약·결제 내역
  routine.tsx          문화생활 루틴 설정
  inquiry.tsx          1:1 문의
  score.tsx, diagnosis.tsx  문화 스코어 / 진단
  notifications.tsx, settings.tsx, comments.tsx 등

components/            CultureCard, SectionHeader, ScoreGauge, InfoModal, ConfirmModal 등
constants/
  theme.ts             색상·여백·타이포 토큰
  store.tsx            로그인/온보딩/찜/스케줄 등 전역 상태 (Context)
services/
  api.ts               백엔드 API 클라이언트 (axios)
  storage.ts           로컬 저장(루틴 등)
data/mock.ts           초기 더미 데이터 (백엔드 연동 후 fallback)
```

## 5. 로컬 실행 방법

```bash
npm install
npx expo start          # QR 코드 -> Expo Go로 스캔
npx expo start --web    # 웹 브라우저(localhost:8081)
```

> Expo SDK 54 기준입니다. 자세한 변경사항은 https://docs.expo.dev/versions/v54.0.0/ 참고.

## 6. 배포

### 웹 데모 (Vercel)
```bash
npx expo export -p web --output-dir dist_web
# assets/node_modules -> assets/vendor_modules 리네임 + entry-*.js 경로 치환 (아이콘 폰트 404 방지)
npx vercel deploy dist_web --prod --yes
```
배포 URL: https://distweb-rosy.vercel.app
(동적 라우트 `/detail/[id]`는 정적 export 특성상 새로고침 시 404 — 앱 내 클릭 이동은 정상)

### 안드로이드 APK (EAS Build)
```bash
npx eas-cli build -p android --profile preview --non-interactive
```
빌드 결과: https://expo.dev/accounts/sookimarttechs-team/projects/culture54/builds/9fb28fb6-3899-4904-9ef8-aa3df0076e1c

## 7. 백엔드 (lcs-backend)

- 저장소: https://github.com/ArtTechSooKim/lcs-backend
- 배포: Railway (`https://lcs-backend-production.up.railway.app`), GitHub push 시 자동 배포
- 스택: Express + MySQL, JWT + bcrypt 인증
- 주요 엔드포인트: `/auth/*`, `/events`, `/events/nearby`, `/events/:id`, `/events/:id/review`,
  `/feed`, `/checkin`, `/schedules`, `/users/score`, `/users/stats`, `/users/report`,
  `/users/points`, `/users/badges`, `/courses/nearby`
