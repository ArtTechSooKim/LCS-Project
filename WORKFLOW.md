# 개발 워크플로우 보고서 (문화생활 / Culture54)

모바일컴퓨팅 기말 프로젝트 — 기획부터 배포까지 전체 개발 과정을 정리한 보고서입니다.

- **프론트엔드**: 본 저장소 (`culture-app-main`, Expo SDK 54)
- **백엔드**: https://github.com/ArtTechSooKim/lcs-backend (Express + MySQL, Railway 배포)
- **웹 데모**: https://distweb-rosy.vercel.app
- **APK**: https://expo.dev/accounts/sookimarttechs-team/projects/culture54/builds/9fb28fb6-3899-4904-9ef8-aa3df0076e1c

---

## 1. 프로젝트 기획

### 1.1 배경 및 목표
바쁜 일상 속에서 문화생활(공연, 전시, 영화, 무용, 클래식, 국악 등)을 챙기기 어렵다는
문제에서 출발했습니다. "내 위치 주변에서 지금 무엇을 볼 수 있는지", "내가 얼마나
다양한 문화생활을 즐기고 있는지"를 한눈에 보여주고, 게이미피케이션(문화 스코어, 뱃지,
루틴)으로 꾸준한 참여를 유도하는 앱을 목표로 했습니다.

### 1.2 핵심 사용자 시나리오
1. 앱을 처음 실행하면 관심 카테고리(3개 이상)를 선택하는 온보딩을 거친다.
2. 홈에서 맞춤 추천 피드를 보고, 탐색에서 카테고리/지역/날짜로 필터링한다.
3. 지도에서 내 주변 5km 내 문화 행사를 확인하고 길찾기로 이동한다.
4. 상세 화면에서 예약하거나, 관람 후 체크인하고 리뷰를 남긴다.
5. 마이페이지에서 누적 문화 스코어와 진단 결과를 확인하고, 루틴을 설정해 꾸준히 이용한다.

### 1.3 카테고리 정의
전체, 뮤지컬, 연극, 서양음악(클래식), 무용(서양/한국무용), 서커스/마술, 대중음악,
한국음악(국악), 영화, 복합 — 총 10개 카테고리로 모든 추천/필터/스코어 산정의 기준이
됩니다. (`data/mock.ts`)

---

## 2. 기술 스택 선정

| 영역 | 선택 | 선정 이유 |
|---|---|---|
| 모바일 프레임워크 | Expo SDK 54 (React Native 0.81, React 19) | iOS/Android/Web을 단일 코드베이스로 동시 지원, Expo Go로 빠른 팀 공유 |
| 라우팅 | Expo Router 6 (typed routes) | 파일 기반 라우팅으로 화면 구조와 디렉토리 구조 일치, 탭/스택 네비게이션 내장 |
| 상태관리 | React Context (`constants/store.tsx`) | 화면 수가 많지 않아 Redux 등 대형 라이브러리 없이도 충분, AsyncStorage/SecureStore와 결합해 로그인·온보딩·찜 상태 영속화 |
| 백엔드 | Express + MySQL | 팀의 기존 SQL 경험 활용, JWT 기반 인증 구조 단순화 |
| 배포(백엔드) | Railway | GitHub push 시 자동 배포, MySQL 인스턴스 함께 호스팅 |
| 지도 | Kakao Maps JS SDK | 국내 문화시설 검색·길찾기 정확도, 무료 티어로 충분 |
| 빌드/배포(앱) | EAS Build | Expo 관리형 워크플로우에서 네이티브 빌드 없이 APK 생성 |
| 배포(웹) | Vercel | `expo export -p web` 정적 산출물을 무료로 즉시 배포, HTTPS 기본 제공 |

---

## 3. 프론트엔드 개발 과정

### 3.1 초기 설정
- `npx create-expo-app`으로 SDK 54 프로젝트 생성, `app.json`에 앱 이름("문화생활"),
  패키지명(`com.sookimarttechs.culture54`), 위치 권한 문구
  ("주변 문화생활을 보여드리기 위해 위치 정보가 필요해요.") 등을 설정.
- Expo Router로 파일 기반 라우팅 구조를 설계하고, 디자인 토큰(`constants/theme.ts`)을
  먼저 정의해 색상/여백/타이포를 전 화면에서 통일.

### 3.2 화면 구조 설계
- 루트 `_layout.tsx`에서 전역 Provider(로그인/온보딩/찜 등 상태)를 주입.
- `app/index.tsx`에서 온보딩 완료 여부를 확인해 `/onboarding` 또는 `(tabs)`로 분기.
- 하단 탭 4개(`(tabs)/_layout.tsx`): 홈 / 탐색 / 캘린더 / 마이페이지.
- 상세, 지도, 일정, 루틴, 문의, 스코어/진단, 알림, 설정 등 모달성 화면은 스택 라우트로 구성.

