import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getClipCountsByDate, getClipsByDate } from '../../src/lib/database';
import { ClipCard } from '../../src/components/ClipCard';
import { Clip } from '../../src/types';

type MarkedDates = Record<string, { dots: Array<{ color: string }>; marked: boolean }>;

function countToColor(count: number): string {
  if (count >= 5) return '#F59E0B';
  if (count >= 3) return '#D97706';
  if (count >= 1) return '#92400E';
  return 'transparent';
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayClips, setDayClips] = useState<Clip[]>([]);

  useFocusEffect(
    useCallback(() => {
      const counts = getClipCountsByDate();
      const marks: MarkedDates = {};
      for (const [date, count] of Object.entries(counts)) {
        marks[date] = {
          marked: true,
          dots: [{ color: countToColor(count) }],
        };
      }
      setMarkedDates(marks);
    }, [])
  );

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
    setDayClips(getClipsByDate(day.dateString));
  }

  const selected = selectedDate
    ? {
        ...markedDates,
        [selectedDate]: {
          ...(markedDates[selectedDate] ?? { dots: [], marked: false }),
          selected: true,
          selectedColor: '#F59E0B22',
          selectedTextColor: '#F59E0B',
        },
      }
    : markedDates;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>カレンダー</Text>

      <Calendar
        markingType="multi-dot"
        markedDates={selected}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: '#0F0F0F',
          calendarBackground: '#0F0F0F',
          textSectionTitleColor: '#6B7280',
          selectedDayBackgroundColor: '#F59E0B',
          selectedDayTextColor: '#0F0F0F',
          todayTextColor: '#F59E0B',
          dayTextColor: '#D1D5DB',
          textDisabledColor: '#374151',
          dotColor: '#F59E0B',
          selectedDotColor: '#0F0F0F',
          arrowColor: '#F59E0B',
          monthTextColor: '#F0F0F0',
          indicatorColor: '#F59E0B',
          textDayFontWeight: '400',
          textMonthFontWeight: '700',
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />

      {selectedDate && (
        <View style={styles.daySection}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
              })}
            </Text>
            <Text style={styles.dayCount}>{dayClips.length}件</Text>
          </View>

          {dayClips.length === 0 ? (
            <View style={styles.noClips}>
              <Ionicons name="calendar-outline" size={28} color="#2A2A2A" />
              <Text style={styles.noClipsText}>この日のクリップはありません</Text>
            </View>
          ) : (
            <FlatList
              data={dayClips}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ClipCard clip={item} />}
              contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {!selectedDate && (
        <View style={styles.hint}>
          <Ionicons name="tap-water-outline" size={20} color="#2A2A2A" />
          <Text style={styles.hintText}>日付をタップするとその日のクリップを表示</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  title: { color: '#F0F0F0', fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingBottom: 8 },
  calendar: { borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  daySection: { flex: 1 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayTitle: { color: '#D1D5DB', fontSize: 14, fontWeight: '600' },
  dayCount: { color: '#F59E0B', fontSize: 13 },
  list: { paddingHorizontal: 16 },
  noClips: { alignItems: 'center', gap: 10, marginTop: 40 },
  noClipsText: { color: '#4B5563', fontSize: 14 },
  hint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hintText: { color: '#374151', fontSize: 14 },
});
