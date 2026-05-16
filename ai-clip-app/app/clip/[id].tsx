import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Linking,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getClip, updateClip, deleteClip } from '../../src/lib/database';
import { AIBadge } from '../../src/components/AIBadge';
import { Clip } from '../../src/types';

export default function ClipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [clip, setClip] = useState<Clip | null>(null);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');
  const [project, setProject] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const c = getClip(id);
      if (c) {
        setClip(c);
        setNote(c.note ?? '');
        setProject(c.project ?? '');
      }
    }, [id])
  );

  function handleSave() {
    if (!clip) return;
    const updated: Clip = { ...clip, note: note.trim() || undefined, project: project.trim() || undefined };
    updateClip(updated);
    setClip(updated);
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert('削除', 'このクリップを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive',
        onPress: () => {
          if (id) deleteClip(id);
          router.back();
        },
      },
    ]);
  }

  if (!clip) return null;

  const date = new Date(clip.savedAt).toLocaleString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#F0F0F0" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {editing ? (
            <>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.actionBtn}>
                <Text style={styles.cancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
                <Text style={styles.saveText}>保存</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.iconBtn}>
                <Ionicons name="pencil-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <AIBadge source={clip.aiSource} size="md" />
          <Text style={styles.date}>{date}</Text>
        </View>

        <Text style={styles.title}>{clip.title}</Text>

        {clip.url && (
          <TouchableOpacity style={styles.urlCard} onPress={() => Linking.openURL(clip.url!)}>
            <Ionicons name="open-outline" size={14} color="#F59E0B" />
            <Text style={styles.urlText} numberOfLines={2}>
              {clip.url}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#4B5563" />
          </TouchableOpacity>
        )}

        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{clip.content}</Text>
        </View>

        <Label>プロジェクト</Label>
        {editing ? (
          <TextInput
            style={styles.editInput}
            value={project}
            onChangeText={setProject}
            placeholder="プロジェクト名"
            placeholderTextColor="#4B5563"
          />
        ) : (
          <Text style={styles.valueText}>{clip.project ?? '未設定'}</Text>
        )}

        {clip.tags.length > 0 && (
          <>
            <Label>タグ</Label>
            <View style={styles.tagRow}>
              {clip.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Label>メモ</Label>
        {editing ? (
          <TextInput
            style={[styles.editInput, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="補足メモ..."
            placeholderTextColor="#4B5563"
            multiline
            textAlignVertical="top"
          />
        ) : (
          <Text style={[styles.valueText, !clip.note && styles.muted]}>
            {clip.note ?? 'メモなし'}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 6 }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { padding: 8 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
  saveText: { color: '#F59E0B', fontSize: 15, fontWeight: '600' },
  iconBtn: { padding: 8 },
  content: { paddingHorizontal: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  date: { color: '#4B5563', fontSize: 12, marginLeft: 'auto' },
  title: { color: '#F0F0F0', fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 14 },
  urlCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1A1A1A', borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A2A',
    padding: 12, marginBottom: 14,
  },
  urlText: { color: '#F59E0B', fontSize: 13, flex: 1 },
  contentCard: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
    padding: 14, marginBottom: 4,
  },
  contentText: { color: '#D1D5DB', fontSize: 15, lineHeight: 23 },
  valueText: { color: '#D1D5DB', fontSize: 15 },
  muted: { color: '#4B5563' },
  editInput: {
    backgroundColor: '#1A1A1A', borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A2A',
    paddingHorizontal: 14, paddingVertical: 10,
    color: '#F0F0F0', fontSize: 15,
  },
  noteInput: { minHeight: 80, textAlignVertical: 'top' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#2A2A2A', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { color: '#9CA3AF', fontSize: 13 },
});
