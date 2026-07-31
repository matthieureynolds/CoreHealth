import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface CardRowConfig {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
  tallRow?: boolean;
}

interface InfoCardProps {
  title: string;
  rows: CardRowConfig[];
}

const InfoCard: React.FC<InfoCardProps> = ({ title, rows }) => (
  <View style={[styles.card, styles.cardTightBottom]}>
    <Text style={styles.cardHeader}>{title}</Text>
    {rows.map((row, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.cardRow,
          row.tallRow && styles.tallRow50,
          row.isLast && styles.lastRow,
        ]}
        onPress={row.onPress}
      >
        <Ionicons
          name={row.icon}
          size={22}
          color={row.iconColor}
          style={styles.cardIcon}
        />
        <Text style={styles.cardLabel}>{row.label}</Text>
        {row.value !== undefined && (
          <Text style={styles.cardValue}>{row.value}</Text>
        )}
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#888"
          style={styles.chevron}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#181818",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTightBottom: {
    paddingBottom: 0,
  },
  cardHeader: {
    color: "#888",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  tallRow50: {
    height: 50,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardLabel: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  cardValue: {
    color: "#aaa",
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default InfoCard;
