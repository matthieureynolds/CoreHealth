import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

interface GenderPickerModalProps {
  visible: boolean;
  currentGender?: string;
  onSelect: (gender: 'male' | 'female') => void;
  onClose: () => void;
}

const GenderPickerModal: React.FC<GenderPickerModalProps> = ({ visible, currentGender, onSelect, onClose }) => {
  const translateY = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(1000);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    }
  }, [visible]);

  const handleSelect = (value: 'male' | 'female') => {
    onSelect(value);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" presentationStyle="overFullScreen" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={styles.bottomSheetContainer}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
            <View style={styles.handleContainer}><View style={styles.handle} /></View>
            <View style={styles.header} pointerEvents="box-none">
              <TouchableOpacity onPress={handleClose} style={styles.closeButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={styles.title}>Select Gender</Text>
              <View style={{ width: 32 }} />
            </View>
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
              {GENDER_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.value} style={styles.optionItem} onPress={() => handleSelect(opt.value as 'male' | 'female')} activeOpacity={0.7}>
                  <View style={styles.optionContent}><Text style={styles.optionLabel}>{opt.label}</Text></View>
                  {currentGender === opt.value && <Ionicons name="checkmark" size={20} color="#34C759" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default GenderPickerModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomSheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, minHeight: 200 },
  handleContainer: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#3A3A3C' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  closeButton: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: '#fff' },
  body: { maxHeight: 300 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 17, color: '#fff' },
});
