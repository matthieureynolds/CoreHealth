import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageInputModalProps {
  visible: boolean;
  selectedImage: { uri: string } | null;
  imageInputText: string;
  onTextChange: (text: string) => void;
  onClose: () => void;
  onSend: () => void;
  styles: typeof import('../HealthAssistantScreen.styles').styles;
}

const ImageInputModal: React.FC<ImageInputModalProps> = ({
  visible,
  selectedImage,
  imageInputText,
  onTextChange,
  onClose,
  onSend,
  styles,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.imageModalOverlay}>
        <View style={styles.imageModalCard}>
          <View style={styles.imageModalHeader}>
            <Text style={styles.imageModalTitle}>Add Image</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {selectedImage && (
            <View style={{ marginBottom: 20 }}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
            </View>
          )}
          <TextInput
            style={styles.imageInputField}
            placeholder="Add a message with your image (optional)..."
            placeholderTextColor="#8E8E93"
            value={imageInputText}
            onChangeText={onTextChange}
            multiline
            maxLength={500}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.imageModalCancelBtn} onPress={onClose}>
              <Text style={styles.imageModalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageModalSendBtn} onPress={onSend}>
              <Text style={styles.imageModalBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

export default ImageInputModal;
