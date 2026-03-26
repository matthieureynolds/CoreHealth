import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../../../../../shared/context/AuthContext';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { ProfileTabParamList } from '../../../../../../shared/types';

type EditNameScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

const EditNameScreen: React.FC = () => {
  const navigation = useNavigation<EditNameScreenNavigationProp>();
  const { user, updateUserName, updateUsername } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [username, setUsername] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [tempBloodType, setTempBloodType] = useState(BLOOD_TYPES[0]);
  const btScrollRef = useRef<ScrollView>(null);
  const BT_ITEM_HEIGHT = 52;

  // Track initial values to detect changes
  const [initialValues, setInitialValues] = useState({ firstName: '', surname: '', preferredName: '', username: '', height: '', weight: '', bloodType: '' });

  const sanitize = (raw: string) =>
    raw.toLowerCase().replace(/[^a-z0-9_\.]/g, '').replace(/\.{2,}/g, '.').replace(/^\.|\.$/g, '');

  useEffect(() => {
    if (user) {
      const baseUsername = user.username || user.preferredName || user.firstName || '';
      const fn = user.firstName || '';
      const sn = user.surname || '';
      const pn = user.preferredName || '';
      const un = sanitize(baseUsername.replace(/\s+/g, '.'));
      setFirstName(fn);
      setSurname(sn);
      setPreferredName(pn);
      setUsername(un);
      setInitialValues(prev => ({ ...prev, firstName: fn, surname: sn, preferredName: pn, username: un }));
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      const h = profile.height?.toString() || '';
      const w = profile.weight?.toString() || '';
      const bt = profile.bloodType || '';
      setHeight(h);
      setWeight(w);
      setBloodType(bt);
      setInitialValues(prev => ({ ...prev, height: h, weight: w, bloodType: bt }));
    }
  }, [profile]);

  useEffect(() => {
    if (showBloodTypePicker) {
      const idx = Math.max(0, BLOOD_TYPES.indexOf(bloodType));
      setTempBloodType(BLOOD_TYPES[idx]);
      setTimeout(() => {
        btScrollRef.current?.scrollTo({ y: idx * BT_ITEM_HEIGHT, animated: false });
      }, 50);
    }
  }, [showBloodTypePicker]);

  const hasChanges = firstName !== initialValues.firstName || surname !== initialValues.surname || preferredName !== initialValues.preferredName || username !== initialValues.username || height !== initialValues.height || weight !== initialValues.weight || bloodType !== initialValues.bloodType;

  const handleSave = async () => {
    if (!firstName.trim() || firstName.trim().length < 2) {
      Alert.alert('Error', 'First name must be at least 2 characters'); return;
    }
    if (!surname.trim() || surname.trim().length < 2) {
      Alert.alert('Error', 'Surname must be at least 2 characters'); return;
    }

    try {
      const finalPreferredName = preferredName.trim() || firstName.trim();
      await updateUserName(firstName.trim(), surname.trim(), finalPreferredName);
      const displayName = `${firstName.trim()} ${surname.trim()}`.trim();
      try { await updateProfile({ displayName } as any); } catch (e) { console.error(e); }

      const cleaned = sanitize(username || '');
      if (cleaned && cleaned.length >= 3 && cleaned.length <= 20 && /^[a-z0-9](?:[a-z0-9_.]*[a-z0-9])?$/.test(cleaned)) {
        if (cleaned !== (user?.username || '')) await updateUsername(cleaned);
      }

      // Save physical stats
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const updates: any = { ...profile };
      if (!isNaN(h) && h >= 50 && h <= 250) updates.height = Math.round(h * 10) / 10;
      if (!isNaN(w) && w >= 20 && w <= 500) updates.weight = Math.round(w * 10) / 10;
      if (bloodType) updates.bloodType = bloodType;
      await updateProfile(updates);

      Alert.alert('Success', 'Personal info updated successfully');
    } catch (error) {
      console.error('Error updating personal info:', error);
      Alert.alert('Error', 'Failed to update. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.header} pointerEvents="box-none">
        <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle} pointerEvents="none">Personal Info</Text>
        <TouchableOpacity onPress={handleSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="checkmark" size={22} color={hasChanges ? '#34C759' : '#34C75966'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false} contentContainerStyle={s.contentContainer} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={s.sectionLabel}>Name</Text>
        <View style={s.group}>
          <View style={s.row}>
            <Text style={s.rowLabel}>First Name</Text>
            <View style={s.vDivider} />
            <TextInput style={s.rowInput} value={firstName} onChangeText={setFirstName} placeholder="Required" placeholderTextColor="#555" maxLength={30} autoCapitalize="words" autoCorrect={false} />
          </View>
          <View style={s.hDivider} />
          <View style={s.row}>
            <Text style={s.rowLabel}>Surname</Text>
            <View style={s.vDivider} />
            <TextInput style={s.rowInput} value={surname} onChangeText={setSurname} placeholder="Required" placeholderTextColor="#555" maxLength={30} autoCapitalize="words" autoCorrect={false} />
          </View>
          <View style={s.hDivider} />
          <View style={s.row}>
            <Text style={s.rowLabel}>Preferred</Text>
            <View style={s.vDivider} />
            <TextInput style={s.rowInput} value={preferredName} onChangeText={setPreferredName} placeholder="Optional" placeholderTextColor="#555" maxLength={30} autoCapitalize="words" autoCorrect={false} />
          </View>
        </View>

        {/* Physical Stats */}
        <Text style={s.sectionLabel}>Physical Stats</Text>
        <View style={s.group}>
          <View style={s.row}>
            <Text style={s.rowLabel}>Height</Text>
            <View style={s.vDivider} />
            <TextInput style={s.rowInput} value={height} onChangeText={setHeight} placeholder="cm" placeholderTextColor="#555" keyboardType="decimal-pad" maxLength={6} />
            <Text style={s.unit}>cm</Text>
          </View>
          <View style={s.hDivider} />
          <View style={s.row}>
            <Text style={s.rowLabel}>Weight</Text>
            <View style={s.vDivider} />
            <TextInput style={s.rowInput} value={weight} onChangeText={setWeight} placeholder="kg" placeholderTextColor="#555" keyboardType="decimal-pad" maxLength={6} />
            <Text style={s.unit}>kg</Text>
          </View>
          <View style={s.hDivider} />
          <TouchableOpacity style={s.row} onPress={() => setShowBloodTypePicker(true)}>
            <Text style={s.rowLabel}>Blood Type</Text>
            <View style={s.vDivider} />
            <Text style={[s.rowInput, { color: bloodType ? '#FFFFFF' : '#555' }]}>{bloodType || 'Select'}</Text>
            <Ionicons name="chevron-forward" size={16} color="#3A3A3C" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Blood Type Picker */}
      <Modal visible={showBloodTypePicker} transparent animationType="fade" onRequestClose={() => setShowBloodTypePicker(false)}>
        <View style={s.pickerOverlay}>
          <View style={s.pickerContainer}>
            <View style={s.pickerHeader}>
              <TouchableOpacity onPress={() => setShowBloodTypePicker(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
              <Text style={s.pickerTitle}>Blood Type</Text>
              <TouchableOpacity onPress={() => { setBloodType(tempBloodType); setShowBloodTypePicker(false); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="checkmark" size={24} color="#34C759" />
              </TouchableOpacity>
            </View>

            <View style={{ height: BT_ITEM_HEIGHT * 5 }}>
              <View style={[s.selectionLine, { top: BT_ITEM_HEIGHT * 2 }]} pointerEvents="none" />
              <View style={[s.selectionLine, { top: BT_ITEM_HEIGHT * 3 }]} pointerEvents="none" />

              <ScrollView
                ref={btScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={BT_ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: BT_ITEM_HEIGHT * 2 }}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.y / BT_ITEM_HEIGHT), BLOOD_TYPES.length - 1));
                  setTempBloodType(BLOOD_TYPES[idx]);
                }}
                onScrollEndDrag={(e) => {
                  const idx = Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.y / BT_ITEM_HEIGHT), BLOOD_TYPES.length - 1));
                  setTempBloodType(BLOOD_TYPES[idx]);
                }}
              >
                {BLOOD_TYPES.map((bt) => (
                  <TouchableOpacity
                    key={bt}
                    style={s.pickerItem}
                    onPress={() => {
                      const idx = BLOOD_TYPES.indexOf(bt);
                      btScrollRef.current?.scrollTo({ y: idx * BT_ITEM_HEIGHT, animated: true });
                      setTempBloodType(bt);
                    }}
                  >
                    <Text style={[s.pickerItemText, tempBloodType === bt && s.pickerItemTextActive]}>
                      {bt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: '#000000', zIndex: 1000, position: 'absolute', top: 0, left: 0, right: 0, elevation: 10 },
  backButton: { padding: 8, width: 40 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 100, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginTop: 20, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  group: { backgroundColor: '#2C2C2E', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowLabel: { fontSize: 16, color: '#8E8E93', fontWeight: '500', width: 95 },
  vDivider: { width: 1, height: 20, backgroundColor: '#3A3A3C', marginHorizontal: 14 },
  rowInput: { flex: 1, fontSize: 16, color: '#FFFFFF', paddingVertical: 0 },
  hDivider: { height: 1, backgroundColor: '#3A3A3C', marginLeft: 16 },
  unit: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 50 },
  pickerContainer: { backgroundColor: '#1a1a1a', borderRadius: 20, width: '100%', maxWidth: 260, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  pickerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  selectionLine: { position: 'absolute', left: 20, right: 20, height: 1, backgroundColor: '#3A3A3C', zIndex: 1 },
  pickerItem: { height: 52, justifyContent: 'center', alignItems: 'center' },
  pickerItemText: { color: '#555', fontSize: 20, fontWeight: '600' },
  pickerItemTextActive: { color: '#fff', fontSize: 22, fontWeight: '700' },
});

export default EditNameScreen;
