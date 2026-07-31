import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Biomarker } from "@shared/types";
import { useNavigation } from "@react-navigation/native";
import { MedicalRecord } from "@shared/types";
import * as Sharing from "expo-sharing";
import { DataService } from "@shared/services/data/dataService";
import { useFocusEffect } from "@react-navigation/native";
import RecordsHeader from "./components/RecordsHeader";
import RecordCard from "./components/RecordCard";
import RecordDetailModal from "./components/RecordDetailModal";
import FilterModal from "./components/FilterModal";
import EditRecordModal from "./components/EditRecordModal";

const RECORD_TYPES = [
  { value: "all", label: "All Records" },
  { value: "lab_result", label: "Lab Results" },
  { value: "imaging", label: "Imaging" },
  { value: "prescription", label: "Prescriptions" },
  { value: "consultation", label: "Consultations" },
  { value: "procedure", label: "Procedures" },
  { value: "other", label: "Other" },
];

const getTypeIcon = (type: string): string => {
  switch (type) {
    case "lab_result":
      return "flask-outline";
    case "imaging":
      return "scan-outline";
    case "prescription":
      return "medical-outline";
    case "consultation":
      return "people-outline";
    case "procedure":
      return "bandage-outline";
    default:
      return "document-outline";
  }
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case "lab_result":
      return "#4CD964";
    case "imaging":
      return "#3AABF0";
    case "prescription":
      return "#FF9500";
    case "consultation":
      return "#6BCF7F";
    case "procedure":
      return "#FF3B30";
    default:
      return "#888";
  }
};

const formatDate = (date: Date): string => date.toLocaleDateString();

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown size";
  const mb = bytes / (1024 * 1024);
  return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

// Map backend lab_results row → app MedicalRecord shape
function rowToMedicalRecord(r: any): MedicalRecord {
  return {
    id: r.id,
    name: r.lab_name || r.file_name || "Lab Result",
    type: "lab_result",
    date: r.report_date ? new Date(r.report_date) : new Date(r.created_at),
    fileUrl: undefined,
    fileSize: undefined,
    notes:
      r.processing_status !== "complete"
        ? `Processing… (${r.processing_status})`
        : r.biomarker_count > 0
          ? `${r.biomarker_count} biomarkers extracted`
          : undefined,
    tags: undefined,
  };
}

const ViewMedicalRecordsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState("");
  const [biomarkerSheet, setBiomarkerSheet] = useState<{
    record: MedicalRecord;
    biomarkers: Biomarker[];
    loading: boolean;
  } | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await DataService.getLabResultDocuments();
      setRecords(rows.map(rowToMedicalRecord));
    } catch (e) {
      console.error("Failed to load lab results:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords]),
  );

  const handleViewRecord = async (record: MedicalRecord) => {
    if (record.notes?.includes("biomarkers extracted")) {
      setBiomarkerSheet({ record, biomarkers: [], loading: true });
      try {
        const bms = await DataService.getBiomarkersForLabResult(record.id);
        setBiomarkerSheet({ record, biomarkers: bms, loading: false });
      } catch {
        setBiomarkerSheet((prev) =>
          prev ? { ...prev, loading: false } : null,
        );
      }
    } else {
      setSelectedRecord(record);
    }
  };

  const deleteRecord = (id: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this medical record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DataService.deleteLabResultDocument(id);
              setRecords((prev) => prev.filter((r) => r.id !== id));
              setSelectedRecord(null);
            } catch (e) {
              Alert.alert("Error", "Could not delete this record.");
            }
          },
        },
      ],
    );
  };

  const shareRecord = async (record: MedicalRecord) => {
    try {
      if (!record.fileUrl) {
        Alert.alert("Share", "No file available to share.");
        return;
      }
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          "Share not available",
          "Sharing is not available on this device.",
        );
        return;
      }
      await Sharing.shareAsync(record.fileUrl, {
        mimeType: record.fileUrl.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : undefined,
        dialogTitle: `Share ${record.name}`,
        UTI: "public.data",
      });
    } catch (e) {
      console.error("Share error", e);
      Alert.alert("Error", "Could not share this record.");
    }
  };

  const openEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setEditName(record.name || "");
    setEditNotes(record.notes || "");
    setEditTags((record.tags || []).join(", "));
    setEditModalVisible(true);
  };

  const saveEditRecord = () => {
    if (!editingRecordId) return;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== editingRecordId) return r;
        const updatedTags = editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        return {
          ...r,
          name: editName.trim() || r.name,
          notes: editNotes.trim() || undefined,
          tags: updatedTags.length ? updatedTags : undefined,
        } as MedicalRecord;
      }),
    );
    setEditModalVisible(false);
    setEditingRecordId(null);
  };

  const filteredRecords = records.filter(
    (record) => selectedFilter === "all" || record.type === selectedFilter,
  );

  const currentFilterLabel =
    RECORD_TYPES.find((t) => t.value === selectedFilter)?.label || "";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <RecordsHeader
          onBack={() => navigation.goBack()}
          onAdd={() => navigation.navigate("UploadMedicalRecord")}
          onFilter={() => setShowFilterModal(true)}
        />

        <View style={styles.filterDisplay}>
          <Text style={styles.filterText}>{currentFilterLabel}</Text>
          <Text style={styles.recordCount}>
            {filteredRecords.length} record
            {filteredRecords.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginTop: 60 }}
            />
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onView={handleViewRecord}
                onEdit={openEditRecord}
                onShare={shareRecord}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                formatDate={formatDate}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Medical Records</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === "all"
                  ? "Upload your first medical record to get started"
                  : `No ${currentFilterLabel.toLowerCase()} found`}
              </Text>
              {selectedFilter === "all" && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => navigation.navigate("UploadMedicalRecord")}
                >
                  <Text style={styles.uploadButtonText}>Upload Record</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <RecordDetailModal
        record={selectedRecord}
        recordTypes={RECORD_TYPES}
        onClose={() => setSelectedRecord(null)}
        onShare={shareRecord}
        onDelete={deleteRecord}
        getTypeIcon={getTypeIcon}
        getTypeColor={getTypeColor}
        formatDate={formatDate}
        formatFileSize={formatFileSize}
      />

      <FilterModal
        visible={showFilterModal}
        selectedFilter={selectedFilter}
        recordTypes={RECORD_TYPES}
        onClose={() => setShowFilterModal(false)}
        onSelect={(value) => {
          setSelectedFilter(value);
          setShowFilterModal(false);
        }}
      />

      <EditRecordModal
        visible={editModalVisible}
        editName={editName}
        editNotes={editNotes}
        editTags={editTags}
        onChangeName={setEditName}
        onChangeNotes={setEditNotes}
        onChangeTags={setEditTags}
        onCancel={() => setEditModalVisible(false)}
        onSave={saveEditRecord}
      />

      {/* Biomarker sheet for processed lab results */}
      <Modal
        visible={!!biomarkerSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBiomarkerSheet(null)}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{biomarkerSheet?.record.name}</Text>
            <TouchableOpacity
              onPress={() => setBiomarkerSheet(null)}
              style={styles.sheetClose}
            >
              <Text style={styles.sheetCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          {biomarkerSheet?.loading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginTop: 60 }}
            />
          ) : (
            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
            >
              {biomarkerSheet?.biomarkers.length === 0 ? (
                <Text style={styles.sheetEmpty}>
                  No biomarkers extracted yet.
                </Text>
              ) : (
                biomarkerSheet?.biomarkers.map((b) => (
                  <View key={b.id} style={styles.sheetRow}>
                    <View style={styles.sheetRowLeft}>
                      <Text style={styles.sheetBiomarkerName}>{b.name}</Text>
                      <Text style={styles.sheetBiomarkerCat}>{b.category}</Text>
                    </View>
                    <View style={styles.sheetRowRight}>
                      <Text
                        style={[
                          styles.sheetBiomarkerValue,
                          {
                            color:
                              b.riskLevel === "high"
                                ? "#FF3B30"
                                : b.riskLevel === "medium"
                                  ? "#FF9500"
                                  : "#30D158",
                          },
                        ]}
                      >
                        {b.value} {b.unit}
                      </Text>
                      <View
                        style={[
                          styles.sheetRiskBadge,
                          {
                            backgroundColor:
                              b.riskLevel === "high"
                                ? "#FF3B3020"
                                : b.riskLevel === "medium"
                                  ? "#FF950020"
                                  : "#30D15820",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sheetRiskText,
                            {
                              color:
                                b.riskLevel === "high"
                                  ? "#FF3B30"
                                  : b.riskLevel === "medium"
                                    ? "#FF9500"
                                    : "#30D158",
                            },
                          ]}
                        >
                          {b.riskLevel === "high"
                            ? "Abnormal"
                            : b.riskLevel === "medium"
                              ? "Borderline"
                              : "Normal"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  filterDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 20,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  recordCount: {
    fontSize: 14,
    color: "#888",
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  uploadButton: {
    backgroundColor: "#3AABF0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  sheetClose: {
    padding: 4,
  },
  sheetCloseText: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "600",
  },
  sheetScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetEmpty: {
    color: "#888",
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  sheetRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  sheetBiomarkerName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  sheetBiomarkerCat: {
    color: "#8E8E93",
    fontSize: 12,
    textTransform: "capitalize",
  },
  sheetRowRight: {
    alignItems: "flex-end",
  },
  sheetBiomarkerValue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  sheetRiskBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sheetRiskText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default ViewMedicalRecordsScreen;
