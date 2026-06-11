// 앱 전역 디자인 토큰. 피그마 색/폰트가 확정되면 여기만 바꾸면 전체에 반영됩니다.

export const colors = {
  primary: '#17B4C4', // 청록 포인트 (섹션 헤더 톤)
  primaryDark: '#0E8C99',
  accent: '#FF7A18', // 온보딩 오렌지
  danger: '#E5484D', // 강한 빨강 (탈퇴)
  dangerSoft: '#D98880', // 살짝 붉은색 (로그아웃)

  bg: '#FFFFFF',
  surface: '#F4F6F8', // 카드/입력 배경
  surfaceAlt: '#FFF8E1', // 알림 강조 배경

  text: '#1A1D1F',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',

  white: '#FFFFFF',
  star: '#FFB400',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const font = {
  // size
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 18,
  h2: 22,
  h1: 28,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

// 화면 전반의 정렬·간격을 한 기준으로 통일하기 위한 레이아웃 토큰
export const layout = {
  screenPadding: 16, // 모든 화면 좌우 여백
  sectionGap: 24, // 섹션 사이 간격
  gridGap: 12, // 카드/타일 사이 간격
  cardImageHeight: 112, // 카드 썸네일 높이 (전 화면 동일)
  cardColWidth: '48%' as const, // 2열 카드 폭
  catColWidth: '23%' as const, // 카테고리 4열 타일 폭
  catLabelHeight: 30, // 카테고리 라벨 고정 높이 (줄바꿈 어긋남 방지)
  cardTitleHeight: 38, // 카드 제목 2줄 고정 높이 (카드 높이 통일)
} as const;
