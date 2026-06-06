import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

interface TelegramMediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
  onDocumentSelected: (uri: string, name: string) => void;
}

const { height } = Dimensions.get('window');

export const TelegramMediaPicker: React.FC<TelegramMediaPickerProps> = ({
  visible,
  onClose,
  onImageSelected,
  onDocumentSelected,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }).start();
    } else {
      slideAnim.setValue(height);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handlePhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.error('Error selecting photo:', e);
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Access', 'Please allow camera access in Settings to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      Alert.alert('Camera Unavailable', 'Camera is not available on this device.');
    }
  };

  const handleFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        onDocumentSelected(result.assets[0].uri, result.assets[0].name);
        onClose();
      }
    } catch (e) {
      console.error('Error selecting document:', e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <TouchableWithoutFeedback onPress={dismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
              {/* Handle */}
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              {/* Options row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.optionIcon} onPress={handlePhotos} activeOpacity={0.7}>
                  <Ionicons name="images-outline" size={32} color="#fff" />
                  <Text style={styles.optionLabel}>Photos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionIcon} onPress={handleCamera} activeOpacity={0.7}>
                  <Ionicons name="camera-outline" size={32} color="#fff" />
                  <Text style={styles.optionLabel}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionIcon} onPress={handleFiles} activeOpacity={0.7}>
                  <Ionicons name="share-outline" size={32} color="#fff" />
                  <Text style={styles.optionLabel}>Files</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A3A3C',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  optionIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});
