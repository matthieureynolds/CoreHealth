import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UploadOptionsSectionProps {
  onTakePhoto: () => void;
  onPickDocument: () => void;
}

const UploadOptionsSection: React.FC<UploadOptionsSectionProps> = ({
  onTakePhoto,
  onPickDocument,
}) => (
  <View style={s.group}>
    <TouchableOpacity style={s.row} onPress={onTakePhoto}>
      <Ionicons name="camera-outline" size={20} color="#3AABF0" />
      <Text style={s.rowText}>Take Photo</Text>
      <Ionicons name="chevron-forward" size={18} color="#3A3A3C" />
    </TouchableOpacity>
    <View style={s.divider} />
    <TouchableOpacity style={s.row} onPress={onPickDocument}>
      <Ionicons name="document-outline" size={20} color="#FF9500" />
      <Text style={s.rowText}>Pick Document</Text>
      <Ionicons name="chevron-forward" size={18} color="#3A3A3C" />
    </TouchableOpacity>
  </View>
);

const s = StyleSheet.create({
  group: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
    marginLeft: 12,
    fontWeight: "500",
  },
  divider: { height: 1, backgroundColor: "#3A3A3C", marginLeft: 16 },
});

export default UploadOptionsSection;
