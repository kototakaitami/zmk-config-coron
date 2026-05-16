import { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useClips } from '../../src/hooks/useClips';
import { ClipCard } from '../../src/components/ClipCard';
import { AIBadge } from '../../src/components/AIBadge';
import { AISource } from '../../src/types';
import { ALL_SOURCES } from '../../src/lib/ai-detector';

const FILTERS: Array<{ label: string; value: AISource | undefined }> = [
  { label: 'すべて', value: undefined },
  ...ALL_SOURCES.map((s) => ({ label: s, value: s })),
];

export default function ClipsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<AISource | undefined>(undefined);
  const { clips, refresh, applyFilter } = useClips();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  function handleFilter(source: AISource | undefined) {
    setActiveFilter(source);
    applyFilter(source ? { aiSource: source } : {});
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Clip</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push({ pathname: '/save', params: { text: '', url: '' } })}
        >
          <Ionicons name="add" size={22} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(({ label, value }) => (
          <TouchableOpacity
            key={label}
            onPress={() => handleFilter(value)}
            style={[
              styles.filterChip,
              activeFilter === value && styles.filterChipActive,
            ]}
          >
            {value ? (
              <AIBadge source={value} />
            ) : (
              <Text style={[styles.filterLabel, activeFilter === value && styles.filterLabelActive]}>
                すべて
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {clips.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={48} color="#2A2A2A" />
          <Text style={styles.emptyTitle}>クリップがありません</Text>
          <Text style={styles.emptyDesc}>
            各AIアプリの共有ボタンからこのアプリに送ると{'\n'}自動で保存されます
          </Text>
        </View>
      ) : (
        <FlatList
          data={clips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClipCard clip={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { color: '#F0F0F0', fontSize: 24, fontWeight: '700' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: { flexGrow: 0 },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#1A1A1A',
  },
  filterLabel: { color: '#6B7280', fontSize: 13, paddingHorizontal: 8, paddingVertical: 2 },
  filterLabelActive: { color: '#F0F0F0' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  separator: { height: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { color: '#4B5563', fontSize: 17, fontWeight: '600' },
  emptyDesc: { color: '#374151', fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
