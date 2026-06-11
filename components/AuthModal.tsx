import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/constants/store';
import { colors, font, radius, spacing } from '@/constants/theme';

type AuthMode = 'login' | 'signup';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
};

export default function AuthModal({ visible, onClose, initialMode = 'login' }: Props) {
  const { login, signup } = useApp();
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    onClose();
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (authMode === 'signup' && !name.trim()) {
      Alert.alert('입력 오류', '이름을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'login') {
        await login(email.trim(), password.trim());
        handleClose();
      } else {
        await signup(email.trim(), password.trim(), name.trim());
        handleClose();
        // 새 회원은 관심사 설정부터 진행
        router.replace('/onboarding/preferences');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.modalCard}>
          <Pressable style={styles.modalClose} onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textSub} />
          </Pressable>

          {/* 탭 전환 */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, authMode === 'login' && styles.tabActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>로그인</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, authMode === 'signup' && styles.tabActive]}
              onPress={() => setAuthMode('signup')}
            >
              <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>회원가입</Text>
            </Pressable>
          </View>

          {authMode === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="이름"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.submitBtn} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>{authMode === 'login' ? '로그인' : '가입하기'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    width: '100%',
    maxWidth: 340,
  },
  modalClose: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 1 },

  tabRow: { flexDirection: 'row', marginBottom: spacing.lg, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: font.body, fontWeight: '700', color: colors.textSub },
  tabTextActive: { color: colors.white },

  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: font.body },
});
