import React from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { palette } from "@shared/theme/colors";
import { s } from "./TripDetailScreen.styles";

interface Props {
  visible: boolean;
  depCode: string;
  destCode: string;
  /** HH:MM strings, matching how the plan stores flight times. */
  draftRetDep: string;
  draftRetArr: string;
  setDraftRetDep: (v: string) => void;
  setDraftRetArr: (v: string) => void;
  returnFlight: { departureTime: string; arrivalTime: string } | null;
  setReturnFlight: (
    v: { departureTime: string; arrivalTime: string } | null,
  ) => void;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Modal for entering the return leg's departure and arrival times, so the
 * plan can extend past the outbound flight.
 */
const ReturnFlightModal: React.FC<Props> = ({
  visible,
  depCode,
  destCode,
  draftRetDep,
  draftRetArr,
  setDraftRetDep,
  setDraftRetArr,
  returnFlight,
  setReturnFlight,
  onClose,
  onSave,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={() => onClose()}
  >
    <View style={s.modalBackdrop}>
      <View style={s.modalCard}>
        <Text style={s.modalTitle}>
          Return flight ({destCode}→{depCode})
        </Text>
        <View style={s.modalTimeRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.modalLabel}>Departs (local)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="12:00"
              placeholderTextColor={palette.textSecondary}
              value={draftRetDep}
              onChangeText={setDraftRetDep}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.modalLabel}>Arrives (local)</Text>
            <TextInput
              style={s.modalInput}
              placeholder="16:00"
              placeholderTextColor={palette.textSecondary}
              value={draftRetArr}
              onChangeText={setDraftRetArr}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        </View>
        <View style={s.modalBtnRow}>
          {returnFlight ? (
            <TouchableOpacity
              style={[s.modalBtn, s.modalBtnCancel]}
              onPress={() => {
                setReturnFlight(null);
                onClose();
              }}
            >
              <Text style={s.modalBtnCancelText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.modalBtn, s.modalBtnCancel]}
              onPress={() => onClose()}
            >
              <Text style={s.modalBtnCancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.modalBtn, s.modalBtnSave]}
            onPress={onSave}
          >
            <Text style={s.modalBtnSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default ReturnFlightModal;
