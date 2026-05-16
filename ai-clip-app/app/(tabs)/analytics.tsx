import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAIStats, getDailyStats, getTotalCount } from '../../src/lib/database';
import { AISource } from '../../src/types';
import { AI_COLORS, AI_LABELS } from '../../src/lib/ai-detector';

const PREMIUM_UNLOCKED = false; // RevenueCatで置換予定

interface AIStatItem {
  source: AISource;
  count: number;
  pct: number;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [total, setTotal] = useState(0);
  const [aiStats, setAiStats] = useState<AIStatItem[]>([]);
  const [dailyStats, setDailyStats] = useState<Array<{ date: string; count: number }>>([]);
  const [isPremium] = useState(PREMIUM_UNLOCKED);

  useFocusEffect(
    useCallback(() => {
      const t = getTotalCount();
      setTotal(t);

      const raw = getAIStats();
      const items: AIStatItem[] = Object.entries(raw).map(([src, cnt]) => ({
        source: src as AISource,
        count: cnt!,
        pct: t > 0 ? Math.round((cnt! / t) * 100) : 0,
      }));
      items.sort((a, b) => b.count - a.count);
      setAiStats(items);

      setDailyStats(getDailyStats());
    }, [])
  );

  const maxDay = Math.max(...dailyStats.map((d) => d.count), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
    >
      <Text style={styles.title}>分析</Text>

      <View style={styles.statRow}>
        <StatCard label="総クリップ" value={String(total)} icon="bookmark" />
        <StatCard label="利用AI数" value={String(aiStats.length)} icon="layers-outline" />
      </View>

      <SectionTitle>AIツール別</SectionTitle>

      {aiStats.length === 0 ? (
        <Text style={styles.muted}>データがありません</Text>
      ) : (
        aiStats.map((item) => (
          <View key={item.source} style={styles.barRow}>
            <View style={styles.barLabelRow}>
              <View style={[styles.dot, { backgroundColor: AI_COLORS[item.source] }]} />
              <Text style={styles.barLabel}>{AI_LABELS[item.source]}</Text>
              <Text style={styles.barCount}>{item.count}件</Text>
              <Text style={styles.barPct}>{item.pct}%</Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { width: `${item.pct}%`, backgroundColor: AI_COLORS[item.source] },
                ]}
              />
            </View>
          </View>
        ))
      )}

      {isPremium ? (
        <>
          <SectionTitle>直近30日のアクティビティ</SectionTitle>
          <View style={styles.activityChart}>
            {dailyStats.slice(0, 14).reverse().map((d) => (
              <View key={d.date} style={styles.activityCol}>
                <View
                  style={[
                    styles.activityBar,
                    { height: Math.max(4, (d.count / maxDay) * 60), backgroundColor: '#F59E0B' },
                  ]}
                />
                <Text style={styles.activityDate}>
                  {new Date(d.date + 'T00:00:00').toLocaleDateString('ja-JP', { day: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <PremiumGate />
      )}
    </ScrollView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={20} color="#F59E0B" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PremiumGate() {
  return (
    <View style={styles.premiumGate}>
      <View style={styles.premiumBadge}>
        <Ionicons name="sparkles" size={16} color="#F59E0B" />
        <Text style={styles.premiumBadgeText}>Premium</Text>
      </View>
      <Text style={styles.premiumTitle}>さらに詳しい分析</Text>
      <Text style={styles.premiumDesc}>
        アクティビティグラフ、週次レポート、{'\n'}
        話題のトレンド分析など
      </Text>

      <View style={styles.featureList}>
        {['直近30日アクティビティグラフ', 'プロジェクト別利用比率', '週次サマリー通知'].map((f) => (
          <View key={f} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.upgradeBtn}>
        <Text style={styles.upgradeBtnText}>プレミアムにアップグレード</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  content: { paddingHorizontal: 16, gap: 4 },
  title: { color: '#F0F0F0', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  sectionTitle: {
    color: '#9CA3AF', fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 12,
  },
  muted: { color: '#4B5563', fontSize: 14 },
  statRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A2A',
    padding: 16, alignItems: 'center', gap: 6,
  },
  statValue: { color: '#F0F0F0', fontSize: 28, fontWeight: '700' },
  statLabel: { color: '#6B7280', fontSize: 12 },
  barRow: { marginBottom: 14 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  barLabel: { color: '#D1D5DB', fontSize: 14, flex: 1 },
  barCount: { color: '#6B7280', fontSize: 13 },
  barPct: { color: '#4B5563', fontSize: 12, width: 36, textAlign: 'right' },
  barBg: { height: 6, backgroundColor: '#2A2A2A', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  activityChart: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 4, height: 80, backgroundColor: '#1A1A1A',
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2A2A',
  },
  activityCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  activityBar: { width: '100%', borderRadius: 2 },
  activityDate: { color: '#4B5563', fontSize: 9 },
  premiumGate: {
    backgroundColor: '#1A1A1A', borderRadius: 16,
    borderWidth: 1, borderColor: '#F59E0B44',
    padding: 20, marginTop: 16, alignItems: 'center', gap: 10,
  },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F59E0B22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  premiumBadgeText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  premiumTitle: { color: '#F0F0F0', fontSize: 18, fontWeight: '700' },
  premiumDesc: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 21 },
  featureList: { width: '100%', gap: 8, marginTop: 4 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: '#D1D5DB', fontSize: 14 },
  upgradeBtn: {
    backgroundColor: '#F59E0B', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 8, width: '100%', alignItems: 'center',
  },
  upgradeBtnText: { color: '#0F0F0F', fontSize: 16, fontWeight: '700' },
});
