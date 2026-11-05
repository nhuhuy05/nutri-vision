import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { getDatabase } from '@/data/datasources/local/db/connection';
import { COLORS } from '@/presentation/theme';
import { queryClient } from '@/presentation/query';
import { useAuthStore } from '@/presentation/store/authStore';
import { NotificationProvider } from '@/presentation/components';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        await getDatabase();
        await useAuthStore.getState().checkSession();
      } catch (e) {
        console.error('App bootstrap error:', e);
      } finally {
        setIsReady(true);
      }
    }
    bootstrap();
  }, []);

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
        <Stack.Screen name="(auth)" />
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
      <NotificationProvider />
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
