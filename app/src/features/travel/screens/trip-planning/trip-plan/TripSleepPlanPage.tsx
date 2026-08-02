import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { palette } from "@shared/theme/colors";
import type { PlanDay, Commitment } from "@shared/types";
import { s } from "./TripDetailScreen.styles";
import { formatChipDay, formatDayHeader } from "./tripTime";
import {
  hourLabel,
  buildRail,
  CAP_STYLE,
  CAP_HEAD,
  MARK_TINT,
  HOUR_H,
  RAIL_H,
  yForMin,
} from "./tripRail";
import { CAP_W, MARK, colCenterX } from "./railLayout";

interface Props {
  planDays: PlanDay[];
  selectedDayIdx: number;
  setSelectedDayIdx: (i: number) => void;
  depCode: string;
  destCode: string;
  hasReturn: boolean;
  leg: "outbound" | "return";
  switchLeg: (next: "outbound" | "return") => void;
  returnFlight: { departureTime: string; arrivalTime: string } | null;
  commitments: Commitment[];
  onRemoveCommitment: (c: Commitment) => void;
  onShowReturnForm: () => void;
  onAddCommitment: () => void;
  onEditCommitment: (c: Commitment) => void;
}

/**
 * The sleep-plan page: the 24-hour rail for the selected day, the day chips
 * above it, and the commitments list below.
 *
 * The rail geometry itself lives in tripRail.ts; this renders it. Extracted so
 * TripDetailScreen's body could come under the 400-line limit — it was 870.
 */
