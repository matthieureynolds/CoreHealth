import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import PickerHeader from './components/PickerHeader';
import GalleryTab from './components/GalleryTab';
import FileTab from './components/FileTab';
import PickerBottomNav from './components/PickerBottomNav';

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
  const [activeTab, setActiveTab] = useState<'gallery' | 'file'>('gallery');
  const [recentPhotos] = useState<string[]>([]);
  const midHeight = Math.round(height * 0.52);
  const fullHeight = Math.round(height * 0.9);
  const sheetHeight = useRef(new Animated.Value(midHeight)).current;
  const [expanded, setExpanded] = useState(false);
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
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, g) => {
        const start = currentHeightRef.current;
        const next = clamp(start - g.dy, midHeight, fullHeight);
        sheetHeight.setValue(next);
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gallery':
        return (
          <GalleryTab
            recentPhotos={recentPhotos}
            expanded={expanded}
            onTakePhoto={handleTakePhoto}
            onSelectPhoto={(uri) => { onImageSelected(uri); }}
            onExpandSheet={() => animateSheet(true)}
          />
        );
      case 'file':
        return (
          <FileTab
            onSelectDocument={handleSelectDocument}
            onSelectFromGallery={handleSelectFromGallery}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
          <PickerHeader onClose={onClose} panHandlers={panResponder.panHandlers} />
          <View style={styles.content}>{renderTabContent()}</View>
          <PickerBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
  content: {
    flex: 1,
  },
});
