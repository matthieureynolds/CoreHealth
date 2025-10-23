import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface TelegramMediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
  onDocumentSelected: (uri: string, name: string) => void;
}

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 3; // 3 columns with padding

export const TelegramMediaPicker: React.FC<TelegramMediaPickerProps> = ({
  visible,
  onClose,
  onImageSelected,
  onDocumentSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'file' | 'location' | 'reply'>('gallery');
  const [recentPhotos, setRecentPhotos] = useState<string[]>([]);

  const handleTakePhoto = async () => {
    try {
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
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSelectFromGallery = async () => {
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
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        onDocumentSelected(result.assets[0].uri, result.assets[0].name);
        onClose();
      }
    } catch (error) {
      console.error('Error selecting document:', error);
    }
  };

  const handleLocation = () => {
    // TODO: Implement location sharing
    console.log('Location sharing not implemented yet');
  };

  const handleReply = () => {
    // TODO: Implement reply functionality
    console.log('Reply functionality not implemented yet');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gallery':
        return (
          <View style={styles.galleryContainer}>
            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Recent Photos Grid */}
            <ScrollView style={styles.photosGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {recentPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    onPress={() => onImageSelected(photo)}
                  >
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                  </TouchableOpacity>
                ))}
                
                {/* Placeholder for more photos */}
                {recentPhotos.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="images" size={48} color="#8E8E93" />
                    <Text style={styles.emptyStateText}>No recent photos</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        );

      case 'file':
        return (
          <View style={styles.fileContainer}>
            <TouchableOpacity style={styles.fileOption} onPress={handleSelectDocument}>
              <Ionicons name="document" size={24} color="#007AFF" />
              <Text style={styles.fileOptionText}>Select Document</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.fileOption} onPress={handleSelectFromGallery}>
              <Ionicons name="image" size={24} color="#007AFF" />
              <Text style={styles.fileOptionText}>Select Image</Text>
            </TouchableOpacity>
          </View>
        );

      case 'location':
        return (
          <View style={styles.locationContainer}>
            <TouchableOpacity style={styles.locationOption} onPress={handleLocation}>
              <Ionicons name="location" size={24} color="#007AFF" />
              <Text style={styles.locationOptionText}>Share Current Location</Text>
            </TouchableOpacity>
          </View>
        );

      case 'reply':
        return (
          <View style={styles.replyContainer}>
            <Text style={styles.replyText}>Reply functionality coming soon</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Recents</Text>
            <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'gallery' && styles.navItemActive]}
            onPress={() => setActiveTab('gallery')}
          >
            <Ionicons 
              name="images" 
              size={24} 
              color={activeTab === 'gallery' ? '#007AFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.navItemText,
              activeTab === 'gallery' && styles.navItemTextActive
            ]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'file' && styles.navItemActive]}
            onPress={() => setActiveTab('file')}
          >
            <Ionicons 
              name="document-text" 
              size={24} 
              color={activeTab === 'file' ? '#007AFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.navItemText,
              activeTab === 'file' && styles.navItemTextActive
            ]}>
              File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'location' && styles.navItemActive]}
            onPress={() => setActiveTab('location')}
          >
            <Ionicons 
              name="location" 
              size={24} 
              color={activeTab === 'location' ? '#007AFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.navItemText,
              activeTab === 'location' && styles.navItemTextActive
            ]}>
              Location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, activeTab === 'reply' && styles.navItemActive]}
            onPress={() => setActiveTab('reply')}
          >
            <Ionicons 
              name="arrow-undo" 
              size={24} 
              color={activeTab === 'reply' ? '#007AFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.navItemText,
              activeTab === 'reply' && styles.navItemTextActive
            ]}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  galleryContainer: {
    flex: 1,
    padding: 16,
  },
  cameraButton: {
    width: itemSize,
    height: itemSize,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cameraIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosGrid: {
    flex: 1,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: itemSize,
    height: itemSize,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  fileContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  fileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
  },
  fileOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  locationContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  locationOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  replyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
    backgroundColor: '#000000',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    // Active state styling handled by text/icon colors
  },
  navItemText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#007AFF',
  },
});
