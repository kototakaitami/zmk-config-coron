import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Clip } from '../types';
import { AIBadge } from './AIBadge';

interface Props {
  clip: Clip;
}

export function ClipCard({ clip }: Props) {
  const date = new Date(clip.savedAt);
  const dateStr = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/clip/${clip.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <AIBadge source={clip.aiSource} />
        {clip.project && (
          <View style={styles.projectChip}>
            <Text style={styles.projectText}>{clip.project}</Text>
          </View>
        )}
        <Text style={styles.date}>
          {dateStr} {timeStr}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {clip.title}
      </Text>
      <Text style={styles.content} numberOfLines={2}>
        {clip.content}
      </Text>

      {clip.url ? (
        <TouchableOpacity
          style={styles.urlRow}
          onPress={() => Linking.openURL(clip.url!)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="link-outline" size={12} color="#6B7280" />
          <Text style={styles.url} numberOfLines={1}>
            {clip.url}
          </Text>
        </TouchableOpacity>
      ) : null}

      {clip.tags.length > 0 && (
        <View style={styles.tags}>
          {clip.tags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {clip.tags.length > 4 && (
            <Text style={styles.moreTags}>+{clip.tags.length - 4}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectChip: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  projectText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  date: {
    color: '#4B5563',
    fontSize: 11,
    marginLeft: 'auto',
  },
  title: {
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 19,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  url: {
    color: '#4B5563',
    fontSize: 11,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tag: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    color: '#6B7280',
    fontSize: 11,
  },
  moreTags: {
    color: '#4B5563',
    fontSize: 11,
    alignSelf: 'center',
  },
});
