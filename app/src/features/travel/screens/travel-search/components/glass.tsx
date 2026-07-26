import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';

// Real iOS 26 Liquid Glass, when the OS/build supports it. Guarded so a build
// without the native module falls back to the existing solid fills instead of
// crashing on import.
export const GLASS_AVAILABLE = (() => {
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
})();

// Apply to a card alongside its base style (gated on GLASS_AVAILABLE) so the
// solid fill drops away and the glass shows through, clipped to the corners.
export const glassCard = {
  backgroundColor: 'transparent' as const,
  overflow: 'hidden' as const,
};

// Over a pure-black background pure glass refracts only black, so it reads as
// flat black. This frost tint gives the glass its own visible material so it
// reads as glass at rest. Tune the alpha: higher = more frosted, lower = darker.
export const GLASS_TINT = 'rgba(255,255,255,0.03)';

// --- Glossy glass recipe -------------------------------------------------
// Shared by the search pill and every result card so they look identical.
// Over pure black, glass has nothing to refract, so we fake the specular a
// bright backdrop would give it: more frost (material) + a top-down sheen (the
// gloss) + a light edge (the rim).
export const GLOSS_TINT = 'rgba(255,255,255,0.08)';
export const GLOSS_RIM = 'rgba(255,255,255,0.16)';
export const GLOSS_SHEEN: [string, string, string] = [
  'rgba(255,255,255,0.10)',
  'rgba(255,255,255,0.03)',
  'rgba(255,255,255,0)',
];

// Frost for the result cards (summary, metrics, hospitals, vaccinations). Lower
// than the pill since they sit over a solid grey body — tune all cards here.
export const CARD_TINT = 'rgba(255,255,255,0.06)';

// Drop-in glossy glass background for a rounded card. Renders nothing when glass
// isn't available, so callers can place it unconditionally as the card's first
// child (the card style must drop its solid fill via `glassCard` and clip to its
// corners). Matches the search pill exactly.
export const CardGlass: React.FC<{ radius?: number; tint?: string }> = ({ radius = 16, tint = GLOSS_TINT }) =>
  GLASS_AVAILABLE ? (
    <>
      <GlassView
        glassEffectStyle="regular"
        colorScheme="dark"
        tintColor={tint}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      <LinearGradient
        colors={GLOSS_SHEEN}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: GLOSS_RIM }]}
      />
    </>
  ) : null;
