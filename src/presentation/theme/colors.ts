import { useColorScheme } from 'react-native';

export const LIGHT_COLORS = {
  primary: '#16803A',
  primaryDark: '#116B30',
  primaryLight: '#DCFCE7',
  neonMint: '#22C55E',
  neonMintLight: '#BBF7D0',
  neonMintGlow: 'rgba(34, 197, 94, 0.35)',
  secondary: '#1D4ED8',
  accent: '#B45309',
  danger: '#B91C1C',
  purple: '#6D28D9',
  yellow: '#A16207',
  background: '#F7FAF7',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  cardShadow: 'rgba(17, 107, 48, 0.10)',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: '#D9E8DC',
  borderLight: '#EDF4EE',
  inputBg: '#F7FAF7',
  success: '#16803A',
  warning: '#B45309',
  offline: '#475569',
  overlay: 'rgba(15, 23, 42, 0.55)',
  inverseText: '#FFFFFF',
};

export const DARK_COLORS: typeof LIGHT_COLORS = {
  primary: '#4ADE80',
  primaryDark: '#86EFAC',
  primaryLight: '#153A24',
  neonMint: '#4ADE80',
  neonMintLight: '#225B37',
  neonMintGlow: 'rgba(74, 222, 128, 0.25)',
  secondary: '#60A5FA',
  accent: '#FBBF24',
  danger: '#F87171',
  purple: '#C4B5FD',
  yellow: '#FACC15',
  background: '#0D1410',
  card: '#151E18',
  cardElevated: '#1B2720',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
  text: '#F3F4F6',
  textSecondary: '#CBD5E1',
  textMuted: '#9CA3AF',
  border: '#304438',
  borderLight: '#24342B',
  inputBg: '#111A15',
  success: '#4ADE80',
  warning: '#FBBF24',
  offline: '#CBD5E1',
  overlay: 'rgba(0, 0, 0, 0.72)',
  inverseText: '#0D1410',
};

export type AppColors = typeof LIGHT_COLORS;

// Kept for existing screens; redesigned modules use useAppTheme for adaptive colors.
export const COLORS = LIGHT_COLORS;

export function useAppTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? DARK_COLORS : LIGHT_COLORS, isDark };
}
