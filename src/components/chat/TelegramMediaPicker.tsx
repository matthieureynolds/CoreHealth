import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  PanResponder,
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

const { width, height } = Dimensions.get('window');
const H_PADDING = 16;
const GAP = 8;
const availableWidth = width - H_PADDING * 2 - GAP * 2; // 3 columns => 2 gaps
const itemSize = availableWidth / 3; // 3 columns

export const TelegramMediaPicker: React.FC<TelegramMediaPickerProps> = ({
  visible,
  onClose,
  onImageSelected,
  onDocumentSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'file'>('gallery');
  const [recentPhotos, setRecentPhotos] = useState<string[]>([]);
  const photosScrollRef = useRef<ScrollView>(null);
  const midHeight = Math.round(height * 0.42);
  const fullHeight = Math.round(height * 0.9);
  const sheetHeight = useRef(new Animated.Value(midHeight)).current;
  const [expanded, setExpanded] = useState(false);
  const prevOffsetRef = useRef(0);
  const currentHeightRef = useRef(midHeight);

  useEffect(() => {
    if (!visible) {
      sheetHeight.setValue(midHeight);
      setExpanded(false);
    }
  }, [visible]);

  useEffect(() => {
    const id = sheetHeight.addListener(({ value }) => {
      currentHeightRef.current = value as number;
    });
    return () => sheetHeight.removeListener(id);
  }, [sheetHeight]);

  const animateSheet = (toExpanded: boolean) => {
    setExpanded(toExpanded);
    Animated.spring(sheetHeight, {
      toValue: toExpanded ? fullHeight : midHeight,
      useNativeDriver: false,
      damping: 18,
      stiffness: 140,
      mass: 0.9,
    }).start();
  };

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        // no-op
      },
      onPanResponderMove: (_, g) => {
        const start = currentHeightRef.current;
        const next = clamp(start - g.dy, midHeight, fullHeight);
        sheetHeight.setValue(next);
      },
      onPanResponderRelease: () => {
        const threshold = (midHeight + fullHeight) / 2;
        animateSheet(currentHeightRef.current >= threshold);
      },
      onPanResponderTerminate: () => {
        const threshold = (midHeight + fullHeight) / 2;
        animateSheet(currentHeightRef.current >= threshold);
      }
    })
  ).current;

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
            <ScrollView
              ref={photosScrollRef}
              style={styles.photosGrid}
              showsVerticalScrollIndicator={false}
              onScroll={(e) => {
                const y = e.nativeEvent.contentOffset.y;
                // If at mid snap and the user begins scrolling up from top, expand sheet
                if (!expanded && prevOffsetRef.current === 0 && y > 0) {
                  photosScrollRef.current?.scrollTo({ y: 0, animated: false });
                  animateSheet(true);
                }
                prevOffsetRef.current = y;
              }}
              scrollEventThrottle={16}
            >
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

      

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}> 
          {/* Header */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Recents</Text>
            </View>
            <View style={styles.rightSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>{renderTabContent()}</View>

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
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
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
    justifyContent: 'center',
    flex: 1,
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
  rightSpacer: { width: 52 },
  content: {
    flex: 1,
  },
  galleryContainer: {
    flex: 1,
    padding: H_PADDING,
  },
  cameraButton: {
    width: itemSize,
    height: itemSize * 2 + GAP,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginRight: GAP,
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
    justifyContent: 'flex-start',
  },
  photoItem: {
    width: itemSize,
    height: itemSize,
    marginBottom: GAP,
    marginRight: GAP,
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
  // removed location and reply styles
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
