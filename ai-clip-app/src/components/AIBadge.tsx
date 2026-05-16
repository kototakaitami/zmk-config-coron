import { View, Text, StyleSheet } from 'react-native';
import { AISource } from '../types';
import { AI_COLORS, AI_LABELS } from '../lib/ai-detector';

interface Props {
  source: AISource;
  size?: 'sm' | 'md';
}

export function AIBadge({ source, size = 'sm' }: Props) {
  const color = AI_COLORS[source];
  return (
    <View style={[styles.badge, { borderColor: color + '55', backgroundColor: color + '18' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, size === 'md' && styles.labelMd]}>
        {AI_LABELS[source]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelMd: {
    fontSize: 13,
  },
});
