import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { HealthID } from "@shared/types";
import { COUNTRIES, FLAG_IMAGES } from "../countries";

interface HealthIDCardProps {
  healthID: HealthID;
  index: number;
  onOptionsPress: (healthID: HealthID) => void;
}

const HealthIDCard: React.FC<HealthIDCardProps> = ({
  healthID,
  index,
  onOptionsPress,
}) => {
  const countryData = COUNTRIES.find((c) => c.code === healthID.countryCode);
  const flagKey = (healthID.countryCode || "").toLowerCase();

  return (
    <View style={[styles.healthIDCard, { marginTop: index === 0 ? 0 : 16 }]}>
      <LinearGradient
        colors={
          (countryData?.gradient ?? ["#667eea", "#764ba2"]) as [string, string]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.countryInfo}>
              {FLAG_IMAGES[flagKey] ? (
                <Image
                  source={FLAG_IMAGES[flagKey]}
                  style={styles.countryFlagImage}
                  resizeMode="contain"
                />
              ) : (
                <LinearGradient
                  colors={
                    (COUNTRIES.find((c) => c.code === healthID.countryCode)
                      ?.gradient ?? ["#555", "#777"]) as [string, string]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.countryBadge}
                />
              )}
              <View style={styles.countryDetails}>
                <Text style={styles.countryName}>{healthID.country}</Text>
                <Text style={styles.idType}>{healthID.idType}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              {healthID.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.idNumber}>{healthID.idNumber}</Text>
            {healthID.notes ? (
              <Text style={styles.notes}>{healthID.notes}</Text>
            ) : null}
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              onPress={() => onOptionsPress(healthID)}
              style={styles.actionButton}
              accessibilityLabel="Edit or delete Health ID"
            >
              <Feather name="edit-2" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  healthIDCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  countryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  countryBadge: {
    width: 67,
    height: 45,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  countryDetails: {
    flex: 1,
  },
  countryName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  idType: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardActions: {
    alignItems: "flex-end",
  },
  primaryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 16,
  },
  idNumber: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  notes: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionButton: {
    padding: 12,
    marginLeft: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  countryFlagImage: {
    width: 67,
    height: 45,
    borderRadius: 0,
    marginRight: 12,
    overflow: "hidden",
  },
});

export default HealthIDCard;
