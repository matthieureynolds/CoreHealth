import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

type Tab = "library" | "camera";

const ProfilePictureScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library in Settings.",
        [{ text: "OK" }],
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow camera access in Settings.",
        [{ text: "OK" }],
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please choose or take a photo first.");
      return;
    }
    Alert.alert(
      "Profile Picture Updated",
      "Your profile picture has been saved.",
      [{ text: "OK", onPress: () => navigation.goBack() }],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">
          Profile Picture
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={!selectedImage}
        >
          <Text
            style={[
              styles.saveButtonText,
              !selectedImage && styles.saveButtonDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="person" size={64} color="#555" />
          </View>
        )}
        {selectedImage && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-circle" size={28} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "library" && styles.activeTab]}
          onPress={() => setActiveTab("library")}
        >
          <Ionicons
            name="images-outline"
            size={18}
            color={activeTab === "library" ? "#3AABF0" : "#8E8E93"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "library" && styles.activeTabText,
            ]}
          >
            Choose from Library
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "camera" && styles.activeTab]}
          onPress={() => setActiveTab("camera")}
        >
          <Ionicons
            name="camera-outline"
            size={18}
            color={activeTab === "camera" ? "#3AABF0" : "#8E8E93"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "camera" && styles.activeTabText,
            ]}
          >
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "library" ? (
          <View style={styles.actionCard}>
            <Ionicons
              name="images-outline"
              size={48}
              color="#3AABF0"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.actionTitle}>Choose from Library</Text>
            <Text style={styles.actionSubtitle}>
              Select a photo from your camera roll to use as your profile
              picture
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickFromLibrary}
              activeOpacity={0.8}
            >
              <Ionicons
                name="images-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.actionButtonText}>Open Photo Library</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionCard}>
            <Ionicons
              name="camera-outline"
              size={48}
              color="#34C759"
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.actionTitle}>Take a Photo</Text>
            <Text style={styles.actionSubtitle}>
              Use your camera to take a new photo for your profile picture
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#34C759" }]}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.actionButtonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    paddingTop: 72,
    paddingBottom: 12,
    backgroundColor: "#181818",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: { padding: 8, marginTop: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
  },
  saveButton: { padding: 8, marginTop: 16 },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "#3AABF0" },
  saveButtonDisabled: { color: "#555" },
  previewContainer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    position: "relative",
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#3AABF0",
  },
  previewPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  clearButton: { position: "absolute", top: 24, right: "30%" },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: { backgroundColor: "#2C2C2E" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#8E8E93" },
  activeTabText: { color: "#3AABF0", fontWeight: "600" },
  tabContent: { flex: 1, padding: 20 },
  actionCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3AABF0",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default ProfilePictureScreen;
