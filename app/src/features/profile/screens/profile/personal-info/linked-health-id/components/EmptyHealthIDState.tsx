import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyHealthIDStateProps {
  onAddPress: () => void;
}

const EmptyHealthIDState: React.FC<EmptyHealthIDStateProps> = ({
  onAddPress,
}) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="card-outline" size={48} color="#3AABF0" />
    </View>
    <Text style={styles.emptyTitle}>No Health IDs</Text>
    <Text style={styles.emptySubtitle}>
      Add your national health IDs to keep them organized and easily accessible
    </Text>
    <TouchableOpacity style={styles.addFirstButton} onPress={onAddPress}>
      <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.addFirstButtonText}>Add Health ID</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    backgroundColor: "#3AABF0",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3AABF0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmptyHealthIDState;
