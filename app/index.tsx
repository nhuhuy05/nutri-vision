import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/presentation/theme';
import { useAuthStore } from '@/presentation/store/authStore';

export default function RootIndex() {
  const [target, setTarget] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function determineInitialRoute() {
      try {
        if (isAuthenticated) {
          setTarget('/(tabs)');
          return;
        }

        const hasSeenIntro = await AsyncStorage.getItem('@nutrivision_has_seen_intro');
        if (!hasSeenIntro) {
          // Open Onboarding 1, 2, 3 from Figma
          setTarget('/(auth)/welcome');
        } else {
          setTarget('/(tabs)');
        }
      } catch {
        setTarget('/(tabs)');
      }
    }

    determineInitialRoute();
  }, [isAuthenticated]);

  if (!target) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}

