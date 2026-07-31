import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ExtractedValue {
  name: string;
  value: string;
  unit?: string;
  normal?: string;
  status?: string;
}

interface ExtractedData {
  values?: ExtractedValue[];
  notes?: string;
}

interface ExtractedDataPreviewProps {
  extractedData: ExtractedData;
}

const ExtractedDataPreview: React.FC<ExtractedDataPreviewProps> = ({
  extractedData,
}) => (
  <View style={styles.extractedDataSection}>
    <Text style={styles.sectionTitle}>Extracted Data</Text>
    <View style={styles.extractedDataCard}>
      {extractedData.values?.map((value: any, index: number) => (
        <View key={index} style={styles.dataRow}>
          <Text style={styles.dataLabel}>{value.name}</Text>
          <View style={styles.dataValue}>
            <Text style={styles.dataValueText}>{value.value}</Text>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    value.status === "normal" ? "#30D158" : "#FF9500",
                },
              ]}
            />
          </View>
          <Text style={styles.dataNormal}>{value.normal}</Text>
        </View>
      ))}
      {extractedData.notes && (
        <Text style={styles.dataNotes}>{extractedData.notes}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  extractedDataSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  extractedDataCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1C1E",
    flex: 1,
  },
  dataValue: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  dataValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataNormal: {
    fontSize: 12,
    color: "#8E8E93",
    width: 80,
    textAlign: "right",
  },
  dataNotes: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
});

export default ExtractedDataPreview;
