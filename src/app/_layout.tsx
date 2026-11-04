import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDatabase } from '../data/datasources/local/database';
import { useMealStore } from '../presentation/store/mealStore';
import { COLORS } from '../core/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { loadLogs, checkConnectivity } = useMealStore();

  useEffect(() => {
    async function bootstrap() {
      try {
        await getDatabase();
        await checkConnectivity();
        await loadLogs();
      } catch (e) {
        console.error('App bootstrap error:', e);
      } finally {
        setIsReady(true);
      }
    }
    bootstrap();
  }, [checkConnectivity, loadLogs]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang khởi tạo NutriVision...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal/food-review"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Xác nhận món ăn & khẩu phần',
            headerTintColor: COLORS.text,
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
        <Stack.Screen
          name="modal/manual-entry"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Tra cứu & Thêm món',
            headerTintColor: COLORS.text,
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

