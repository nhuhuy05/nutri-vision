export const LIGHT_COLORS = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',
  neonMint: '#4ADE80',
  neonMintLight: '#BBF7D0',
  neonMintGlow: 'rgba(74, 222, 128, 0.35)',
  secondary: '#2563EB',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  yellow: '#EAB308',
  background: '#F8FCF8',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  cardShadow: 'rgba(22, 163, 74, 0.10)',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E2EFE4',
  borderLight: '#F0F8F1',
  inputBg: '#FAFCFA',
  success: '#16A34A',
  warning: '#F59E0B',
  offline: '#64748B',
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
  // Luôn cố định giao diện nền sáng / trắng tươi sáng chuẩn phong cách NutriVision
  return { colors: LIGHT_COLORS, isDark: false };
}
