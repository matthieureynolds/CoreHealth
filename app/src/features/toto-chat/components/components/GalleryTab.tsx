import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const H_PADDING = 16;
const GAP = 8;
const availableWidth = width - H_PADDING * 2 - GAP * 2;
const itemSize = availableWidth / 3;

interface GalleryTabProps {
  recentPhotos: string[];
  expanded: boolean;
  onTakePhoto: () => void;
  onSelectPhoto: (uri: string) => void;
  onExpandSheet: () => void;
}

const GalleryTab: React.FC<GalleryTabProps> = ({
  recentPhotos,
  expanded,
  onTakePhoto,
  onSelectPhoto,
  onExpandSheet,
}) => {
  const photosScrollRef = useRef<ScrollView>(null);
  const prevOffsetRef = useRef(0);

  return (
    <View style={styles.galleryContainer}>
      <TouchableOpacity style={styles.cameraButton} onPress={onTakePhoto}>
        <View style={styles.cameraIconContainer}>
          <Ionicons name="camera" size={32} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <ScrollView
        ref={photosScrollRef}
        style={styles.photosGrid}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (!expanded && prevOffsetRef.current === 0 && y > 0) {
            photosScrollRef.current?.scrollTo({ y: 0, animated: false });
            onExpandSheet();
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
              onPress={() => onSelectPhoto(photo)}
            >
              <Image source={{ uri: photo }} style={styles.photoImage} />
            </TouchableOpacity>
          ))}
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
};

const styles = StyleSheet.create({
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
    backgroundColor: '#3AABF0',
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
});

export default GalleryTab;
