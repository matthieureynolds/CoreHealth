import React, { useState, useEffect } from "react";
import { View, TextInput, Alert } from "react-native";
import { Medication } from "@shared/types";
import FormModalShell from "../shared/FormModalShell";
import SuggestionInput from "../shared/SuggestionInput";
import DateField from "../shared/DateField";
import AttachmentsSection from "../shared/AttachmentsSection";
import { useAttachments } from "../shared/useAttachments";
import { formModalStyles as s } from "../shared/formModalStyles";

const COMMON_MEDICATIONS = [
  "Aspirin",
  "Ibuprofen",
  "Acetaminophen",
  "Omeprazole",
  "Lisinopril",
  "Metformin",
  "Atorvastatin",
  "Amlodipine",
  "Losartan",
  "Metoprolol",
  "Hydrochlorothiazide",
  "Sertraline",
  "Escitalopram",
  "Bupropion",
  "Albuterol",
  "Fluticasone",
  "Montelukast",
  "Levothyroxine",
  "Warfarin",
  "Insulin",
  "Glipizide",
  "Gabapentin",
  "Pregabalin",
  "Tramadol",
  "Vitamin D",
  "Vitamin B12",
  "Iron",
  "Calcium",
  "Magnesium",
  "Zinc",
  "Omega-3",
] as const;

interface MedicationFormModalProps {
  visible: boolean;
  editingMedication: Medication | null;
  onClose: () => void;
  onSave: (medication: Medication) => void;
}

const MedicationFormModal: React.FC<MedicationFormModalProps> = ({
  visible,
  editingMedication,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const { attachments, setAttachments, pickFile, removeFile } =
    useAttachments();

  useEffect(() => {
    if (visible) {
      if (editingMedication) {
        setName(editingMedication.name);
        setDosage(editingMedication.dosage || "");
        setFrequency(editingMedication.frequency || "");
        setDuration(editingMedication.duration || "");
        setStartDate(
          editingMedication.startDate
            ? new Date(editingMedication.startDate)
            : null,
        );
        setEndDate(
          editingMedication.endDate
            ? new Date(editingMedication.endDate)
            : null,
        );
        setNotes(editingMedication.notes || "");
        setAttachments(editingMedication.attachments || []);
      } else {
        setName("");
        setDosage("");
        setFrequency("");
        setDuration("");
        setStartDate(null);
        setEndDate(null);
        setNotes("");
        setAttachments([]);
      }
    }
  }, [visible, editingMedication]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a medication name");
      return;
    }
    onSave({
      id: editingMedication?.id ?? Date.now().toString(),
      name: name.trim(),
      dosage: dosage.trim() || undefined,
      frequency: frequency.trim() || undefined,
      startDate: (startDate || new Date()).toISOString().split("T")[0],
      endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
      duration: duration.trim() || undefined,
      notes: notes.trim() || undefined,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  return (
    <FormModalShell
      visible={visible}
      title={editingMedication ? "Edit Medication" : "Add Medication"}
      onClose={onClose}
      onSave={handleSave}
    >
      <View style={s.group}>
        <SuggestionInput
          value={name}
          onChangeText={setName}
          placeholder="Medication Name *"
          suggestions={COMMON_MEDICATIONS}
        />
        <View style={s.divider} />
        <TextInput
          style={s.input}
          placeholder="Dosage (e.g. 500mg)"
          placeholderTextColor="#555"
          value={dosage}
          onChangeText={setDosage}
        />
        <View style={s.divider} />
        <TextInput
          style={s.input}
          placeholder="Frequency (e.g. Twice daily)"
          placeholderTextColor="#555"
          value={frequency}
          onChangeText={setFrequency}
        />
        <View style={s.divider} />
        <TextInput
          style={s.input}
          placeholder="Duration (e.g. 30 days)"
          placeholderTextColor="#555"
          value={duration}
          onChangeText={setDuration}
        />
      </View>

      <DateField
        label="Start Date"
        value={startDate}
        onChange={setStartDate}
        maximumDate={new Date()}
      />
      <DateField label="End Date" value={endDate} onChange={setEndDate} />

      <View style={[s.group, { marginTop: 20 }]}>
        <TextInput
          style={[
            s.input,
            { height: 70, textAlignVertical: "top", paddingTop: 14 },
          ]}
          placeholder="Notes"
          placeholderTextColor="#555"
          value={notes}
          onChangeText={setNotes}
          multiline
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

export default MedicationFormModal;
