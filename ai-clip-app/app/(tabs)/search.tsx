import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getClips, getProjects } from '../../src/lib/database';
import { ClipCard } from '../../src/components/ClipCard';
import { AIBadge } from '../../src/components/AIBadge';
import { Clip, AISource } from '../../src/types';
import { ALL_SOURCES } from '../../src/lib/ai-detector';
import { useFocusEffect } from 'expo-router';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [aiFilter, setAiFilter] = useState<AISource | undefined>(undefined);
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<Clip[]>([]);
  const [projects, setProjects] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setProjects(getProjects());
    }, [])
  );

  function runSearch(q: string, ai?: AISource, proj?: string) {
    if (!q && !ai && !proj) {
      setResults([]);
      return;
    }
    setResults(getClips({ query: q || undefined, aiSource: ai, project: proj }));
  }

  function handleQuery(text: string) {
    setQuery(text);
    runSearch(text, aiFilter, projectFilter);
  }

  function toggleAI(src: AISource) {
    const next = aiFilter === src ? undefined : src;
    setAiFilter(next);
    runSearch(query, next, projectFilter);
  }

  function toggleProject(proj: string) {
    const next = projectFilter === proj ? undefined : proj;
    setProjectFilter(next);
    runSearch(query, aiFilter, next);
  }

  function clearAll() {
    setQuery('');
    setAiFilter(undefined);
    setProjectFilter(undefined);
    setResults([]);
  }

  const hasFilter = query || aiFilter || projectFilter;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>検索</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#4B5563" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleQuery}
          placeholder="キーワードを入力..."
          placeholderTextColor="#4B5563"
          returnKeyType="search"
          autoCorrect={false}
        />
        {query ? (
          <TouchableOpacity onPress={() => handleQuery('')}>
            <Ionicons name="close-circle" size={18} color="#4B5563" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {ALL_SOURCES.map((src) => (
          <TouchableOpacity
            key={src}
            onPress={() => toggleAI(src)}
            style={[styles.chip, aiFilter === src && styles.chipActive]}
          >
            <AIBadge source={src} />
          </TouchableOpacity>
        ))}
        {projects.map((proj) => (
          <TouchableOpacity
            key={proj}
            onPress={() => toggleProject(proj)}
            style={[styles.chip, styles.projChip, projectFilter === proj && styles.projChipActive]}
          >
            <Text style={[styles.projText, projectFilter === proj && styles.projTextActive]}>
              {proj}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {hasFilter && results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={40} color="#2A2A2A" />
          <Text style={styles.emptyText}>見つかりませんでした</Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>フィルタをクリア</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClipCard clip={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !hasFilter ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>キーワードやAIで絞り込めます</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  title: { color: '#F0F0F0', fontSize: 24, fontWeight: '700', paddingHorizontal: 16, paddingBottom: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, color: '#F0F0F0', fontSize: 15, paddingVertical: 12 },
  chipScroll: { flexGrow: 0 },
  chipRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  chip: { padding: 2 },
  chipActive: { opacity: 1 },
  projChip: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  projChipActive: { borderColor: '#F59E0B', backgroundColor: '#F59E0B22' },
  projText: { color: '#6B7280', fontSize: 12 },
  projTextActive: { color: '#F59E0B' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 80 },
  emptyText: { color: '#4B5563', fontSize: 15 },
  clearText: { color: '#F59E0B', fontSize: 14 },
});
