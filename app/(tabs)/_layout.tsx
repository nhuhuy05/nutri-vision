import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/presentation/components';
import { COLORS } from '@/presentation/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
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
          title: 'Trang chủ',
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Nhật ký',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Quét món AI',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Thống kê',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
        }}
      />
    </Tabs>
  );
}
