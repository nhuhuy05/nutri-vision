import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

interface TabItemConfig {
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIG: Record<string, TabItemConfig> = {
  index: {
    label: 'Trang chủ',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  diary: {
    label: 'Nhật ký',
    activeIcon: 'book',
    inactiveIcon: 'book-outline',
  },
  scan: {
    label: 'Quét AI',
    activeIcon: 'scan',
    inactiveIcon: 'scan-outline',
  },
  reports: {
    label: 'Thống kê',
    activeIcon: 'stats-chart',
    inactiveIcon: 'stats-chart-outline',
  },
  profile: {
    label: 'Cá nhân',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
};

export function CustomTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets: propInsets,
}: BottomTabBarProps) {
  const contextInsets = useSafeAreaInsets();
  const insets = propInsets ?? contextInsets;
  const bottomInset = Math.max(insets.bottom, 12);

  // Find scan route for the elevated shutter button
  const scanIndex = state.routes.findIndex((r) => r.name === 'scan');
  const scanRoute = scanIndex !== -1 ? state.routes[scanIndex] : null;
  const isScanFocused = state.index === scanIndex;

  const onScanPress = () => {
    if (!scanRoute) return;
    const event = emitter.emit({
      type: 'tabPress',
      target: scanRoute.key,
      canPreventDefault: true,
    });

    if (!isScanFocused && !event.defaultPrevented) {
      navigateToTab(scanRoute.key);
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.dockWrapper, { bottom: bottomInset }]}
    >
      {/* Floating Capsule Bar Container (Figma EL-f661e243) */}
      <View style={styles.floatingCapsule}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            label: options.title || route.name,
            activeIcon: 'ellipse' as const,
            inactiveIcon: 'ellipse-outline' as const,
          };

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          const onLongPress = () => {
            emitter.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // 1. Center Elevated Shutter Placeholder Slot
          if (route.name === 'scan') {
            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel="Quét món ăn bằng camera AI"
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.centerTabSlot}
              >
                <View style={styles.centerShutterSpacer} />
                <Text
                  style={[
                    styles.centerShutterLabel,
                    isFocused && styles.centerShutterLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          }

          // 2. Standard 4 Navigation Tabs
          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={isFocused ? config.activeIcon : config.inactiveIcon}
                size={22}
                color={isFocused ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
              {isFocused ? (
                <View style={styles.activeDot} />
              ) : (
                <View style={styles.inactiveDotPlaceholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Elevated Center Shutter Button (Figma Thumb-Zone Logic: raised 16px) */}
      {scanRoute && (
        <TouchableOpacity
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityState={isScanFocused ? { selected: true } : {}}
          accessibilityLabel="Quét món ăn bằng camera AI"
          onPress={onScanPress}
          style={[
            styles.centerShutterBtn,
            isScanFocused && styles.centerShutterBtnFocused,
          ]}
        >
          <Ionicons name="scan" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  floatingCapsule: {
    flexDirection: 'row',
    width: '100%',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#E2EFE4',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    // Figma Elevation Shadow: 0px 4px 20px rgba(22, 163, 74, 0.16)
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  tabLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  inactiveDotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
  centerTabSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  centerShutterSpacer: {
    height: 30,
  },
  centerShutterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: -0.2,
  },
  centerShutterLabelActive: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  // Elevated Shutter Button according to Figma UX annotation (Thumb-Zone Logic: raised 16px)
  centerShutterBtn: {
    position: 'absolute',
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F8FCF8',
    // Elevated Green Shutter Shadow
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 10,
  },
  centerShutterBtnFocused: {
    backgroundColor: COLORS.primaryDark,
    borderColor: '#DCFCE7',
  },
});
