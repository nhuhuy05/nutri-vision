import React, { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { getDatabase } from '@/data/datasources/local/db/connection';
import { COLORS } from '@/presentation/theme';
import { queryClient } from '@/presentation/query';
import { useAuthStore } from '@/presentation/store/authStore';
import { NotificationProvider } from '@/presentation/components';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      try {
        await getDatabase();
        await useAuthStore.getState().checkSession();
        if (isMounted) {
          setInitError(null);
          setIsReady(true);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('App bootstrap error:', e);
        if (isMounted) {
          setInitError(msg);
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    setInitError(null);
    setIsReady(false);
    setRetryKey((prev) => prev + 1);
  }, []);

  if (initError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Không thể khởi tạo cơ sở dữ liệu cục bộ</Text>
        <Text style={styles.errorDetail}>{initError}</Text>
        <Text style={styles.errorHint}>
          Nếu bạn vừa Reload ứng dụng trên Expo Go, hãy đóng hẳn (Force Stop) ứng dụng Expo Go trên máy ảo rồi mở lại.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 13,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
