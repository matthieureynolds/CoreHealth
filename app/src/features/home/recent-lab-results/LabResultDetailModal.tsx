import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LabResult } from "./results/types";
import { getStatusColor } from "./utils";
import CurrentResultCard from "./components/CurrentResultCard";
import RangeIndicator from "./components/RangeIndicator";
import BiomarkerDetails, {
  getBiomarkerDetails,
} from "./components/BiomarkerDetails";

interface LabResultDetailModalProps {
  visible: boolean;
  labResult: LabResult | null;
  onClose: () => void;
}

const LabResultDetailModal: React.FC<LabResultDetailModalProps> = ({
  visible,
  labResult,
  onClose,
}) => {
  if (!visible || !labResult) return null;

  const biomarkerDetails = getBiomarkerDetails(labResult.id);
  const statusColor = getStatusColor(labResult.status);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Fixed Header */}
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: `${statusColor}20` },
              ]}
            >
              <Ionicons name="flask" size={32} color={statusColor} />
            </View>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{labResult.name}</Text>
              <Text style={[styles.modalStatus, { color: statusColor }]}>
                {labResult.value} {labResult.unit} •{" "}
                {labResult.status.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScrollContent}
          >
            <CurrentResultCard
              labResult={labResult}
              statusColor={statusColor}
            />

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Range Indicator</Text>
              <RangeIndicator labResult={labResult} />
            </View>

            <BiomarkerDetails details={biomarkerDetails} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  modalStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
});

export default LabResultDetailModal;
