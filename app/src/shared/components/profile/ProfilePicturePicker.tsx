import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  Dimensions,
  PixelRatio,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Svg, { Circle } from "react-native-svg";

interface ProfilePicturePickerProps {
  currentPhotoURL?: string;
  onPhotoSelected: (photoURI: string) => void;
  size?: number;
  userInitial?: string; // Add user initial for fallback
  progressPercent?: number; // 0-100 to render circular progress
  showProgressLabel?: boolean; // Whether to show the progress label below avatar
}

const { width: screenWidth } = Dimensions.get("window");

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  currentPhotoURL,
  onPhotoSelected,
  size = 120,
  userInitial,
  progressPercent = 0,
  showProgressLabel = true,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isComplete =
    typeof progressPercent === "number" && progressPercent >= 100;
  // When complete: no ring, avatar full size. Otherwise: ring gap and inset.
  const ringStrokeWidth = Math.max(4, Math.round(size * 0.05));
  const ringGap = 8;
  const inset = isComplete
    ? 0
    : PixelRatio.roundToNearestPixel(ringStrokeWidth / 2 + ringGap);
  const innerSize = PixelRatio.roundToNearestPixel(size - inset * 2);
  const innerRadius = innerSize / 2;

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and photo library permissions are required to change your profile picture.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndCropImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  const chooseFromLibrary = async () => {
    if (!(await requestPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAndCropImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error choosing photo:", error);
      Alert.alert("Error", "Failed to choose photo. Please try again.");
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  const processAndCropImage = async (uri: string) => {
    try {
      // Process the image to ensure it's the right size and format
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400, height: 400 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      onPhotoSelected(processedImage.uri);
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    }
  };

  const removePhoto = () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onPhotoSelected(""),
        },
      ],
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.profilePictureContainer,
          { width: size, height: size, marginBottom: 8 },
        ]}
        onPress={() => setShowOptions(true)}
        disabled={isLoading}
      >
        {/* Avatar content (inset to create visible gap from ring) */}
        <View
          style={[
            styles.profilePictureWrapper,
            {
              position: "absolute",
              top: inset,
              left: inset,
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
            },
          ]}
        >
          {currentPhotoURL ? (
            <Image
              source={{ uri: currentPhotoURL }}
              style={[styles.profilePicture, { borderRadius: innerRadius }]}
            />
          ) : (
            <View
              style={[styles.avatarPlaceholder, { borderRadius: innerRadius }]}
            >
              {userInitial ? (
                <Text
                  style={[
                    styles.avatarInitial,
                    { fontSize: Math.max(18, innerRadius * 0.9) },
                  ]}
                >
                  {userInitial}
                </Text>
              ) : (
                <Ionicons
                  name="person"
                  size={Math.max(16, innerRadius * 0.8)}
                  color="#666"
                />
              )}
            </View>
          )}
        </View>

        {/* Progress ring overlay - hidden when profile 100% complete */}
        {!isComplete && (
          <ProgressRing
            size={size}
            percent={progressPercent}
            strokeWidth={ringStrokeWidth}
          />
        )}

        {/* Progress badge - bottom right, overlapping avatar */}
        {showProgressLabel && !isComplete && (
          <View
            style={{
              position: "absolute",
              bottom: 6,
              right: -44,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 3,
              zIndex: 10,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: "#000000",
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              {`${Math.max(0, Math.min(100, typeof progressPercent === "number" ? progressPercent : 0))}% COMPLETE`}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.optionsContainer}
          >
            {/* Header row: X left, title center */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <View style={{ width: 32 }} />
            </View>

            <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={20} color="#FF9500" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={chooseFromLibrary}
            >
              <Ionicons name="images" size={20} color="#AF52DE" />
              <Text style={styles.optionText}>Choose from Library</Text>
            </TouchableOpacity>

            {currentPhotoURL && (
              <TouchableOpacity
                style={[styles.optionButton, styles.destructiveButton]}
                onPress={removePhoto}
              >
                <Ionicons name="trash" size={20} color="#FF3B30" />
                <Text style={[styles.optionText, { color: "#FF3B30" }]}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const ProgressRing = ({
  size,
  percent,
  strokeWidth: strokeWidthProp,
}: {
  size: number;
  percent: number;
  strokeWidth?: number;
}) => {
  const strokeWidth = strokeWidthProp ?? Math.max(4, Math.round(size * 0.05));
  const radius = size / 2 - strokeWidth / 2;
  const center = size / 2;

  // Full 360° arc, starting at top (0°)
  const fullCircumference = 2 * Math.PI * radius;
  const trackLength = fullCircumference;
  const startAngle = -90; // start at top

  const clamped = Math.max(0, Math.min(100, isNaN(percent) ? 0 : percent));
  const progressLength = (clamped / 100) * trackLength;

  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        pointerEvents: "none" as any,
      }}
    >
      <Svg width={size} height={size}>
        {/* Light gray track arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#C7C7CC"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${trackLength} ${fullCircumference - trackLength}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />
        {/* Teal progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#4ECDC4"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${progressLength} ${fullCircumference - progressLength}`}
          strokeLinecap="butt"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  profilePictureContainer: {
    position: "relative",
    borderRadius: 60,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  profilePictureWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    overflow: "hidden",
  },
  profilePicture: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
  },
  avatarInitial: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 44,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 8,
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
  },
  destructiveButton: {
    marginTop: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 14,
    fontWeight: "500",
  },
});

export default ProfilePicturePicker;
