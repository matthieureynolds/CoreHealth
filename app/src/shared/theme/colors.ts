/**
 * The single source of colour for the app.
 *
 * This was two exports — `palette` (the dark-UI spec: #000000 bg / #1C1C1E
 * cards / #2C2C2E borders / #007AFF accent / #8E8E93 secondary text / #FFD60A
 * gold) and an older `colors` that disagreed on two values. Two colour systems
 * meant every new screen picked one at random, which is the same duplication
 * problem the rest of this feature had. They are merged here, with `palette`
 * winning the two conflicts because it matches what the screens actually
 * render: textSecondary is #8E8E93 (was #9AA3AF in `colors`) and surfaceMuted
 * is #2A2A2A (was #333333).
 */
export const palette = {
  // Surfaces
  bg: "#000000",
  surface: "#1C1C1E", // cards
  surfaceElevated: "#2C2C2E", // inputs, grouped rows
  surfaceMuted: "#2A2A2A",
  surfaceDeep: "#181818",
  border: "#3A3A3C",
  /** Translucent card fill used by the score/biomarker surfaces. */
  card: "rgba(22,24,30,0.75)",
  /** Unfilled portion of a progress ring. */
  ringTrack: "rgba(255,255,255,0.08)",
  divider: "rgba(255,255,255,0.06)",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#888888",
  textOnLight: "#E5E5EA",

  // Accents
  accent: "#007AFF", // system blue — the documented accent
  link: "#3AABF0", // lighter blue used across travel
  gold: "#FFD60A",

  // Navigation
  tabActive: "#3AABF0",
  tabInactive: "#FFFFFF",
  authCard: "#FFFFFF",

  // Calls to action
  cta: "#1976D2",
  ctaText: "#FFFFFF",

  // Status. There were three near-identical greens inherited from different
  // screens (#34C759 / #30D158 / #32D74B); they are now one.
  success: "#30D158",
  successDeep: "#059669",
  warning: "#FF9500",
  warningAlt: "#FF9F0A",
  danger: "#FF3B30",
  dangerDeep: "#8B0000",
  alert: "#FF6B35",

  // Biomarker range states
  optimal: "#00E676",
  sufficient: "#2196F3",
  out: "#FF9800",
} as const;
