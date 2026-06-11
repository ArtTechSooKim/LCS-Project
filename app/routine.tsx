import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { colors, font, radius, spacing, shadow } from '@/constants/theme';
import { saveRoutine, getRoutine } from '@/services/storage';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const FREQ = ['주 1회', '주 2회', '주 3회 이상', '매일'];

export default function RoutineScreen() {
  const [days, setDays] = useState<string[]>(['토', '일']);
  const [freq, setFreq] = useState('주 1회');

  // 저장된 루틴 복원
  useEffect(() => {
    (async () => {
      const saved = await getRoutine();
      if (saved) {
        setDays(saved.days);
        setFreq(saved.freq);
      }
    })();
  }, []);

  const toggleDay = (d: string) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const handleSave = async () => {
    await saveRoutine({ days, freq });
    Alert.alert('저장 완료', `${days.join('·')}요일 / ${freq}로 설정했어요.`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={[styles.card, shadow.card]}>
        <Text style={styles.cardTitle}>문화생활 요일</Text>
        <Text style={styles.cardSub}>주로 문화생활을 즐기는 요일을 골라주세요.</Text>
        <View style={styles.dayRow}>
          {DAYS.map((d) => {
            const active = days.includes(d);
            return (
              <Pressable key={d} onPress={() => toggleDay(d)} style={[styles.day, active && styles.dayActive]}>
                <Text style={[styles.dayText, active && styles.dayTextActive]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, shadow.card]}>
        <Text style={styles.cardTitle}>주기</Text>
        <View style={styles.freqRow}>
          {FREQ.map((f) => {
            const active = freq === f;
            return (
              <Pressable key={f} onPress={() => setFreq(f)} style={[styles.freq, active && styles.freqActive]}>
                <Text style={[styles.freqText, active && styles.freqTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>저장하기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: font.caption, color: colors.textSub, marginTop: 4, marginBottom: spacing.lg },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 38, height: 38, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontSize: font.body, color: colors.textSub, fontWeight: '600' },
  dayTextActive: { color: colors.white },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  freq: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  freqActive: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  freqText: { fontSize: font.caption, color: colors.textSub, fontWeight: '600' },
  freqTextActive: { color: colors.primaryDark },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center' },
  saveText: { color: colors.white, fontWeight: '700', fontSize: font.subtitle },
});
