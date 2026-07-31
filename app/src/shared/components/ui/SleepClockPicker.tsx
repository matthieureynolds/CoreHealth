import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import Svg, { Circle, Path, Line, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

// ─── Layout constants ────────────────────────────────────
const CLOCK_SIZE = 280;
const CX = CLOCK_SIZE / 2;
const CY = CLOCK_SIZE / 2;
const FACE_R = 132;
const TICK_R = 126;
const NUM_R = 108;
const ARC_R = 78;
const ARC_W = 32;
const HANDLE_R = ARC_W / 2 + 3;

// ─── Colors ──────────────────────────────────────────────
const BED_CLR = "#5856D6";
const WAKE_CLR = "#FF9500";
const ARC_CLR = "#5856D6";
const FACE_CLR = "#1C1C1E";
const TRACK_CLR = "#252528";
const TICK_CLR = "#48484A";
const TICK_H_CLR = "#636366";
const NUM_CLR = "#8E8E93";

// ─── Helpers ─────────────────────────────────────────────

/** Parse "HH:MM" → decimal hours (0–24) */
const parse = (s: string): number => {
  const [h, m] = s.split(":").map(Number);
  return h + m / 60;
};

/** Decimal hours → "HH:MM" */
const fmt24 = (d: number): string => {
  let h = Math.floor(((d % 24) + 24) % 24);
  let m = Math.round((d % 1) * 60);
  if (m >= 60) {
    h = (h + 1) % 24;
    m = 0;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** Decimal hours → "7:00 AM" display string */
const fmtDisp = (d: number): string => {
  let h24 = Math.floor(((d % 24) + 24) % 24);
  let m = Math.round((d % 1) * 60);
  if (m >= 60) {
    h24 = (h24 + 1) % 24;
    m = 0;
  }
  return `${h24 % 12 || 12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
};

/** Decimal hours → angle on 12-hour clock (0° = 12 o'clock, clockwise) */
const h2a = (d: number): number => ((d % 12) * 30) % 360;

/** Angle → {x,y} on circle of given radius */
const a2p = (deg: number, r: number) => ({
  x: CX + r * Math.sin((deg * Math.PI) / 180),
  y: CY - r * Math.cos((deg * Math.PI) / 180),
});

/** Touch coords → angle (0° = top, clockwise) */
const t2a = (tx: number, ty: number): number => {
  let a = Math.atan2(tx - CX, -(ty - CY)) * (180 / Math.PI);
  return ((a % 360) + 360) % 360;
};

/** Sleep duration in hours */
const sleepH = (bed: number, wake: number): number => {
  let d = wake - bed;
  if (d <= 0) d += 24;
  return d;
};

/** SVG arc path from startDeg to endDeg (clockwise) */
const arcD = (startDeg: number, endDeg: number, r: number): string => {
  const sp = a2p(startDeg, r);
  const ep = a2p(endDeg, r);
  let sweep = (((endDeg - startDeg) % 360) + 360) % 360;
  if (sweep < 0.5) return "";
  return `M${sp.x} ${sp.y} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
};

/** Angle → decimal hours, tracking AM/PM by detecting 12-o'clock crossings */
const angleToDec = (angle: number, prev: number): number => {
  // Snap to 5-minute increments (2.5° each)
  const snap = Math.round(angle / 2.5) * 2.5;
  const norm = snap >= 360 ? 0 : snap;
  const h12 = norm / 30; // 0 to <12

  const prevH12 = prev % 12;
  const wasPM = Math.floor(prev) >= 12;
  const prevA = (prevH12 * 30) % 360;
  const crossed = (prevA > 270 && norm < 90) || (prevA < 90 && norm > 270);
  const pm = crossed ? !wasPM : wasPM;

  let h24 = pm ? h12 + 12 : h12;
  if (h24 >= 24) h24 -= 24;
  return h24;
};

// ─── Precomputed static elements ─────────────────────────
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const deg = i * 7.5;
  const major = i % 4 === 0;
  return { deg, major };
});

const HOURS = Array.from({ length: 12 }, (_, i) => ({
  label: i === 0 ? "12" : String(i),
  deg: i * 30,
}));

// ─── Component ───────────────────────────────────────────

interface Props {
  visible: boolean;
  wakeUpTime: string; // "HH:MM"
  bedTime: string; // "HH:MM"
  onConfirm: (wakeUpTime: string, bedTime: string) => void;
  onCancel: () => void;
}

const SleepClockPicker: React.FC<Props> = ({
  visible,
  wakeUpTime,
  bedTime,
  onConfirm,
  onCancel,
}) => {
  const [bed, setBed] = useState(() => parse(bedTime));
  const [wake, setWake] = useState(() => parse(wakeUpTime));

  // Refs for PanResponder (must read current values in callbacks)
  const bedR = useRef(parse(bedTime));
  const wakeR = useRef(parse(wakeUpTime));
  const dragR = useRef<"bed" | "wake" | null>(null);
  const cxyR = useRef({ x: 0, y: 0 });
  const clockRef = useRef<View>(null);

  // Keep refs in sync with state
  useEffect(() => {
    bedR.current = bed;
  }, [bed]);
  useEffect(() => {
    wakeR.current = wake;
  }, [wake]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      const b = parse(bedTime);
      const w = parse(wakeUpTime);
      setBed(b);
      setWake(w);
      bedR.current = b;
      wakeR.current = w;
    }
  }, [visible, bedTime, wakeUpTime]);

  // Measure clock position for touch coordinate mapping
  const measure = useCallback(() => {
    requestAnimationFrame(() => {
      clockRef.current?.measure?.(
        (
          _x: number,
          _y: number,
          _w: number,
          _h: number,
          px: number,
          py: number,
        ) => {
          cxyR.current = { x: px, y: py };
        },
      );
    });
  }, []);

  // PanResponder — created once, uses refs for current state
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant(e: GestureResponderEvent) {
        const tx = e.nativeEvent.pageX - cxyR.current.x;
        const ty = e.nativeEvent.pageY - cxyR.current.y;
        const dist = Math.hypot(tx - CX, ty - CY);

        // Only respond to touches near the arc ring
        if (dist < ARC_R - ARC_W * 0.8 || dist > ARC_R + ARC_W + 20) {
          dragR.current = null;
          return;
        }

        const a = t2a(tx, ty);
        const bA = h2a(bedR.current);
        const wA = h2a(wakeR.current);
        const dB = Math.min(Math.abs(a - bA), 360 - Math.abs(a - bA));
        const dW = Math.min(Math.abs(a - wA), 360 - Math.abs(a - wA));
        dragR.current = dB <= dW ? "bed" : "wake";
      },

      onPanResponderMove(e: GestureResponderEvent) {
        if (!dragR.current) return;
        const tx = e.nativeEvent.pageX - cxyR.current.x;
        const ty = e.nativeEvent.pageY - cxyR.current.y;
        const a = t2a(tx, ty);

        if (dragR.current === "bed") {
          setBed((prev) => {
            const v = angleToDec(a, prev);
            bedR.current = v;
            return v;
          });
        } else {
          setWake((prev) => {
            const v = angleToDec(a, prev);
            wakeR.current = v;
            return v;
          });
        }
      },

      onPanResponderRelease() {
        dragR.current = null;
      },
    }),
  ).current;

  // Derived values
  const bedA = h2a(bed);
  const wakeA = h2a(wake);
  const dur = sleepH(bed, wake);
  const bedPt = a2p(bedA, ARC_R);
  const wakePt = a2p(wakeA, ARC_R);
  const sweep = (((wakeA - bedA) % 360) + 360) % 360;
  const isFullCircle = sweep < 1 && dur > 6;

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible>
      <View style={st.overlay}>
        <View style={st.card}>
          {/* Header */}
          <View style={st.hdr}>
            <TouchableOpacity
              onPress={onCancel}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={26} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={st.title}>Sleep Schedule</Text>
            <TouchableOpacity
              onPress={() => onConfirm(fmt24(wake), fmt24(bed))}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="checkmark" size={26} color="#4CD964" />
            </TouchableOpacity>
          </View>

          {/* Clock */}
          <View
            ref={clockRef}
            style={st.clock}
            onLayout={measure}
            {...pan.panHandlers}
          >
            <Svg width={CLOCK_SIZE} height={CLOCK_SIZE}>
              {/* Clock face background */}
              <Circle cx={CX} cy={CY} r={FACE_R} fill={FACE_CLR} />

              {/* Background track ring */}
              <Circle
                cx={CX}
                cy={CY}
                r={ARC_R}
                fill="none"
                stroke={TRACK_CLR}
                strokeWidth={ARC_W}
              />

              {/* Tick marks */}
              {TICKS.map(({ deg, major }, i) => {
                const p1 = a2p(deg, major ? TICK_R - 10 : TICK_R - 5);
                const p2 = a2p(deg, TICK_R);
                return (
                  <Line
                    key={i}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={major ? TICK_H_CLR : TICK_CLR}
                    strokeWidth={major ? 2 : 1}
                  />
                );
              })}

              {/* Hour numbers */}
              {HOURS.map(({ label, deg }) => {
                const p = a2p(deg, NUM_R);
                return (
                  <SvgText
                    key={label}
                    x={p.x}
                    y={p.y + 5}
                    fill={NUM_CLR}
                    fontSize={14}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                );
              })}

              {/* Arc glow (subtle wider shadow) */}
              {!isFullCircle && sweep > 1 && (
                <Path
                  d={arcD(bedA, wakeA, ARC_R)}
                  fill="none"
                  stroke={ARC_CLR}
                  strokeWidth={ARC_W + 6}
                  strokeLinecap="round"
                  opacity={0.08}
                />
              )}

              {/* Sleep arc */}
              {isFullCircle ? (
                <Circle
                  cx={CX}
                  cy={CY}
                  r={ARC_R}
                  fill="none"
                  stroke={ARC_CLR}
                  strokeWidth={ARC_W}
                  opacity={0.85}
                />
              ) : sweep > 1 ? (
                <Path
                  d={arcD(bedA, wakeA, ARC_R)}
                  fill="none"
                  stroke={ARC_CLR}
                  strokeWidth={ARC_W}
                  strokeLinecap="round"
                  opacity={0.85}
                />
              ) : null}

              {/* Bed handle */}
              <Circle cx={bedPt.x} cy={bedPt.y} r={HANDLE_R} fill={BED_CLR} />
              {/* Wake handle */}
              <Circle
                cx={wakePt.x}
                cy={wakePt.y}
                r={HANDLE_R}
                fill={WAKE_CLR}
              />

              {/* Duration text */}
              <SvgText
                x={CX}
                y={CY - 6}
                fill="#FFFFFF"
                fontSize={22}
                fontWeight="bold"
                textAnchor="middle"
              >
                {`${Math.floor(dur)}h ${Math.round((dur % 1) * 60)}min`}
              </SvgText>
              <SvgText
                x={CX}
                y={CY + 16}
                fill={NUM_CLR}
                fontSize={12}
                textAnchor="middle"
              >
                sleep
              </SvgText>
            </Svg>

            {/* Handle icons (overlay, non-interactive) */}
            <View
              style={[st.ico, { left: bedPt.x - 11, top: bedPt.y - 12 }]}
              pointerEvents="none"
            >
              <Ionicons name="moon" size={22} color="#FFF" />
            </View>
            <View
              style={[st.ico, { left: wakePt.x - 11, top: wakePt.y - 12 }]}
              pointerEvents="none"
            >
              <Ionicons name="sunny" size={22} color="#FFF" />
            </View>
          </View>

          {/* Time readout */}
          <View style={st.readout}>
            <View style={st.rBlock}>
              <Ionicons name="moon-outline" size={18} color={BED_CLR} />
              <Text style={st.rLabel}>Bedtime</Text>
              <Text style={st.rVal}>{fmtDisp(bed)}</Text>
            </View>
            <View style={st.rDiv} />
            <View style={st.rBlock}>
              <Ionicons name="sunny-outline" size={18} color={WAKE_CLR} />
              <Text style={st.rLabel}>Wake Up</Text>
              <Text style={st.rVal}>{fmtDisp(wake)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#000000",
    borderRadius: 24,
    width: CLOCK_SIZE + 56,
    paddingBottom: 28,
    alignItems: "center",
  },
  hdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  clock: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    marginTop: 4,
  },
  ico: {
    position: "absolute",
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  readout: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  rBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  rDiv: {
    width: 1,
    backgroundColor: "#2C2C2E",
    marginVertical: 2,
  },
  rLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  rVal: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});

export default SleepClockPicker;
