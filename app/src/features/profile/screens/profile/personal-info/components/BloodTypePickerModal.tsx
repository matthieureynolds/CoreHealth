import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;

interface BloodTypePickerModalProps {
  visible: boolean;
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const BloodTypePickerModal: React.FC<BloodTypePickerModalProps> = ({
  visible, selectedValue, onSelect, onClose,
}) => {
  const [tempValue, setTempValue] = useState(BLOOD_TYPES[0]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      const displayValue = selectedValue === 'unknown' ? 'Unknown' : selectedValue;
      const idx = Math.max(0, BLOOD_TYPES.indexOf(displayValue));
      setTempValue(BLOOD_TYPES[idx]);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
      }, 50);
    }
  }, [visible]);

  const handleConfirm = () => {
    const value = tempValue === 'Unknown' ? 'unknown' : tempValue;
    onSelect(value);
  };

  const handleScrollEnd = (y: number) => {
    const idx = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), BLOOD_TYPES.length - 1));
    setTempValue(BLOOD_TYPES[idx]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.title}>Blood Type</Text>
            <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="checkmark" size={24} color="#34C759" />
            </TouchableOpacity>
          </View>

          <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
            <View style={[styles.selectionLine, { top: ITEM_HEIGHT * 2 }]} pointerEvents="none" />
            <View style={[styles.selectionLine, { top: ITEM_HEIGHT * 3 }]} pointerEvents="none" />

            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
              onMomentumScrollEnd={(e) => handleScrollEnd(e.nativeEvent.contentOffset.y)}
              onScrollEndDrag={(e) => handleScrollEnd(e.nativeEvent.contentOffset.y)}
            >
              {BLOOD_TYPES.map((bt) => (
                <TouchableOpacity
                  key={bt}
                  style={styles.item}
                  onPress={() => {
                    const idx = BLOOD_TYPES.indexOf(bt);
                    scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                    setTempValue(bt);
                  }}
                >
                  <Text style={[styles.itemText, tempValue === bt && styles.itemTextActive]}>
                    {bt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BloodTypePickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectionLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#3A3A3C',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: '#555',
    fontSize: 20,
    fontWeight: '600',
  },
  itemTextActive: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});
