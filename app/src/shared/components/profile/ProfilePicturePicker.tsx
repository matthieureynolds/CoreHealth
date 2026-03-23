import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Circle } from 'react-native-svg';

interface ProfilePicturePickerProps {
  currentPhotoURL?: string;
  onPhotoSelected: (photoURI: string) => void;
  size?: number;
  userInitial?: string; // Add user initial for fallback
  progressPercent?: number; // 0-100 to render circular progress
  showProgressLabel?: boolean; // Whether to show the progress label below avatar
}

const { width: screenWidth } = Dimensions.get('window');

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
  const isComplete = typeof progressPercent === 'number' && progressPercent >= 100;
  // When complete: no ring, avatar full size. Otherwise: ring gap and inset.
  const ringStrokeWidth = Math.max(3, Math.round(size * 0.04));
  const ringGap = 1;
  const inset = isComplete ? 0 : PixelRatio.roundToNearestPixel(ringStrokeWidth / 2 + ringGap);
  const innerSize = PixelRatio.roundToNearestPixel(size - inset * 2);
  const innerRadius = innerSize / 2;

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to change your profile picture.',
        [{ text: 'OK' }]
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
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
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
      console.error('Error choosing photo:', error);
      Alert.alert('Error', 'Failed to choose photo. Please try again.');
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
        [
          { resize: { width: 400, height: 400 } },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onPhotoSelected(processedImage.uri);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => onPhotoSelected('')
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.profilePictureContainer, { width: size, height: size, marginBottom: 8 }]}
        onPress={() => setShowOptions(true)}
        disabled={isLoading}
      >
        {/* Avatar content (inset to create visible gap from ring) */}
        <View style={[
          styles.profilePictureWrapper,
          { position: 'absolute', top: inset, left: inset, width: innerSize, height: innerSize, borderRadius: innerRadius }
        ]}>
          {currentPhotoURL ? (
            <Image source={{ uri: currentPhotoURL }} style={[styles.profilePicture, { borderRadius: innerRadius }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderRadius: innerRadius }]}>
              {userInitial ? (
                <Text style={[styles.avatarInitial, { fontSize: Math.max(18, innerRadius * 0.9) }]}>{userInitial}</Text>
              ) : (
                <Ionicons name="person" size={Math.max(16, innerRadius * 0.8)} color="#666" />
              )}
            </View>
          )}
        </View>

        {/* Progress ring overlay - hidden when profile 100% complete */}
        {!isComplete && (
          <ProgressRing size={size} percent={progressPercent} strokeWidth={ringStrokeWidth} />
        )}
      </TouchableOpacity>

      {/* Progress label below the avatar - hidden when profile 100% complete */}
      {showProgressLabel && !isComplete && (
        <View style={{ alignItems: 'center', marginTop: 6, marginBottom: 10 }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{ color: '#000000', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 }}>
              {`${Math.max(0, Math.min(100, typeof progressPercent === 'number' ? progressPercent : 0))}% COMPLETE`}
            </Text>
          </View>
        </View>
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsContainer}>
            <Text style={styles.modalTitle}>Change Profile Picture</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton} onPress={chooseFromLibrary}>
              <Ionicons name="images" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Choose from Library</Text>
            </TouchableOpacity>
            
            {currentPhotoURL && (
              <TouchableOpacity style={styles.optionButton} onPress={removePhoto}>
                <Ionicons name="trash" size={24} color="#FF3B30" />
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Remove Photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const ProgressRing = ({ size, percent, strokeWidth: strokeWidthProp }: { size: number; percent: number; strokeWidth?: number }) => {
  const strokeWidth = strokeWidthProp ?? Math.max(3, Math.round(size * 0.04)); // Thin ring
  const radius = size / 2 - strokeWidth / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, isNaN(percent) ? 0 : percent));
  const progress = clamped / 100;
  const dashoffset = circumference * (1 - progress);

  return (
    <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center', zIndex: 1, pointerEvents: 'none' as any }}>
      <Svg width={size} height={size}>
        {/* White background ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring - using teal color (we'll add gradient after restart) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#4ECDC4"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  profilePictureContainer: {
    position: 'relative',
    borderRadius: 60,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  profilePictureWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
  },
  avatarInitial: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 16,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ProfilePicturePicker;
