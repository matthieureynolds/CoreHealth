import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../../../../../../shared/context/SettingsContext';

const options = [
  { value: '12h', label: '12-Hour', description: '1:30 PM' },
  { value: '24h', label: '24-Hour', description: '13:30' },
];

const TimeFormatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateGeneralSettings } = useSettings();
  const [selected, setSelected] = useState(settings.general.timeFormat);
  const [showPicker, setShowPicker] = useState(false);
  const translateY = useRef(new Animated.Value(1000)).current;

  useEffect(() => { setSelected(settings.general.timeFormat); }, [settings.general.timeFormat]);

  const openPicker = () => {
    setShowPicker(true);
    translateY.setValue(1000);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closePicker = () => {
    Animated.timing(translateY, { toValue: 1000, duration: 250, useNativeDriver: true }).start(() => {
      setShowPicker(false);
      translateY.setValue(0);
    });
  };

  const handleSelect = async (value: string) => {
    setSelected(value as any);
    await updateGeneralSettings({ timeFormat: value as any });
    closePicker();
  };

  const currentOption = options.find(o => o.value === selected);

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Time Format</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>TIME FORMAT</Text>
          <TouchableOpacity style={[styles.cardRow, styles.lastRow]} onPress={openPicker}>
            <Ionicons name="time-outline" size={22} color="#5856D6" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Time Format</Text>
            <Text style={styles.cardValue}>{currentOption?.description}</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showPicker} transparent animationType="none" onRequestClose={closePicker}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={closePicker}><View style={StyleSheet.absoluteFill} /></TouchableWithoutFeedback>
          <View style={styles.sheetContainer}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
              <View style={styles.handleContainer}><View style={styles.handle} /></View>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={closePicker} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>Time Format</Text>
                <View style={{ width: 32 }} />
              </View>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                {options.map(option => (
                  <TouchableOpacity key={option.value} style={styles.optionRow} onPress={() => handleSelect(option.value)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDesc}>{option.description}</Text>
                    </View>
                    {selected === option.value && <Ionicons name="checkmark" size={20} color="#34C759" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: { paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10 },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  lastRow: { borderBottomWidth: 0 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  cardValue: { fontSize: 14, color: '#8E8E93', marginRight: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handleContainer: { paddingVertical: 8, alignItems: 'center' },
  handle: { width: 40, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  closeBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', flex: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  optionLabel: { fontSize: 16, color: '#fff', marginBottom: 2 },
  optionDesc: { fontSize: 14, color: '#888' },
});

export default TimeFormatScreen;
