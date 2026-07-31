import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Doctor } from "@shared/types";

interface DoctorCardProps {
  doctor: Doctor;
  onCall: (doctor: Doctor) => void;
  onEmail: (doctor: Doctor) => void;
  onOptions: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onCall,
  onEmail,
  onOptions,
}) => (
  <View style={styles.doctorCard}>
    <View style={styles.doctorHeader}>
      <View style={styles.headerLeft}>
        <View style={styles.doctorIcon}>
          <Ionicons name="medical-outline" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          {!!doctor.office && (
            <Text style={styles.doctorOffice}>{doctor.office}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.moreButton, { position: "absolute", top: 6, right: 6 }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => onOptions(doctor)}
        accessibilityLabel="Edit doctor"
      >
        <Feather name="edit-2" size={18} color="#3AABF0" />
      </TouchableOpacity>
    </View>

    <View style={styles.contactActions}>
      <TouchableOpacity
        style={styles.actionChip}
        onPress={() => onCall(doctor)}
      >
        <Ionicons name="call-outline" size={18} color="#3AABF0" />
        <Text style={styles.actionChipText}>Call</Text>
      </TouchableOpacity>
      {doctor.email && (
        <TouchableOpacity
          style={styles.actionChip}
          onPress={() => onEmail(doctor)}
        >
          <Ionicons name="mail-outline" size={18} color="#3AABF0" />
          <Text style={styles.actionChipText}>Email</Text>
        </TouchableOpacity>
      )}
    </View>

    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <Ionicons name="call-outline" size={16} color="#8E8E93" />
        <Text style={styles.detailText}>{doctor.phone}</Text>
      </View>
      {doctor.email && (
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{doctor.email}</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Ionicons name="business-outline" size={16} color="#8E8E93" />
        <Text style={styles.detailText}>{doctor.office}</Text>
      </View>
      {doctor.address && (
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{doctor.address}</Text>
        </View>
      )}
      {doctor.notes && (
        <View style={styles.detailRow}>
          <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{doctor.notes}</Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  doctorCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3AABF033",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3AABF014",
    borderWidth: 1,
    borderColor: "#3AABF033",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#8E8E93",
  },
  doctorOffice: {
    fontSize: 13,
    color: "#A0A0A0",
    marginTop: 2,
  },
  moreButton: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    borderColor: "transparent",
  },
  contactActions: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3AABF0",
    flex: 1,
  },
  actionChipText: {
    color: "#3AABF0",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 8,
    flex: 1,
  },
});

export default DoctorCard;