### 3.3 온보딩 및 전역 상태
- `app/onboarding/preferences.tsx`: 10개 카테고리 중 3개 이상 선택해야 다음 단계 진행
  (`canNext = selected.length >= 3`), 선택 결과를 `completeOnboarding(selected)`로
  전역 상태에 저장 후 `(tabs)`로 이동.
- `constants/store.tsx`: `isLoggedIn`, `token`, `user`, `prefs`, `likedIds`,
  `myReviews`, `schedules` 등을 관리하고 `login`/`logout`/`signup`/`deleteAccount`/
  `toggleLike`/`addMyReview` 등의 액션을 제공. 로그인 토큰은 SecureStore, 그 외
  캐시는 AsyncStorage에 저장해 앱 재시작 후에도 유지.

### 3.4 화면별 기능 구현 (요약)
- **홈**: `/feed` API로 맞춤 추천을 받아오고, 실시간 문화 스코어를 카드로 노출.
- **탐색**: 카테고리/지역/날짜/가격/실내외 필터 조합으로 `/events` 검색.
- **지도**: 처음에는 Expo Go 제약으로 진입 버튼만 존재했으나, 이후 Kakao Maps JS SDK
  기반으로 정식 구현 (3.5 참고).
- **상세**: 행사 정보 + 예약 연동(인터파크/홈페이지) + 체크인(GPS/티켓/수동) + 리뷰
  작성/조회 + 좋아요(찜) 토글, 공연장 위치를 Kakao Maps로 안내.
- **캘린더**: `react-native-calendars`로 예약/관람 일정을 달력 뷰로 표시.
- **예약 내역(`/schedules`)**: 목록에서 항목을 누르면 해당 행사 상세로 이동하도록 연결.
- **마이페이지**: 프로필, 찜 목록, 서버 `/users/score` 연동 실시간 문화 스코어, 환경설정.
- **스코어/진단**: 방문 카테고리 기반 점수·등급·레이더 차트와 미방문 카테고리 추천.
- **루틴**: 요일/주기 설정 후 저장 시 안내 팝업으로 피드백.
- **1:1 문의**: 문의 유형 선택 + 내용 작성 → 접수 완료 팝업.
- 공통 컴포넌트: `CultureCard`, `SectionHeader`, `ScoreGauge`, 그리고 안내/확인용
  `InfoModal`/`ConfirmModal`을 만들어 여러 화면에서 재사용.

### 3.5 지도 기능 (Kakao Maps) 통합
- 초기 계획이었던 `react-native-maps`는 Expo Go에서 동작하지 않아(development build
  필요) 보류했던 항목이었음.
- 최종적으로 Kakao Maps **JS SDK**로 전환: 웹에서는 `<script>` 태그로 SDK를 직접
  주입하고, 네이티브(iOS/Android)에서는 동일한 HTML/JS를 `react-native-webview`에
  로드해 플랫폼 간 일관된 지도 경험을 구현.
- `/map` 화면에서 `expo-location`으로 현재 위치(`Accuracy.High`)를 가져와 반경 5km
  내 행사를 마커로 표시, 마커 클릭 시 카카오맵 길찾기로 연결, "내 위치로" 버튼으로
  지도를 재중심.

### 3.6 위치 권한 / 정확도 디버깅
- 위치 권한이 거부되거나 브라우저가 비-HTTPS(insecure origin)인 경우 Geolocation API
  자체가 차단되어 "위치 권한이 없어 서울 중심 기준으로 보여드려요"로 폴백되는 현상을
  확인.
- `Location.Accuracy.Balanced` → `Location.Accuracy.High`로 변경해 정확도를 높였고,
  HTTPS로 배포된 웹 데모(Vercel)에서는 위치 권한 프롬프트가 정상적으로 표시됨을 확인.

### 3.7 백엔드 연동 (mock → 실제 API)
- 개발 초기에는 `data/mock.ts`의 더미 데이터로 모든 화면이 동작하도록 구현 →
  화면/흐름을 먼저 완성한 뒤 백엔드 API로 교체하는 순서로 진행.
- `services/api.ts`에 axios 기반 API 클라이언트를 구성하고, JWT 토큰을 헤더에
  부착. 주요 함수: `apiSignup`, `apiLogin`, `apiGetMe`, `apiDeleteAccount`,
  `apiSetPreferences`, `apiGetEvents`, `apiGetNearbyEvents`, `apiGetEventById`,
  `apiGetEventReviews`, `apiPostReview`, `apiGetScore`, `apiPostScoreGuest`,
  `apiGetFeed`, `apiCheckin`, `apiGetSchedules`, `apiAddSchedule`,
  `apiDeleteSchedule`, `apiGetStats`, `apiGetReport`, `apiGetPoints`,
  `apiGetBadges`, `apiGetNearbyCourses`.
