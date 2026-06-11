import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';

const TYPES = ['이용 문의', '오류 신고', '제휴/제안', '기타'];

export default function InquiryScreen() {
  const [type, setType] = useState('이용 문의');
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) {
      Alert.alert('입력 오류', '문의 내용을 입력해주세요.');
      return;
    }
    Alert.alert('접수 완료', '문의가 정상적으로 접수되었어요. 빠르게 답변드릴게요.');
    setText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.label}>문의 유형</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => {
            const active = type === t;
            return (
              <Pressable key={t} onPress={() => setType(t)} style={[styles.type, active && styles.typeActive]}>
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: spacing.lg }]}>문의 내용</Text>
        <TextInput
          style={styles.textArea}
          placeholder="문의하실 내용을 자세히 적어주세요."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <Pressable style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitText}>문의 보내기</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: font.caption, fontWeight: '700', color: colors.textSub, marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  type: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  typeActive: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  typeText: { fontSize: font.caption, color: colors.textSub, fontWeight: '600' },
  typeTextActive: { color: colors.primaryDark },
  textArea: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, minHeight: 160, fontSize: font.body, color: colors.text, ...shadow.card },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  submitText: { color: colors.white, fontWeight: '700', fontSize: font.subtitle },
});
