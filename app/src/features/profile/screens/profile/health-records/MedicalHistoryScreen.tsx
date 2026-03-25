import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList, MedicalCondition, FamilyCondition, Vaccination, Surgery } from '../../../../../shared/types';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import MedicalHistoryItemCard from './components/MedicalHistoryItemCard';
import MedicalHistoryEmptyState from './components/MedicalHistoryEmptyState';
import MedicalHistoryFormModal from './components/MedicalHistoryFormModal';

type MedicalHistoryScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const tabs = [
  { id: 0, title: 'Conditions', icon: 'medical-outline', color: '#FF6B6B' },
  { id: 1, title: 'Medications', icon: 'medical-outline', color: '#4CD964' },
  { id: 2, title: 'Allergies', icon: 'warning-outline', color: '#FFD93D' },
  { id: 3, title: 'Family History', icon: 'people-outline', color: '#4ECDC4' },
  { id: 4, title: 'Vaccinations', icon: 'shield-checkmark-outline', color: '#6BCF7F' },
  { id: 5, title: 'Surgeries', icon: 'cut-outline', color: '#A8E6CF' },
];

const MedicalHistoryScreen: React.FC = () => {
  const navigation = useNavigation<MedicalHistoryScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();

  const [activeTab, setActiveTab] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});

  const getCurrentData = () => {
    if (!profile) return [];
    switch (activeTab) {
      case 0: return profile.medicalHistory || [];
      case 1: return profile.medications || [];
      case 2: return profile.allergies || [];
      case 3: return profile.familyHistory || [];
      case 4: return profile.vaccinations || [];
      case 5: return profile.surgeries || [];
      default: return [];
    }
  };

  const handleAdd = () => {
    let initialData = {};
    switch (activeTab) {
      case 0: initialData = { condition: '', diagnosedDate: '', severity: 'mild', status: 'active', notes: '' }; break;
      case 1: initialData = { name: '', dosage: '', frequency: '', startDate: '', notes: '' }; break;
      case 2: initialData = { allergy: '' }; break;
      case 3: initialData = { relation: '', condition: '', ageOfOnset: '' }; break;
      case 4: initialData = { name: '', date: '', nextDue: '', location: '' }; break;
      case 5: initialData = { procedure: '', date: '', hospital: '', surgeon: '', notes: '' }; break;
    }
    setFormData(initialData);
    setEditingItem(null);
    setModalVisible(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (item: any, index: number): void => {
    setFormData(activeTab === 2 ? { allergy: item } : item);
    setEditingItem({ ...item, index });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!profile) return;
    const updatedProfile = { ...profile };

    switch (activeTab) {
      case 0:
        if (!formData.condition.trim()) { Alert.alert('Error', 'Please enter a condition name'); return; }
        const condition: MedicalCondition = {
          id: editingItem?.id || Date.now().toString(),
          condition: formData.condition, diagnosedDate: formData.diagnosedDate,
          severity: formData.severity, status: formData.status, notes: formData.notes,
        };
        if (editingItem) { updatedProfile.medicalHistory[editingItem.index] = condition; }
        else { updatedProfile.medicalHistory = [...(updatedProfile.medicalHistory || []), condition]; }
        break;

      case 1:
        if (!formData.name.trim()) { Alert.alert('Error', 'Please enter a medication name'); return; }
        if (editingItem) { updatedProfile.medications[editingItem.index] = formData; }
        else { updatedProfile.medications = [...(updatedProfile.medications || []), formData]; }
        break;

      case 2:
        if (!formData.allergy.trim()) { Alert.alert('Error', 'Please enter an allergy'); return; }
        if (editingItem) { updatedProfile.allergies[editingItem.index] = formData.allergy; }
        else { updatedProfile.allergies = [...(updatedProfile.allergies || []), formData.allergy]; }
        break;

      case 3:
        if (!formData.condition.trim()) { Alert.alert('Error', 'Please enter a condition'); return; }
        const familyCondition: FamilyCondition = {
          id: editingItem?.id || Date.now().toString(),
          relation: formData.relation, condition: formData.condition,
          ageOfOnset: formData.ageOfOnset ? parseInt(formData.ageOfOnset) : undefined,
        };
        if (editingItem) { updatedProfile.familyHistory[editingItem.index] = familyCondition; }
        else { updatedProfile.familyHistory = [...(updatedProfile.familyHistory || []), familyCondition]; }
        break;

      case 4:
        if (!formData.name.trim()) { Alert.alert('Error', 'Please enter a vaccination name'); return; }
        const vaccination: Vaccination = {
          id: editingItem?.id || Date.now().toString(),
          name: formData.name, date: new Date(formData.date),
          nextDue: formData.nextDue ? new Date(formData.nextDue) : undefined,
          location: formData.location,
        };
        if (editingItem) { updatedProfile.vaccinations[editingItem.index] = vaccination; }
        else { updatedProfile.vaccinations = [...(updatedProfile.vaccinations || []), vaccination]; }
        break;

      case 5:
        if (!formData.procedure.trim()) { Alert.alert('Error', 'Please enter a procedure name'); return; }
        const surgery: Surgery = {
          id: editingItem?.id || Date.now().toString(),
          procedure: formData.procedure, date: formData.date,
          hospital: formData.hospital, surgeon: formData.surgeon, notes: formData.notes,
        };
        if (editingItem) { updatedProfile.surgeries[editingItem.index] = surgery; }
        else { updatedProfile.surgeries = [...(updatedProfile.surgeries || []), surgery]; }
        break;
    }

    updateProfile(updatedProfile);
    setModalVisible(false);
    setFormData({});
  };

  const handleDelete = (index: number) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!profile) return;
          const updatedProfile = { ...profile };
          switch (activeTab) {
            case 0: updatedProfile.medicalHistory.splice(index, 1); break;
            case 1: updatedProfile.medications.splice(index, 1); break;
            case 2: updatedProfile.allergies.splice(index, 1); break;
            case 3: updatedProfile.familyHistory.splice(index, 1); break;
            case 4: updatedProfile.vaccinations.splice(index, 1); break;
            case 5: updatedProfile.surgeries.splice(index, 1); break;
          }
          updateProfile(updatedProfile);
        },
      },
    ]);
  };

  const data = getCurrentData();
  const tabConfig = tabs[activeTab];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Medical History</Text>
            <Text style={styles.headerSubtitle}>Manage your health records</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && { backgroundColor: tab.color }]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? '#FFFFFF' : tab.color}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {data.length === 0 ? (
        <MedicalHistoryEmptyState tabConfig={tabConfig} onAdd={handleAdd} />
      ) : (
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tabConfig.color }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add {tabConfig.title.slice(0, -1)}</Text>
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
            {data.map((item, index) => (
              <MedicalHistoryItemCard
                key={index}
                item={item}
                index={index}
                activeTab={activeTab}
                tabConfig={tabConfig}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <MedicalHistoryFormModal
        visible={modalVisible}
        activeTab={activeTab}
        tabConfig={tabConfig}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: '#1C1C1E',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
});

export default MedicalHistoryScreen;
