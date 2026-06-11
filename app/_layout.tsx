import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/constants/store';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="map" options={{ headerShown: true, title: '주변 문화생활 지도', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
          <Stack.Screen
            name="notifications"
            options={{ headerShown: true, title: '알림', headerBackTitle: '뒤로' }}
          />
          <Stack.Screen
            name="settings"
            options={{ headerShown: true, title: '환경설정', headerBackTitle: '뒤로' }}
          />
          <Stack.Screen name="score" options={{ headerShown: true, title: '문화 점수', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
          <Stack.Screen name="diagnosis" options={{ headerShown: true, title: '지역 문화 점수 진단', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
          <Stack.Screen name="schedules" options={{ headerShown: true, title: '예약/결제 내역', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
          <Stack.Screen name="routine" options={{ headerShown: true, title: '루틴 요일/주기', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
          <Stack.Screen name="inquiry" options={{ headerShown: true, title: '1:1 문의', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
          <Stack.Screen name="comments" options={{ headerShown: true, title: '나의 코멘트', headerBackTitle: '뒤로', headerTintColor: colors.text }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