const TripSleepPlanPage: React.FC<Props> = ({
  planDays,
  selectedDayIdx,
  setSelectedDayIdx,
  depCode,
  destCode,
  hasReturn,
  leg,
  switchLeg,
  returnFlight,
  commitments,
  onRemoveCommitment,
  onShowReturnForm,
  onAddCommitment,
  onEditCommitment,
}) => {
  const selectedDay = planDays[selectedDayIdx] || planDays[0];
  return (
    <ScrollView
      key="sleep"
      contentContainerStyle={{ paddingBottom: 90 + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {hasReturn && (
        <View style={s.legToggleRow}>
          <TouchableOpacity
            style={[s.legToggle, leg === "outbound" && s.legToggleActive]}
            onPress={() => switchLeg("outbound")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                s.legToggleText,
                leg === "outbound" && s.legToggleTextActive,
              ]}
            >
              Outbound {depCode}→{destCode}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.legToggle, leg === "return" && s.legToggleActive]}
            onPress={() => switchLeg("return")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                s.legToggleText,
                leg === "return" && s.legToggleTextActive,
              ]}
            >
              Return {destCode}→{depCode}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {hasReturn && leg === "return" && (
        <TouchableOpacity
          style={s.returnFlightRow}
          onPress={onShowReturnForm}
          activeOpacity={0.7}
        >
          <Ionicons
            name="airplane"
            size={16}
            color={palette.link}
            style={{ transform: [{ rotate: "180deg" }] }}
          />
          <Text style={s.returnFlightText}>
            {returnFlight
              ? `Return flight ${returnFlight.departureTime}→${returnFlight.arrivalTime}`
              : "Set your return flight time for an accurate plan"}
          </Text>
          <Text style={s.returnFlightEdit}>
            {returnFlight ? "Edit" : "Add"}
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.chipStrip}
        contentContainerStyle={s.chipStripContent}
      >
        {planDays.map((day, idx) => {
          const isActive = idx === selectedDayIdx;
          const chipLabel =
            day.location.segment === "in_flight"
              ? "✈ Flight"
              : day.location.label;
          return (
            <TouchableOpacity
              key={day.id}
              style={[s.chip, isActive && s.chipActive]}
              onPress={() => setSelectedDayIdx(idx)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipDay, isActive && s.chipDayActive]}>
                {formatChipDay(day.date_local)}
              </Text>
              <Text style={[s.chipSub, isActive && s.chipSubActive]}>
                {chipLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedDay && (
        <View style={s.dayHeader}>
          <Text style={s.dayHeaderTitle}>
            {formatDayHeader(selectedDay.date_local)}
          </Text>
          <Text style={s.dayHeaderLoc}>{selectedDay.location.label}</Text>
        </View>
      )}

      {selectedDay &&
        (() => {
          const { caps, marks } = buildRail(selectedDay.actions);
          return (
            <View style={s.rail}>
              {/* vertical frame rails at the plot edges */}
              <View style={[s.railVLine, { left: 34 }]} />
              <View style={[s.railVLine, { right: 34 }]} />
              {/* hour gridlines + labels both sides */}
              {Array.from({ length: 25 }).map((_, h) =>
                h % 2 === 0 ? (
                  <View
                    key={`hl-${h}`}
                    style={[s.railHourLine, { top: h * HOUR_H }]}
                  >
                    <Text style={s.railHourL}>{hourLabel(h)}</Text>
                    <Text style={s.railHourR}>{hourLabel(h)}</Text>
                  </View>
                ) : null,
              )}
              {/* duration capsules */}
              {caps.map((c, i) => {
                const cs = CAP_STYLE[c.style];
                const top = Math.max(yForMin(c.s), 0);
                const bottom = Math.min(
                  Math.max(yForMin(c.e), yForMin(c.s) + CAP_W),
                  RAIL_H,
                );
                const headGlyph = CAP_HEAD[c.style];
                return (
                  <View
                    key={`cap-${i}`}
                    style={[
                      s.railCap,
                      {
                        top,
                        height: bottom - top,
                        left: colCenterX(c.col) - CAP_W / 2,
                        backgroundColor: cs.bg,
                        borderWidth: cs.border ? 1.5 : 0,
                        borderColor: cs.border ?? "transparent",
                      },
                    ]}
                  >
                    {headGlyph && (
                      <Ionicons
                        name={headGlyph}
                        size={15}
                        color={palette.textPrimary}
                        style={{
                          position: "absolute",
                          top: (CAP_W - 15) / 2,
                          left: (CAP_W - 15) / 2,
                        }}
                      />
                    )}
                  </View>
                );
              })}
              {/* point-in-time icon chips (events with no duration capsule) */}
              {marks.map((m, i) => {
                const tint = MARK_TINT[m.tint];
                const top = Math.min(
                  Math.max(yForMin(m.at) - MARK / 2, 0),
                  RAIL_H - MARK,
                );
                const left = colCenterX(m.col) - MARK / 2;
                return (
                  <View key={`mk-${i}`} style={[s.railMarkRow, { top, left }]}>
                    <View
                      style={[
                        s.railMark,
                        { backgroundColor: tint.bg, borderColor: tint.bg },
                      ]}
                    >
                      <Ionicons name={tint.glyph} size={15} color={tint.icon} />
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}

      {/* Commitments — meetings/events the plan keeps you alert for */}
      <View style={s.commitSection}>
        <View style={s.commitHeaderRow}>
          <Text style={s.commitHeader}>Commitments</Text>
          <TouchableOpacity
            onPress={onAddCommitment}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={s.commitAdd}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {commitments.length === 0 ? (
          <Text style={s.commitEmpty}>
            Add a meeting or event and the plan will keep you sharp for it.
          </Text>
        ) : (
          commitments
            .slice()
            .sort((a, b) =>
              (a.date_local + a.start_local).localeCompare(
                b.date_local + b.start_local,
              ),
            )
            .map((c) => (
              <Swipeable
                key={c.id}
                friction={2}
                rightThreshold={80}
                dragOffsetFromRightEdge={30}
                containerStyle={s.commitSwipeContainer}
                renderRightActions={() => (
                  <View style={s.commitActions}>
                    <RectButton
                      style={[s.commitAction, s.commitActionEdit]}
                      onPress={() => onEditCommitment(c)}
                    >
                      <Ionicons
                        name="pencil"
                        size={20}
                        color={palette.textPrimary}
                      />
                      <Text style={s.commitActionText}>Edit</Text>
                    </RectButton>
                    <RectButton
                      style={[s.commitAction, s.commitActionDelete]}
                      onPress={() => onRemoveCommitment(c)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={palette.textPrimary}
                      />
                      <Text style={s.commitActionText}>Remove</Text>
                    </RectButton>
                  </View>
                )}
              >
                <View style={s.commitCard}>
                  <View style={s.commitIcon}>
                    <Ionicons name="calendar" size={16} color={palette.pink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.commitTitle}>{c.title}</Text>
                    <Text style={s.commitMeta}>
                      {formatChipDay(c.date_local)} · {c.start_local}–
                      {c.end_local}
                    </Text>
                  </View>
                </View>
              </Swipeable>
            ))
        )}
      </View>
    </ScrollView>
  );
};

export default TripSleepPlanPage;
