/**
 * The CoreHealth palette as actually used by the app's dark UI, matching the
 * documented spec (#000000 bg / #1C1C1E cards / #2C2C2E borders / #007AFF accent
 * / #8E8E93 secondary text / #FFD60A gold).
 *
 * This is separate from `colors` below, which predates it and uses different
 * values (e.g. textSecondary #9AA3AF vs the #8E8E93 the screens actually render).
 * Merging the two would change rendered output, so they coexist until someone
 * decides which is canonical — see the near-duplicate greens noted below for an
 * example of what that cleanup would resolve.
 */
export const palette = {
  // Surfaces
  bg: "#000000",
  surface: "#1C1C1E", // cards
  surfaceElevated: "#2C2C2E", // inputs, grouped rows
  surfaceMuted: "#2A2A2A",
  surfaceDeep: "#181818",
  border: "#3A3A3C",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textOnLight: "#E5E5EA",

  // Accents
  accent: "#007AFF", // system blue — the documented accent
  link: "#3AABF0", // lighter blue used across travel
  gold: "#FFD60A",

  // Status. `success`/`successAlt`/`successVivid` are three near-identical
  // greens inherited from different screens; kept distinct so migrating to
  // tokens does not change any pixel. Worth collapsing deliberately later.
  success: "#34C759",
  successAlt: "#30D158",
  successVivid: "#32D74B",
  successDeep: "#059669",
  warning: "#FF9500",
  warningAlt: "#FF9F0A",
  danger: "#FF3B30",
  dangerDeep: "#8B0000",
  alert: "#FF6B35",
} as const;

export const colors = {
  bg: '#000000',
  card: 'rgba(22,24,30,0.75)',
  ringTrack: 'rgba(255,255,255,0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9AA3AF',
  textTertiary: '#888888',
  divider: 'rgba(255,255,255,0.06)',

  // Navigation / UI
  tabActive: '#3AABF0',
  tabInactive: '#FFFFFF',
  surfaceMuted: '#333333',
  authCard: '#FFFFFF',

  optimal: '#00E676',     // green
  sufficient: '#2196F3',  // blue
  out: '#FF9800',         // orange

  cta: '#1976D2',
  ctaText: '#FFFFFF',
};
