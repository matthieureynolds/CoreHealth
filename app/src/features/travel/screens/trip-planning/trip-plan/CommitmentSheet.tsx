import React from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { s } from "./TripDetailScreen.styles";
import { TextInput } from "react-native";
import { palette } from "@shared/theme/colors";
import { formatChipDay, hhmmToDate, dateToHHMM } from "./tripTime";
import type { CommitmentDraft } from "./commitmentDraft";
import type { PlanDay } from "@shared/types";

interface Props {
  /** The form's state and rules, from useCommitmentDraft. */
  draft: CommitmentDraft;
  planDays: PlanDay[];
  bottomInset: number;
  onSave: () => void;
}

/**
 * Bottom sheet for adding or editing a commitment on the trip plan.
 *
 * Takes the draft whole rather than seventeen individual fields and setters:
 * the sheet edits one thing, so it should be handed one thing.
 */
const CommitmentSheet: React.FC<Props> = ({
  draft,
  planDays,
  bottomInset,
  onSave,
}) => {
  const { visible, isEditing, value, error, canSave, patch, close } = draft;
  const { title, dayIdx, start, end, openPicker } = value;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View style={s.sheetRoot}>
        <TouchableOpacity
          style={s.sheetBackdrop}
          activeOpacity={1}
          onPress={close}
        />
        <View style={[s.sheet, { paddingBottom: bottomInset + 20 }]}>
          <View style={s.grabber} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>
              {isEditing ? "Edit commitment" : "Add commitment"}
            </Text>
            <TouchableOpacity
              style={[s.tickBtn, !canSave && s.tickBtnDisabled]}
              onPress={onSave}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={palette.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={s.sheetInput}
            placeholder="e.g. Board meeting"
            placeholderTextColor={palette.textSecondary}
            value={title}
            onChangeText={(v) => patch({ title: v })}
          />

          {/* Says why the tick is greyed out, instead of leaving it a dead button. */}
          {error !== null && title.trim().length > 0 && (
            <Text style={s.sheetError}>{error}</Text>
          )}

          <Text style={s.sheetLabel}>DAY</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {planDays.map((day, idx) => {
              const active = idx === dayIdx;
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[s.dayChip, active ? s.dayChipActive : s.dayChipIdle]}
                  onPress={() => patch({ dayIdx: idx })}
                  activeOpacity={0.7}
                >
                  <Text style={s.dayChipText}>
                    {formatChipDay(day.date_local)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={s.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.sheetLabel}>START</Text>
              <TouchableOpacity
                style={[s.timeCard, openPicker === "start" && s.timeCardOpen]}
                onPress={() =>
                  patch({ openPicker: openPicker === "start" ? null : "start" })
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.timeCardValue,
                    openPicker === "start" && s.timeCardValueOpen,
                  ]}
                >
                  {start}
                </Text>
                <Text style={s.timeCardHint}>
                  {openPicker === "start" ? "Roll to adjust" : "Tap to set"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sheetLabel}>END</Text>
              <TouchableOpacity
                style={[s.timeCard, openPicker === "end" && s.timeCardOpen]}
                onPress={() =>
                  patch({ openPicker: openPicker === "end" ? null : "end" })
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.timeCardValue,
                    openPicker === "end" && s.timeCardValueOpen,
                  ]}
                >
                  {end}
                </Text>
                <Text style={s.timeCardHint}>
                  {openPicker === "end" ? "Roll to adjust" : "Tap to set"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {openPicker && (
            <View style={s.wheelWrap}>
              <DateTimePicker
                mode="time"
                display="spinner"
                value={hhmmToDate(openPicker === "start" ? start : end)}
                themeVariant="dark"
                textColor={palette.textPrimary}
                minuteInterval={5}
                style={s.wheel}
                onChange={(_, date) => {
                  if (!date) return;
                  patch(
                    openPicker === "start"
                      ? { start: dateToHHMM(date) }
                      : { end: dateToHHMM(date) },
                  );
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CommitmentSheet;
