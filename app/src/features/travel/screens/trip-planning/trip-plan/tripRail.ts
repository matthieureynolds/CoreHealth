import type { Ionicons } from "@expo/vector-icons";
import type { Action } from "@shared/types";
import { palette } from "@shared/theme/colors";

/**
 * Geometry and layout for the 24-hour day rail on the trip plan.
 *
 * Pure: takes the plan's actions, returns where to draw. Extracted from
 * TripDetailScreen because it is the only real algorithm in that file and was
 * untestable while it sat inside a 1,700-line screen — a wrong capsule is a
 * subtle visual bug, exactly the kind a test catches and an eyeball does not.
 */

// ── Timeshifter-style 24h day rail ─────────────────────────────────────────
export const HOUR_H = 15; // px per hour
export const RAIL_H = HOUR_H * 24; // full midnight→midnight height
// Fixed category columns, left → right. Each action type lives in exactly one
// column; time positions it vertically. This keeps the rail organised instead
// of scattering icons across fuzzy lanes.
export const COL_KEYS = [
  "food",
  "sleep",
  "avoidLight",
  "seekLight",
  "coffee",
  "commit",
  "plane",
] as const;
export type ColKey = (typeof COL_KEYS)[number];
export const colIndex = (k: ColKey) => COL_KEYS.indexOf(k);
export const yForMin = (min: number) => (min / 60) * HOUR_H;
export const parseMin = (t?: string | null): number | null => {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};
export function hourLabel(h: number): string {
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${h < 12 || h === 24 ? "am" : "pm"}`;
}
export const CAP_STYLE: Record<string, { bg: string; border?: string }> = {
  sleep: { bg: "rgba(59,59,102,0.72)" },
  flight: { bg: "rgba(47,95,168,0.72)" },
  seek: { bg: "rgba(183,148,32,0.72)" },
  avoid: { bg: "rgba(85,85,95,0.72)" },
};
// Every capsule segment renders this icon in its rounded top as its head.
export const CAP_HEAD: Record<string, keyof typeof Ionicons.glyphMap> = {
  sleep: "bed",
  flight: "airplane",
  seek: "sunny",
  avoid: "moon",
};
export const MARK_TINT: Record<
  string,
  {
    bg: string;
    border: string;
    icon: string;
    glyph: keyof typeof Ionicons.glyphMap;
  }
> = {
  seek: {
    bg: "rgba(183,148,32,0.72)",
    border: "rgba(183,148,32,0.72)",
    icon: palette.textPrimary,
    glyph: "sunny",
  },
  avoid: {
    bg: "rgba(85,85,95,0.72)",
    border: "rgba(85,85,95,0.72)",
    icon: palette.textPrimary,
    glyph: "moon",
  },
  coffee: {
    bg: "rgba(168,95,28,0.72)",
    border: "rgba(168,95,28,0.72)",
    icon: palette.textPrimary,
    glyph: "cafe",
  },
  cut: {
    bg: "rgba(168,58,52,0.72)",
    border: "rgba(168,58,52,0.72)",
    icon: palette.textPrimary,
    glyph: "ban",
  },
  mela: {
    bg: "rgba(110,82,168,0.72)",
    border: "rgba(110,82,168,0.72)",
    icon: palette.textPrimary,
    glyph: "medical",
  },
  meal: {
    bg: "rgba(46,140,67,0.72)",
    border: "rgba(46,140,67,0.72)",
    icon: palette.textPrimary,
    glyph: "restaurant",
  },
  commit: {
    bg: "rgba(168,58,84,0.72)",
    border: "rgba(168,58,84,0.72)",
    icon: palette.textPrimary,
    glyph: "calendar",
  },
  flight: {
    bg: "rgba(47,95,168,0.72)",
    border: "rgba(47,95,168,0.72)",
    icon: palette.textPrimary,
    glyph: "airplane",
  },
  sleep: {
    bg: "rgba(59,59,102,0.72)",
    border: "rgba(59,59,102,0.72)",
    icon: palette.textPrimary,
    glyph: "bed",
  },
};
export type RailCap = { col: number; style: string; s: number; e: number };
export type RailMark = {
  col: number;
  at: number;
  tint: keyof typeof MARK_TINT;
  label?: string;
};
export function buildRail(actions: Action[]): {
  caps: RailCap[];
  marks: RailMark[];
} {
  const caps: RailCap[] = [];
  const marks: RailMark[] = [];
  const pushCap = (
    col: number,
    style: string,
    s: number | null,
    e: number | null,
  ) => {
    if (s == null || e == null) return;
    if (e <= s) {
      caps.push({ col, style, s, e: 1440 });
      caps.push({ col, style, s: 0, e });
    } else caps.push({ col, style, s, e });
  };
  const SLEEP = colIndex("sleep");
  const AVOID_LIGHT = colIndex("avoidLight");
  const SEEK_LIGHT = colIndex("seekLight");
  const COFFEE = colIndex("coffee");
  const FOOD = colIndex("food");
  const COMMIT = colIndex("commit");
  const PLANE = colIndex("plane");
  actions.forEach((a) => {
    const s = parseMin(a.start_local);
    const e = parseMin(a.end_local);
    const at = parseMin(a.at_local) ?? s;
    switch (a.type) {
      case "sleep":
      case "nap":
        pushCap(SLEEP, "sleep", s, e);
        break;
      case "in_flight":
        pushCap(PLANE, "flight", s, e);
        break;
      case "seek_light":
        pushCap(SEEK_LIGHT, "seek", s, e);
        break;
      case "avoid_light":
        pushCap(AVOID_LIGHT, "avoid", s, e);
        break;
      case "caffeine_ok":
        if (at != null) marks.push({ col: COFFEE, at, tint: "coffee" });
        break;
      case "caffeine_cutoff":
        if (at != null) marks.push({ col: COFFEE, at, tint: "cut" });
        break;
      case "melatonin":
        if (at != null) marks.push({ col: SLEEP, at, tint: "mela" });
        break;
      case "meal":
        if (at != null) marks.push({ col: FOOD, at, tint: "meal" });
        break;
      case "commitment":
        if (at != null)
          marks.push({ col: COMMIT, at, tint: "commit", label: a.label });
        break;
    }
  });
  return { caps, marks };
}
