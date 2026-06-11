import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string; // 예: "정말 로그아웃 하시겠습니까?"
  message?: string;
  confirmColor?: string; // '네' 버튼 색 (로그아웃: dangerSoft, 탈퇴: danger)
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmColor = colors.dangerSoft,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.bg}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.btnRow}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>아니요</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: confirmColor }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>네</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  title: { fontSize: font.subtitle, fontWeight: '800', color: colors.text, textAlign: 'center' },
  message: { fontSize: font.body, color: colors.textSub, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  btn: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  cancelBtn: { backgroundColor: colors.surface },
  cancelText: { color: colors.text, fontWeight: '700', fontSize: font.body },
  confirmText: { color: colors.white, fontWeight: '700', fontSize: font.body },
});
