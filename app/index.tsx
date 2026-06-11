import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '@/constants/store';
import { colors } from '@/constants/theme';

export default function Index() {
  const { isInitializing, hasOnboarded } = useApp();

  // SecureStore에서 토큰/온보딩 상태 확인 중
  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 온보딩을 마쳤으면 탭 홈으로, 아니면 온보딩으로.
  return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding/preferences'} />;
}
