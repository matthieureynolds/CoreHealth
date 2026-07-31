import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PastAppointment } from "@shared/types";

interface AppointmentDetailModalProps {
  appointment: PastAppointment | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onViewAttachment: (apt: PastAppointment) => void;
  formatDate: (d: Date | string) => string;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  onDelete,
  onViewAttachment,
  formatDate,
}) => (
  <Modal
    visible={!!appointment}
    transparent
    animationType="slide"
    presentationStyle="pageSheet"
  >
    {appointment && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Appointment</Text>
            <TouchableOpacity onPress={() => onDelete(appointment.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.detailTitle}>{appointment.title}</Text>
            {appointment.doctor && (
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Doctor:</Text>{" "}
                {appointment.doctor}
              </Text>
            )}
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>{" "}
              {formatDate(appointment.date)}
            </Text>
            {appointment.location && (
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>{" "}
                {appointment.location}
              </Text>
            )}
            {appointment.notes && (
              <Text style={styles.detailNotes}>{appointment.notes}</Text>
            )}
            {appointment.fileUrl && (
              <TouchableOpacity
                style={styles.viewAttachmentButton}
                onPress={() => onViewAttachment(appointment)}
              >
                <Ionicons name="document-attach" size={22} color="#3AABF0" />
                <Text style={styles.viewAttachmentText}>
                  View attachment from doctor
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    )}
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  cancelButton: { fontSize: 16, color: "#8E8E93" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  deleteButton: { fontSize: 16, color: "#FF3B30", fontWeight: "600" },
  modalBody: { padding: 20 },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  detailRow: { fontSize: 15, color: "#E5E5EA", marginBottom: 8 },
  detailLabel: { color: "#8E8E93", fontWeight: "600" },
  detailNotes: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 12,
    lineHeight: 22,
  },
  viewAttachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(0,122,255,0.15)",
    borderRadius: 12,
  },
  viewAttachmentText: {
    fontSize: 16,
    color: "#3AABF0",
    marginLeft: 10,
    fontWeight: "600",
  },
});

export default AppointmentDetailModal;
