import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing } from '@/constants/theme';

type Props = {
  title: string;
  onMore?: () => void;
};

export default function SectionHeader({ title, onMore }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onMore && (
        <Pressable style={styles.more} onPress={onMore} hitSlop={8}>
          <Text style={styles.moreText}>더보기</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textSub} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  moreText: { fontSize: font.caption, color: colors.textSub },
});
