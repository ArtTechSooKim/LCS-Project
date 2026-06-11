import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, font, radius, spacing } from '@/constants/theme';
import { useApp } from '@/constants/store';
import ConfirmModal from '@/components/ConfirmModal';

const TERMS = ['이용자 약관', '개인정보 처리방침', '전자금융거래 이용약관', '개인정보 방침 동의 및 철회', '가맹점/제휴 문의'];

export default function SettingsScreen() {
  const { logout, deleteAccount } = useApp();
  const [adNotif, setAdNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [withdrawConfirmVisible, setWithdrawConfirmVisible] = useState(false);

  const handleLogout = () => {
    setLogoutConfirmVisible(false);
    logout();
    router.back();
  };

  const handleWithdraw = async () => {
    setWithdrawConfirmVisible(false);
    await deleteAccount();
    // 탈퇴 후에는 처음(관심사 설정)부터 다시 시작
    router.replace('/');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.section}>알림</Text>
      <View style={styles.card}>
        <ToggleRow label="광고성 정보 수신 알림" value={adNotif} onChange={setAdNotif} divider />
        <ToggleRow label="푸시 알림" value={pushNotif} onChange={setPushNotif} />
      </View>

      <Text style={styles.section}>약관 및 정책</Text>
      <View style={styles.card}>
        {TERMS.map((t, i) => (
          <Pressable key={t} style={[styles.row, i < TERMS.length - 1 && styles.divider]}>
            <Text style={styles.rowLabel}>{t}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.row} onPress={() => setLogoutConfirmVisible(true)}>
        <Text style={[styles.rowLabel, { color: colors.dangerSoft, fontWeight: '600' }]}>로그아웃</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => setWithdrawConfirmVisible(true)}>
        <Text style={[styles.rowLabel, { color: colors.danger, fontWeight: '700' }]}>탈퇴</Text>
      </Pressable>

      {/* 로그아웃 확인 */}
      <ConfirmModal
        visible={logoutConfirmVisible}
        title="정말 로그아웃 하시겠습니까?"
        confirmColor={colors.dangerSoft}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />

      {/* 탈퇴 확인 */}
      <ConfirmModal
        visible={withdrawConfirmVisible}
        title="정말 탈퇴 하시겠습니까?"
        message="탈퇴하면 찜한 목록과 관심사 등 모든 데이터가 삭제되며 복구할 수 없어요."
        confirmColor={colors.danger}
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawConfirmVisible(false)}
      />
    </ScrollView>
  );
}

function ToggleRow({ label, value, onChange, divider }: { label: string; value: boolean; onChange: (v: boolean) => void; divider?: boolean }) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: font.caption, fontWeight: '700', color: colors.textSub, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 52 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: font.body, color: colors.text },
});
