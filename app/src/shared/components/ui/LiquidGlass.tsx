import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView, isLiquidGlassAvailable, type GlassStyle } from 'expo-glass-effect';

// Resolved once at module load. True only on iOS 26+ where Apple's real
// Liquid Glass (UIGlassEffect) is available; false on older iOS / Android,
// where we fall back to a blur + highlight that approximates the look.
const GLASS_AVAILABLE = (() => {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
})();

export interface LiquidGlassProps {
  /** Apple glass material when available. 'regular' (default) is frostier, 'clear' is more transparent. */
  glassStyle?: GlassStyle;
  /** Optional tint laid over the glass (e.g. brand accent at low alpha). */
  tintColor?: string;
  /** Lets the glass react to touches with a subtle ripple (buttons/controls). */
  isInteractive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  // --- Fallback (non–Liquid-Glass) tuning ---
  fallbackIntensity?: number;
  fallbackTint?: 'light' | 'dark' | 'default';
  /** Show the subtle top sheen on the fallback. Default true. */
  fallbackHighlight?: boolean;
}

/**
 * One glass surface used everywhere so the app degrades consistently.
 * On iOS 26 it's the genuine system material; elsewhere it's blur + sheen.
 * Give it a `borderRadius` via `style` — the fallback clips to it.
 */
export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  glassStyle = 'regular',
  tintColor,
  isInteractive = false,
  style,
  children,
  fallbackIntensity = 60,
  fallbackTint = 'dark',
  fallbackHighlight = true,
}) => {
  if (GLASS_AVAILABLE) {
    return (
      <GlassView
        glassEffectStyle={glassStyle}
        tintColor={tintColor}
        isInteractive={isInteractive}
        colorScheme="dark"
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  // Fallback: blur material + optional top highlight, clipped to the shape.
  return (
    <View style={[style, { overflow: 'hidden' }]}>
      <BlurView intensity={fallbackIntensity} tint={fallbackTint} style={StyleSheet.absoluteFill} />
      {tintColor && <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} />}
      {fallbackHighlight && (
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'transparent']}
          style={styles.highlight}
        />
      )}
      {children}
    </View>
  );
};

/** True iff the real Apple Liquid Glass material is rendering. */
export const liquidGlassAvailable = GLASS_AVAILABLE;

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
});

export default LiquidGlass;
