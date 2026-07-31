import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import FileViewerModal from "@shared/components/modals/FileViewerModal";
import { useNavigation } from "@react-navigation/native";
import { MedicalCondition } from "@shared/types";
import ConditionFormModal from "./ConditionFormModal";
import { useHealthRecordList } from "../hooks/useHealthRecordList";
import { DataService } from "@shared/services/data/dataService";

const SEVERITY_COLORS: Record<string, string> = {
  mild: "#4CD964",
  moderate: "#FF9500",
  severe: "#FF3B30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#FF3B30",
  resolved: "#4CD964",
  managed: "#3AABF0",
};

interface ConditionRow {
  id: string;
  name: string;
  severity?: string;
  status?: string;
  diagnosed_date?: string;
  resolved_date?: string;
  notes?: string;
}

const conditionConfig = {
  loadFn: async (userId: string): Promise<MedicalCondition[]> => {
    const rows: ConditionRow[] = await DataService.getConditions(userId);
    return rows.map((c) => ({
      id: c.id,
      condition: c.name,
      severity: (c.severity ?? "mild") as MedicalCondition["severity"],
      status: (c.status ?? "active") as MedicalCondition["status"],
      diagnosedDate: c.diagnosed_date ?? new Date().toISOString(),
      resolvedDate: c.resolved_date ?? undefined,
      notes: c.notes ?? undefined,
    }));
  },
  saveFn: async (
    userId: string,
    condition: MedicalCondition,
    isEdit: boolean,
  ) => {
    const payload = {
      name: condition.condition,
      severity: condition.severity,
      status: condition.status,
      diagnosedDate: condition.diagnosedDate,
      resolvedDate: condition.resolvedDate,
      notes: condition.notes,
    };
    if (isEdit) {
      await DataService.updateCondition(userId, condition.id, payload);
      return condition;
    }
    const saved = await DataService.addCondition(userId, payload);
    return { ...condition, id: saved.id };
  },
  deleteFn: (userId: string, id: string) =>
    DataService.deleteCondition(userId, id),
  recordName: "Condition",
  getItemName: (c: MedicalCondition) => c.condition,
};

const ConditionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    items: conditions,
    loading,
    showModal,
    editingItem,
    handleSave,
    openOptions,
    openAddModal,
    closeModal,
    fileViewer,
  } = useHealthRecordList(conditionConfig);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">
          Medical Conditions
        </Text>
        <TouchableOpacity
          onPress={openAddModal}
          style={styles.addButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="add" size={24} color="#3AABF0" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 95 }}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginTop: 40 }}
            />
          ) : conditions.length ? (
            conditions.map((condition) => {
              const severityColor =
                SEVERITY_COLORS[condition.severity] ?? "#888";
              const statusColor = STATUS_COLORS[condition.status] ?? "#888";
              return (
                <View key={condition.id} style={styles.conditionCard}>
                  <View style={styles.conditionHeader}>
                    <View style={styles.conditionHeaderLeft}>
                      <View style={styles.conditionIcon}>
                        <Ionicons
                          name="medkit-outline"
                          size={20}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.conditionInfo}>
                        <Text style={styles.conditionName}>
                          {condition.condition}
                        </Text>
                        <View style={styles.conditionTagsRow}>
                          <View
                            style={[
                              styles.pillTag,
                              {
                                backgroundColor: severityColor + "20",
                                borderColor: severityColor,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pillTagText,
                                { color: severityColor },
                              ]}
                            >
                              {condition.severity.charAt(0).toUpperCase() +
                                condition.severity.slice(1)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.pillTag,
                              {
                                backgroundColor: statusColor + "20",
                                borderColor: statusColor,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pillTagText,
                                { color: statusColor },
                              ]}
                            >
                              {condition.status.charAt(0).toUpperCase() +
                                condition.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => openOptions(condition)}
                      style={styles.editPenButton}
                      accessibilityLabel="Edit condition"
                    >
                      <Feather name="edit-2" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.conditionMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.metaText}>
                        Diagnosed: {formatDate(condition.diagnosedDate)}
                      </Text>
                    </View>
                    {condition.resolvedDate && (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="checkmark-done-outline"
                          size={16}
                          color="#8E8E93"
                        />
                        <Text style={styles.metaText}>
                          Resolved: {formatDate(condition.resolvedDate)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {condition.notes && (
                    <Text style={styles.notes}>{condition.notes}</Text>
                  )}

                  {!!condition.attachments?.length && (
                    <View style={[styles.conditionMeta, { marginTop: 10 }]}>
                      <View style={styles.attachmentsRow}>
                        {condition.attachments.map((file) => (
                          <TouchableOpacity
                            key={file.uri}
                            style={styles.attachmentChip}
                            onPress={() =>
                              fileViewer.handleViewFile(
                                file.uri,
                                file.name,
                                file.type,
                              )
                            }
                          >
                            <Ionicons
                              name={
                                file.type?.includes("pdf")
                                  ? "document-outline"
                                  : "image-outline"
                              }
                              size={14}
                              color="#FFFFFF"
                            />
                            <Text
                              style={styles.attachmentText}
                              numberOfLines={1}
                            >
                              {file.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Conditions</Text>
              <Text style={styles.emptySubtitle}>
                Add your medical conditions to keep track of your health
              </Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={openAddModal}
              >
                <Text style={styles.addFirstButtonText}>Add Condition</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <ConditionFormModal
        visible={showModal}
        editingCondition={editingItem}
        onClose={closeModal}
        onSave={handleSave}
      />

      <FileViewerModal
        visible={fileViewer.fileViewerVisible}
        onClose={fileViewer.closeFileViewer}
        fileUri={fileViewer.currentFileUri}
        fileName={fileViewer.currentFileName}
        fileType={fileViewer.currentFileType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollView: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#000000",
    zIndex: 1000,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  backButton: { padding: 8, width: 40 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  addButton: { padding: 8, width: 40, alignItems: "flex-end" },
  content: { padding: 20 },
  conditionCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3AABF0",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conditionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  conditionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3AABF033",
    alignItems: "center",
    justifyContent: "center",
  },
  conditionInfo: { flex: 1 },
  conditionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  conditionTagsRow: { flexDirection: "row", gap: 8 },
  pillTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillTagText: { fontSize: 12, fontWeight: "600" },
  editPenButton: { position: "absolute", top: 6, right: 6, padding: 6 },
  conditionMeta: { marginTop: 12, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: "#A0A0A0" },
  attachmentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  attachmentText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 6,
    maxWidth: 140,
  },
  notes: { fontSize: 13, color: "#C7C7CC", marginTop: 10 },
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
  addFirstButton: {
    backgroundColor: "#3AABF0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default ConditionsScreen;
