# 문화생활 앱 (Expo SDK 54 / React Native)

피그마 UX를 Expo Router로 구현한 프론트엔드입니다.
**App Store의 Expo Go가 현재 지원하는 SDK 54에 맞춰 만들었고, Metro 번들 검증까지 통과한 버전**입니다.
백엔드 연동 전까지 data/mock.ts 의 더미 데이터로 모든 화면이 동작합니다.

## 실행 방법

압축을 풀고, 생긴 폴더 안에서 터미널을 연 뒤:

    npm install
    npx expo start

- --fix, --legacy-peer-deps 같은 옵션 붙이지 마세요. npm install 만 하면 됩니다.
- 끝나면 QR 코드가 떠요. 폰의 Expo Go(App Store 최신 버전)로 스캔하면 실행됩니다.
- 폰과 컴퓨터가 같은 와이파이여야 합니다.

## 폴더 구조

    app/                 화면(라우트)
      _layout.tsx        루트 + 전역 상태 Provider
      index.tsx          진입점 (온보딩 완료 여부로 분기)
      onboarding/        온보딩 (취향 선택 -> 관람시간 선택)
      (tabs)/            하단 탭: 홈 / 탐색 / 캘린더 / 마이페이지
      detail/[id].tsx    문화 상세화면
      notifications.tsx  알림
      settings.tsx       환경설정
    components/          ScoreGauge, CultureCard, SectionHeader
    constants/
      theme.ts           색·여백·타이포 토큰 (피그마 확정 시 여기만 수정)
      store.tsx          로그인/온보딩/찜 상태 (React Context)
    data/mock.ts         더미 데이터 (-> 추후 API 응답으로 교체)

@/ 는 프로젝트 루트를 가리킵니다. 예: @/components/CultureCard.

## 백엔드 연동 시 (API 담당)

코드는 각자 본인 컴퓨터에서 VS Code 등으로 열어 수정합니다.
(Expo 사이트에 올리는 방식이 아니라, 그냥 코드 파일을 고치는 거예요.)

1. data/mock.ts 의 cultureItems, categories 등을 실제 API fetch 결과로 교체
2. constants/store.tsx 의 login / completeOnboarding 을 인증 API 호출로 교체

## 팀 협업 메모

zip을 주고받지 말고 GitHub에 올려서 같이 작업하길 권장합니다.

## 아직 남은 것

- 지도(주변 문화생활 지도): react-native-maps는 Expo Go 제약으로 development build가
  필요해서, 탐색 화면에 진입 버튼만 두었습니다. 나중에 별도 연결.
