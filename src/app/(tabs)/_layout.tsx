import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: COLORS.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tổng quan',
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Nhật ký',
          tabBarLabel: 'Nhật ký',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Quét AI',
          tabBarLabel: 'Quét món',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-circle" size={size + 4} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Báo cáo',
          tabBarLabel: 'Báo cáo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
