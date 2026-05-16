import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { initDatabase } from '../src/lib/database';

export default function RootLayout() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;
    const text = shareIntent.text ?? '';
    const url = shareIntent.webUrl ?? (text.startsWith('http') ? text : '');
    router.push({ pathname: '/save', params: { text, url } });
    resetShareIntent();
  }, [hasShareIntent, shareIntent]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="save"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="clip/[id]" />
    </Stack>
  );
}
