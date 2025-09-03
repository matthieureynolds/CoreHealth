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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface ProfilePicturePickerProps {
  currentPhotoURL?: string;
  onPhotoSelected: (photoURI: string) => void;
  size?: number;
  userInitial?: string; // Add user initial for fallback
}

const { width: screenWidth } = Dimensions.get('window');

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  currentPhotoURL,
  onPhotoSelected,
  size = 120,
  userInitial,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        style={[styles.profilePictureContainer, { width: size, height: size }]}
        onPress={() => setShowOptions(true)}
        disabled={isLoading}
      >
        {currentPhotoURL ? (
          <Image source={{ uri: currentPhotoURL }} style={styles.profilePicture} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            {userInitial ? (
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            ) : (
              <Ionicons name="person" size={size * 0.4} color="#666" />
            )}
          </View>
        )}
        
        {/* Camera icon overlay - only show when no photo */}
        {!currentPhotoURL && (
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  profilePictureContainer: {
    position: 'relative',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#333',
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
    backgroundColor: '#333',
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
