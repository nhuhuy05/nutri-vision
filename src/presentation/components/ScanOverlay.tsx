import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/colors';

interface ScanOverlayProps {
  isAnalyzing?: boolean;
  style?: StyleProp<ViewStyle>;
  hintText?: string;
  frameSize?: number;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  isAnalyzing = false,
  style,
  hintText = 'Đặt món ăn vào chính giữa khung ngắm',
  frameSize = 260,
}) => {
  const { colors } = useAppTheme();
  const scanLinePos = useSharedValue(0);

  useEffect(() => {
    if (isAnalyzing) {
      scanLinePos.value = 0;
      scanLinePos.value = withRepeat(
        withTiming(frameSize - 8, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(scanLinePos);
      scanLinePos.value = 0;
    }

    return () => {
      cancelAnimation(scanLinePos);
    };
  }, [isAnalyzing, frameSize, scanLinePos]);

  const animatedLaserStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLinePos.value }],
    };
  });

  const cornerColor = isAnalyzing ? colors.neonMint : colors.primary;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* Target Scanner Frame Box */}
      <View
        style={[
          styles.frame,
          {
            width: frameSize,
            height: frameSize,
            borderColor: isAnalyzing ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.25)',
          },
        ]}
      >
        {/* Corner 1: Top-Left */}
        <View
          style={[
            styles.corner,
            styles.cornerTL,
            { borderTopColor: cornerColor, borderLeftColor: cornerColor },
          ]}
        />

        {/* Corner 2: Top-Right */}
        <View
          style={[
            styles.corner,
            styles.cornerTR,
            { borderTopColor: cornerColor, borderRightColor: cornerColor },
          ]}
        />

        {/* Corner 3: Bottom-Left */}
        <View
          style={[
            styles.corner,
            styles.cornerBL,
            { borderBottomColor: cornerColor, borderLeftColor: cornerColor },
          ]}
        />

        {/* Corner 4: Bottom-Right */}
        <View
          style={[
            styles.corner,
            styles.cornerBR,
            { borderBottomColor: cornerColor, borderRightColor: cornerColor },
          ]}
        />

        {/* Center Focus Reticle */}
        <View style={styles.centerReticle}>
          <Ionicons
            name="scan-outline"
            size={32}
            color={isAnalyzing ? colors.neonMint : 'rgba(255, 255, 255, 0.5)'}
          />
        </View>

        {/* Animated Laser Scanning Line */}
        {isAnalyzing && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                backgroundColor: colors.neonMint,
                shadowColor: colors.neonMint,
              },
              animatedLaserStyle,
            ]}
          >
            <View style={[styles.scanLineGlow, { backgroundColor: colors.neonMintLight }]} />
          </Animated.View>
        )}
      </View>

      {/* Guide Hint Pill */}
      {hintText ? (
        <View style={styles.hintPill}>
          <Ionicons
            name={isAnalyzing ? 'sparkles' : 'information-circle-outline'}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.hintText}>{hintText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  frame: {
    position: 'relative',
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'transparent',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 18,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 18,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 18,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 18,
  },
  centerReticle: {
    opacity: 0.6,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 4,
    height: 3,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  scanLineGlow: {
    height: 1,
    opacity: 0.8,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 18,
    gap: 6,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
