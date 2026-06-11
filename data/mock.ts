// 백엔드 연동 전 화면을 채우기 위한 임시 데이터.
// 나중에 이 파일의 export들을 API fetch 결과로 교체하면 됩니다.

export type Category = {
  id: string;
  label: string;
  icon: string; // @expo/vector-icons (Ionicons) 이름
  color: string;
};

export const categories: Category[] = [
  { id: 'all', label: '전체', icon: 'film-outline', color: '#FF6B6B' },
  { id: 'musical', label: '뮤지컬', icon: 'musical-notes-outline', color: '#4D96FF' },
  { id: 'play', label: '연극', icon: 'people-outline', color: '#6C5CE7' },
  { id: 'classic', label: '서양음악(클래식)', icon: 'headset-outline', color: '#E84393' },
  { id: 'dance', label: '무용(서양/한국무용)', icon: 'body-outline', color: '#00B894' },
  { id: 'circus', label: '서커스/마술', icon: 'sparkles-outline', color: '#0984E3' },
  { id: 'popular_music', label: '대중음악', icon: 'image-outline', color: '#85b988' },
  { id: 'Korean_music', label: '한국음악(국악)', icon: 'flame-outline', color: '#D63031' },
  { id: 'movie', label: '영화', icon: 'image-outline', color: '#E17055' },
  { id: 'Compound', label: '복합', icon: 'flame-outline', color: '#500b20' },
];

export const trendingKeywords = ['재즈', '독립영화', '전시회', '뮤지컬', '페스티벌'];

export type CultureItem = {
  id: string;
  title: string;
  category: string;
  venue: string;
  address: string;
  period: string;
  time: string;
  phone: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  cast: string[];
  liked: boolean;
};

export const cultureItems: CultureItem[] = [
  {
    id: '1',
    title: '코카서스의 분필 원 on Sync Next 25',
    category: '연극',
    venue: '세종문화회관 대극장',
    address: '서울특별시 종로구 세종대로 175',
    period: '2025.07.20 ~ 2025.07.23',
    time: '17:00 ~ 20:00',
    phone: '02-399-1000',
    price: 18000,
    rating: 4.5,
    reviewCount: 312,
    image: 'https://picsum.photos/seed/play1/600/400',
    cast: ['김민준', '이서연', '박지후', '최유나'],
    liked: false,
  },
  {
    id: '2',
    title: '재즈 인 더 파크',
    category: '클래식',
    venue: '예술의전당 콘서트홀',
    address: '서울특별시 서초구 남부순환로 2406',
    period: '2025.08.01 ~ 2025.08.03',
    time: '19:30 ~ 21:30',
    phone: '02-580-1300',
    price: 45000,
    rating: 4.8,
    reviewCount: 521,
    image: 'https://picsum.photos/seed/jazz2/600/400',
    cast: ['정재즈', '한선율'],
    liked: true,
  },
  {
    id: '3',
    title: '빛의 향연 미디어아트展',
    category: '전시',
    venue: '동대문디자인플라자',
    address: '서울특별시 중구 을지로 281',
    period: '2025.06.15 ~ 2025.09.30',
    time: '10:00 ~ 19:00',
    phone: '02-2153-0000',
    price: 22000,
    rating: 4.3,
    reviewCount: 188,
    image: 'https://picsum.photos/seed/media3/600/400',
    cast: [],
    liked: false,
  },
  {
    id: '4',
    title: '여름밤 독립영화제',
    category: '영화',
    venue: 'CGV 용산아이파크몰',
    address: '서울특별시 용산구 한강대로23길 55',
    period: '2025.07.10 ~ 2025.07.18',
    time: '14:00 ~ 23:00',
    phone: '1544-1122',
    price: 12000,
    rating: 4.6,
    reviewCount: 245,
    image: 'https://picsum.photos/seed/film4/600/400',
    cast: ['오감독', '윤배우', '강조연'],
    liked: false,
  },
];

export const reviews = [
  { id: 'r1', nick: '닉네임', rating: 5, text: '무대 연출이 정말 인상적이었어요. 시간 가는 줄 몰랐습니다.' },
  { id: 'r2', nick: '문화러버', rating: 4, text: '좌석 간격이 조금 좁았지만 공연 자체는 훌륭했습니다.' },
  { id: 'r3', nick: '주말관람객', rating: 5, text: '배우들 연기력이 대단해요. 다음 시즌도 기대됩니다!' },
];

// 캘린더에 표시할 관람 일정 (날짜 → 항목 id)
export const calendarEvents: Record<string, string[]> = {
  '2025-07-10': ['4'],
  '2025-07-16': ['1'],
  '2025-07-20': ['1'],
  '2025-08-01': ['2'],
  '2025-08-15': ['3'],
};

export const myProfile = {
  nickname: '닉네임',
  cultureScore: 75,
  badges: ['🎬', '🎭', '🎨', '🎵'],
  likedItemIds: ['2'],
};
