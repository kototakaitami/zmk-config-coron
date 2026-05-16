import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveClip } from '../src/lib/database';
import { detectAISource, AI_COLORS, AI_LABELS, ALL_SOURCES } from '../src/lib/ai-detector';
import { Clip, AISource } from '../src/types';

export default function SaveScreen() {
  const insets = useSafeAreaInsets();
  const { text = '', url = '' } = useLocalSearchParams<{ text: string; url: string }>();

  const [aiSource, setAiSource] = useState<AISource>(detectAISource(url, text));
  const [project, setProject] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [note, setNote] = useState('');

  function generateTitle(s: string): string {
    const first = s.split('\n')[0].trim();
    return first.length > 60 ? first.slice(0, 60) + '…' : first || 'クリップ';
  }

  function handleSave() {
    const clip: Clip = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content: text,
      url: url || undefined,
      aiSource,
      project: project.trim() || undefined,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      title: generateTitle(text),
      note: note.trim() || undefined,
      savedAt: Date.now(),
    };
    saveClip(clip);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>クリップを保存</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.preview}>
          <Text style={styles.previewText} numberOfLines={5}>
            {text}
          </Text>
          {url && url !== text && (
            <Text style={styles.urlText} numberOfLines={1}>
              {url}
            </Text>
          )}
        </View>

        <Text style={styles.label}>AIツール</Text>
        <View style={styles.aiRow}>
          {ALL_SOURCES.map((src) => (
            <TouchableOpacity
              key={src}
              onPress={() => setAiSource(src)}
              style={[
                styles.aiChip,
                aiSource === src && {
                  borderColor: AI_COLORS[src],
                  backgroundColor: AI_COLORS[src] + '22',
                },
              ]}
            >
              <Text
                style={[
                  styles.aiChipText,
                  aiSource === src && { color: AI_COLORS[src] },
                ]}
              >
                {AI_LABELS[src]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>プロジェクト</Text>
        <TextInput
          style={styles.input}
          value={project}
          onChangeText={setProject}
          placeholder="例: ECサイト、個人ブログ"
          placeholderTextColor="#4B5563"
        />

        <Text style={styles.label}>タグ（カンマ区切り）</Text>
        <TextInput
          style={styles.input}
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="例: React, 設計, API"
          placeholderTextColor="#4B5563"
        />

        <Text style={styles.label}>メモ</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="補足メモ..."
          placeholderTextColor="#4B5563"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: { color: '#F0F0F0', fontSize: 16, fontWeight: '600' },
  cancel: { color: '#9CA3AF', fontSize: 16 },
  saveBtn: { color: '#F59E0B', fontSize: 16, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 4 },
  preview: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  previewText: { color: '#D1D5DB', fontSize: 14, lineHeight: 21 },
  urlText: { color: '#4B5563', fontSize: 11, marginTop: 8 },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  aiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aiChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  aiChipText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#F0F0F0',
    fontSize: 15,
  },
  noteInput: { minHeight: 80 },
});
