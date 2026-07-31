import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { format } from "date-fns";
import { useSettings } from "@shared/context/SettingsContext";
import type { MedicalEvent } from "../types";
import { AppointmentFields, APPOINTMENT_TYPES } from "./AppointmentFormFields";

export { APPOINTMENT_TYPES };

interface AddAppointmentModalProps {
  visible: boolean;
  editingEvent: MedicalEvent | null;
  onClose: () => void;
  onSave: (event: MedicalEvent) => void;
}

const formatDateBySetting = (date: Date, formatSetting: string): string => {
  if (formatSetting === "DD/MM/YYYY") return format(date, "dd/MM/yyyy");
  if (formatSetting === "MM/DD/YYYY") return format(date, "MM/dd/yyyy");
  return format(date, "MMM d, yyyy");
};

const parseEventDate = (timeString: string): Date | null => {
  try {
    const timeParts = timeString.split("•");
    if (timeParts.length !== 2) return null;
    const datePart = timeParts[0].trim();
    const timePart = timeParts[1].trim();
    let dateToUse = new Date();
    if (datePart.toLowerCase().includes("today")) {
      dateToUse = new Date();
    } else if (datePart.toLowerCase().includes("tomorrow")) {
      dateToUse = new Date();
      dateToUse.setDate(dateToUse.getDate() + 1);
    } else {
      const parsed = new Date(datePart);
      if (!isNaN(parsed.getTime())) dateToUse = parsed;
    }
    const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3];
      if (ampm) {
        if (/pm/i.test(ampm) && hours < 12) hours += 12;
        if (/am/i.test(ampm) && hours === 12) hours = 0;
      }
      dateToUse.setHours(hours, minutes, 0, 0);
      return dateToUse;
    }
  } catch {
    /* fall through */
  }
  return null;
};

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  visible,
  editingEvent,
  onClose,
  onSave,
}) => {
  const { settings } = useSettings();
  const translateY = useRef(new Animated.Value(1000)).current;

  const [title, setTitle] = useState("");
  const [doctor, setDoctor] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [attachedDoc, setAttachedDoc] = useState<{
    uri: string;
    name: string;
    type?: string;
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDoctor(editingEvent.doctor || "");
        setLocation(editingEvent.location || "");
        setNotes(editingEvent.notes || "");
        setAttachedDoc(editingEvent.attachedFile || null);
        setDate(parseEventDate(editingEvent.time));
      } else {
        resetForm();
      }
      translateY.setValue(1000);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible, editingEvent]);

  const resetForm = () => {
    setTitle("");
    setDoctor("");
    setLocation("");
    setDate(null);
    setNotes("");
    setAttachedDoc(null);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim() || !date) return;
    const dateFormatSetting = settings?.general?.dateFormat || "DD/MM/YYYY";
    const is12h = settings?.general?.timeFormat === "12h";
    const timeString = `${formatDateBySetting(date, dateFormatSetting)} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: is12h })}`;
    const event: MedicalEvent = {
      id: editingEvent?.id ?? Date.now().toString(),
      title: title.trim(),
      subtitle: doctor || "Appointment",
      time: timeString,
      status: editingEvent?.status ?? "UPCOMING",
      icon: "medical",
      iconColor: "#3AABF0",
      doctor: doctor || undefined,
      notes: notes || undefined,
      location: location || undefined,
      attachedFile: attachedDoc || undefined,
    };
    onSave(event);
    resetForm();
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.length > 0) {
      setFilteredSuggestions(
        APPOINTMENT_TYPES.filter((t) =>
          t.toLowerCase().includes(text.toLowerCase()),
        ),
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setAttachedDoc(result.assets[0]);
    } catch {
      /* user cancelled */
    }
  };

  const dateFormatSetting = settings?.general?.dateFormat || "DD/MM/YYYY";
  const is12h = settings?.general?.timeFormat === "12h";
  const isValid = title.trim().length > 0 && date !== null;
  const dateLabel = date
    ? `${formatDateBySetting(date, dateFormatSetting)} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: is12h })}`
    : "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          <Animated.View
            style={[styles.sheetContent, { transform: [{ translateY }] }]}
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header} pointerEvents="box-none">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                style={styles.headerButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>
                {editingEvent ? "Edit Appointment" : "Add Appointment"}
              </Text>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                style={styles.headerButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={0.6}
              >
                <Ionicons
                  name="checkmark"
                  size={24}
                  color={isValid ? "#34C759" : "#8E8E93"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bodyContent}
            >
              <AppointmentFields
                title={title}
                doctor={doctor}
                location={location}
                date={date}
                notes={notes}
                attachedDoc={attachedDoc}
                showDatePicker={showDatePicker}
                showSuggestions={showSuggestions}
                filteredSuggestions={filteredSuggestions}
                dateLabel={dateLabel}
                onTitleChange={handleTitleChange}
                onDoctorChange={setDoctor}
                onLocationChange={setLocation}
                onDatePress={() => setShowDatePicker(true)}
                onPickerChange={(_event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
                onNotesChange={setNotes}
                onAttach={handleAttachFile}
                onRemoveAttachment={() => setAttachedDoc(null)}
                onSelectSuggestion={(s) => {
                  setTitle(s);
                  setShowSuggestions(false);
                  setFilteredSuggestions([]);
                }}
              />
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default AddAppointmentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 1000,
    pointerEvents: "box-none",
  },
  sheetContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: { paddingVertical: 8, alignItems: "center" },
  handle: { width: 40, height: 4, backgroundColor: "#3A3A3C", borderRadius: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  body: { flex: 0 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 20 },
});