- 네트워크 오류/미연동 상황에서는 `data/mock.ts`를 폴백으로 사용하도록 처리해
  백엔드 장애 시에도 화면이 비지 않도록 함.

---

## 4. 백엔드 개발 과정 (lcs-backend)

- **구조**: Express 라우터 + MySQL(원격 DB), bcrypt로 비밀번호 해시, JWT로 인증
  토큰 발급/검증.
- **DB**: 사용자, 행사(이벤트), 리뷰, 체크인, 일정, 스코어/뱃지/포인트 등을 컬럼으로
  관리. 영화 카테고리는 19세 이상 등급 행사를 별도 필터링하는 로직 포함.
- **주요 엔드포인트**: `/auth/signup`, `/auth/login`, `/users/me`,
  `/users/preferences`, `/events`, `/events/nearby`, `/events/:id`,
  `/events/:id/review`, `/feed`, `/checkin`, `/schedules`, `/users/score`,
  `/users/stats`, `/users/report`, `/users/points`, `/users/badges`,
  `/courses/nearby`.
- **배포(Railway)**: GitHub 저장소(`ArtTechSooKim/lcs-backend`)에 push하면 Railway가
  자동으로 빌드/배포. 운영 URL: `https://lcs-backend-production.up.railway.app`.
  MySQL도 Railway에서 함께 호스팅.

---

## 5. 테스트 및 검증

- **Metro 번들 검증**: SDK 54로 마이그레이션 후 `npx expo start`로 번들이 정상
  생성되는지 확인 (의존성 버전 충돌 여부 점검).
- **Expo Go 실기기 테스트**: QR 코드를 스캔해 iOS/Android 실기기에서 전체 플로우
  (온보딩 → 홈 → 탐색 → 지도 → 상세 → 체크인/리뷰 → 마이페이지)를 직접 점검.
- **LAN 환경 테스트**: `npx expo start --web`으로 PC에서 실행 후, 같은 와이파이의
  휴대폰에서 `http://<PC LAN IP>:8081`로 접속해 반응형 UI 확인. (Node.js 방화벽
  인바운드 허용 필요)
- **위치 권한 테스트**: localhost/HTTPS 환경에서는 위치 권한 프롬프트 및 주변 행사
  표시가 정상 동작, 비-HTTPS LAN 접속에서는 브라우저 정책상 위치 API가 차단되어
  서울 중심 폴백이 뜨는 것을 확인하고 문서화.

---

## 6. 배포

### 6.1 웹 데모 (Vercel)
1. `npx expo export -p web --output-dir dist_web` 로 정적 산출물 생성.
2. 산출물의 `assets/node_modules` 경로가 `.gitignore`/Vercel 업로드에서 제외되어
   아이콘 폰트가 깨지는 문제를 발견 → `assets/vendor_modules`로 이름 변경 후
   `_expo/static/js/web/entry-*.js` 내 경로 문자열을 일괄 치환.
3. `vercel.json`에 `{"cleanUrls": true, "trailingSlash": false}` 추가.
4. `npx vercel deploy dist_web --prod --yes`로 배포, 이후 변경사항은 새 산출물
   디렉토리로 export 후 `vercel alias set`으로 기존 도메인(`distweb-rosy.vercel.app`)에
   연결.
5. 결과: `/detail/[id]` 같은 동적 라우트는 정적 export 특성상 직접 새로고침 시 404가
   발생하지만, 앱 내 클릭 네비게이션은 정상 동작.

### 6.2 안드로이드 APK (EAS Build)
1. `app.json`에 `expo.owner`, `expo.android.package`, EAS `projectId` 설정.
2. `eas.json`의 `preview` 프로필(`distribution: internal`, `android.buildType: apk`)로
   `npx eas-cli build -p android --profile preview --non-interactive` 실행.
3. 빌드 완료 후 expo.dev 빌드 페이지 링크로 APK 설치(QR 또는 링크 클릭).

### 6.3 발표 자료
- 웹 데모 URL을 QR 코드(`qr-distweb.png`)로 변환해 발표 슬라이드에 삽입 → 발표 중
  관객이 직접 스캔해 웹 데모를 체험할 수 있도록 구성. HTTPS이므로 위치 권한 기반
  지도 기능까지 정상 동작.

---

## 7. 한계 및 향후 개선 방향

- 정적 웹 export의 동적 라우트 새로고침 404 → SSR/CSR 라우팅 전환 또는 Vercel
  rewrite 규칙 추가로 해결 가능.
- 지도 마커가 많아질 경우 클러스터링 미적용 → 성능 개선 여지.
- 푸시 알림은 현재 인앱 알림 목록 수준 → Expo Notifications 연동으로 실제 푸시
  확장 가능.
- 문화 스코어 산정 로직을 카테고리 단순 카운트에서 빈도/최신성 가중치 방식으로
  고도화 가능.
