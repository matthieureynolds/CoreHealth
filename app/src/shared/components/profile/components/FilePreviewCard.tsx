import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface FilePreviewCardProps {
  file: { uri: string; name?: string; size?: number };
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ file }) => (
  <View style={styles.filePreviewSection}>
    <Text style={styles.sectionTitle}>Document Preview</Text>
    <View style={styles.filePreview}>
      {file.uri && (
        <Image source={{ uri: file.uri }} style={styles.previewImage} />
      )}
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{file.name || "Document"}</Text>
        <Text style={styles.fileSize}>
          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "Unknown size"}
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  filePreviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  filePreview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileInfo: {
    alignItems: "center",
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: "#8E8E93",
  },
});

export default FilePreviewCard;
