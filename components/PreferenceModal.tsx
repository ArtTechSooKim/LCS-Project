import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/constants/theme';
import { categories } from '@/data/mock';
import { useApp } from '@/constants/store';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// 마이페이지에서 관심사를 다시 고르는 모달 (온보딩과 동일하게 3개 이상)
export default function PreferenceModal({ visible, onClose }: Props) {
  const { prefs, updatePrefs } = useApp();
  const [selected, setSelected] = useState<string[]>(prefs);
  const canSave = selected.length >= 3;

  // 모달을 열 때마다 현재 저장된 관심사로 초기화
  useEffect(() => {
    if (visible) setSelected(prefs);
  }, [visible, prefs]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    await updatePrefs(selected);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.bg}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textSub} />
          </Pressable>

          <Text style={styles.title}>관심사 재설정</Text>
          <Text style={styles.sub}>좋아하는 문화생활을 3개 이상 골라주세요.</Text>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {categories.map((cat) => {
                const active = selected.includes(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.tile, active && { borderColor: colors.primary, backgroundColor: colors.primary + '11' }]}
                    onPress={() => toggle(cat.id)}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: cat.color + '22' }]}>
                      <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                    </View>
                    <Text style={styles.tileLabel} numberOfLines={1}>{cat.label}</Text>
                    {active && (
                      <View style={styles.check}>
                        <Ionicons name="checkmark" size={12} color={colors.white} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <Pressable style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} disabled={!canSave} onPress={save}>
            <Text style={styles.saveText}>{canSave ? '저장하기' : `${3 - selected.length}개 더 선택해주세요`}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
  },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 1 },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.body, color: colors.textSub, marginTop: spacing.xs, marginBottom: spacing.lg },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: {
    width: '31%',
    aspectRatio: 0.95,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
  },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: font.caption, fontWeight: '600', color: colors.text },
  check: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnDisabled: { backgroundColor: colors.border },
  saveText: { color: colors.white, fontWeight: '700', fontSize: font.body },
});
