import React, { useState, useEffect } from "react";
import { View, TextInput, Alert } from "react-native";
import { Screening } from "@shared/types";
import FormModalShell from "../shared/FormModalShell";
import SuggestionInput from "../shared/SuggestionInput";
import ChipSelector from "../shared/ChipSelector";
import DateField from "../shared/DateField";
import AttachmentsSection from "../shared/AttachmentsSection";
import { useAttachments } from "../shared/useAttachments";
import { formModalStyles as s } from "../shared/formModalStyles";

const COMMON_SCREENINGS = [
  "Blood Pressure",
  "Cholesterol",
  "Blood Sugar",
  "Hemoglobin A1C",
  "Complete Blood Count (CBC)",
  "Comprehensive Metabolic Panel (CMP)",
  "Thyroid Function Test",
  "PSA Test",
  "Mammogram",
  "Pap Smear",
  "Colonoscopy",
  "Bone Density Test (DEXA)",
  "Eye Exam",
  "Dental Exam",
  "Skin Cancer Screening",
  "Lung Cancer Screening",
  "ECG/EKG",
  "Chest X-Ray",
  "CT Scan",
  "MRI",
  "Ultrasound",
] as const;

interface ScreeningFormModalProps {
  visible: boolean;
  editingScreening: Screening | null;
  onClose: () => void;
  onSave: (screening: Screening) => void;
}

const ScreeningFormModal: React.FC<ScreeningFormModalProps> = ({
  visible,
  editingScreening,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [screeningDate, setScreeningDate] = useState<Date | null>(null);
  const [result, setResult] = useState<"normal" | "abnormal" | "inconclusive">(
    "normal",
  );
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const { attachments, setAttachments, pickFile, removeFile } =
    useAttachments();

  useEffect(() => {
    if (visible) {
      if (editingScreening) {
        setName(editingScreening.name);
        setScreeningDate(
          editingScreening.date ? new Date(editingScreening.date) : new Date(),
        );
        setResult(editingScreening.result);
        setNextDueDate(
          editingScreening.nextDue
            ? new Date(editingScreening.nextDue as any)
            : null,
        );
        setLocation(editingScreening.location || "");
        setNotes(editingScreening.notes || "");
        setAttachments(editingScreening.attachments || []);
      } else {
        setName("");
        setScreeningDate(null);
        setResult("normal");
        setNextDueDate(null);
        setLocation("");
        setNotes("");
        setAttachments([]);
      }
    }
  }, [visible, editingScreening]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a screening name");
      return;
    }
    onSave({
      id: editingScreening?.id ?? Date.now().toString(),
      name: name.trim(),
      date: screeningDate || new Date(),
      result,
      nextDue: nextDueDate || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  return (
    <FormModalShell
      visible={visible}
      title={editingScreening ? "Edit Screening" : "Add Screening"}
      onClose={onClose}
      onSave={handleSave}
    >
      <View style={s.group}>
        <SuggestionInput
          value={name}
          onChangeText={setName}
          placeholder="Screening name *"
          suggestions={COMMON_SCREENINGS}
        />
      </View>

      <DateField
        label="Screening Date"
        value={screeningDate}
        onChange={setScreeningDate}
        maximumDate={new Date()}
      />

      <ChipSelector
        label="Result"
        options={["normal", "abnormal", "inconclusive"] as const}
        selected={result}
        onSelect={setResult}
      />

      <DateField
        label="Next Due Date"
        value={nextDueDate}
        onChange={setNextDueDate}
      />

      <View style={[s.group, { marginTop: 20 }]}>
        <TextInput
          style={s.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Location"
          placeholderTextColor="#555"
        />
        <View style={s.divider} />
        <TextInput
          style={[s.input, { height: 80, textAlignVertical: "top" }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
        />
      </View>

      <AttachmentsSection
        attachments={attachments}
        onAdd={pickFile}
        onRemove={removeFile}
      />
    </FormModalShell>
  );
};

export default ScreeningFormModal;
