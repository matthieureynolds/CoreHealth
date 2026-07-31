import { isLiquidGlassAvailable } from "expo-glass-effect";

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

// Over a pure-black background pure glass refracts only black, so it reads as
// flat black. This frost tint gives the glass its own visible material so it
// reads as glass at rest. Tune the alpha: higher = more frosted, lower = darker.
export const GLASS_TINT = "rgba(255,255,255,0.03)";
