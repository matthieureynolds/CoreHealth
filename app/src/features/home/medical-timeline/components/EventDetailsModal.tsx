import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Linking,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { MedicalEvent } from '../types';

interface EventDetailsModalProps {
  visible: boolean;
  event: MedicalEvent | null;
  onClose: () => void;
  onEdit: (event: MedicalEvent) => void;
  onViewFile: (fileUri: string, fileName: string, fileType?: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  visible,
  event,
  onClose,
  onEdit,
  onViewFile,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: 1000,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(0);
      onClose();
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleSwipeEnd = (gestureEvent: any) => {
    const { translationY: ty, velocityY } = gestureEvent.nativeEvent;
    if (ty > 50 || velocityY > 500) {
      dismiss();
    } else {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  };

  const openMaps = (location: string) => {
    Alert.alert(
      'Navigate to Location',
      `How would you like to navigate to ${location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apple Maps',
          onPress: () => {
            const dest = encodeURIComponent(location);
            Linking.openURL(`http://maps.apple.com/?daddr=${dest}`);
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const dest = encodeURIComponent(location);
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={dismiss}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          <Animated.View
            style={[styles.sheetContent, { transform: [{ translateY }] }]}
            pointerEvents="auto"
          >
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={(e) => {
                if (e.nativeEvent.state === State.END) handleSwipeEnd(e);
              }}
              activeOffsetY={[-10, 1000]}
              failOffsetX={[-50, 50]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            </PanGestureHandler>

            <View style={styles.header}>
              <View style={{ width: 32 }} />
              <Text style={styles.headerTitle}>{event?.title}</Text>
              <TouchableOpacity
                onPress={() => event && onEdit(event)}
                style={styles.editButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={20} color="#FF9500" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bodyContent}
            >
              {event?.doctor && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Doctor</Text>
                  <Text style={styles.sectionValue}>{event.doctor}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Date & Time</Text>
                <Text style={styles.sectionValue}>{event?.time}</Text>
              </View>

              {event?.location && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Location</Text>
                  <TouchableOpacity onPress={() => openMaps(event.location!)}>
                    <Text style={[styles.sectionValue, styles.link]}>{event.location}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {event?.notes && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Notes</Text>
                  <Text style={styles.sectionValue}>{event.notes}</Text>
                </View>
              )}

              {event?.attachedFile && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Attached File</Text>
                  <TouchableOpacity
                    style={styles.fileRow}
                    onPress={() =>
                      onViewFile(
                        event.attachedFile?.uri ?? '',
                        event.attachedFile?.name ?? '',
                        event.attachedFile?.type || undefined
                      )
                    }
                  >
                    <Ionicons name="document" size={18} color="#3AABF0" />
                    <Text style={[styles.sectionValue, styles.fileName]}>
                      {event.attachedFile.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default EventDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  sheetContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 0,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  link: {
    color: '#3AABF0',
    textDecorationLine: 'underline',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileName: {
    marginLeft: 8,
  },
});
