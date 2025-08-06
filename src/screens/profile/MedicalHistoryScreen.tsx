import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList, MedicalCondition, FamilyCondition, Vaccination, Surgery, Medication } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';

type MedicalHistoryScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const MedicalHistoryScreen: React.FC = () => {
  const navigation = useNavigation<MedicalHistoryScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();
  
  const [activeTab, setActiveTab] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { id: 0, title: 'Conditions', icon: 'medical-outline', color: '#FF6B6B' },
    { id: 1, title: 'Medications', icon: 'medical-outline', color: '#4CD964' },
    { id: 2, title: 'Allergies', icon: 'warning-outline', color: '#FFD93D' },
    { id: 3, title: 'Family History', icon: 'people-outline', color: '#4ECDC4' },
    { id: 4, title: 'Vaccinations', icon: 'shield-checkmark-outline', color: '#6BCF7F' },
    { id: 5, title: 'Surgeries', icon: 'cut-outline', color: '#A8E6CF' },
  ];

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
      case 0: // Conditions
        initialData = {
          condition: '',
          diagnosedDate: '',
          severity: 'mild',
          status: 'active',
          notes: '',
        };
        break;
      case 1: // Medications
        initialData = {
          name: '',
          dosage: '',
          frequency: '',
          startDate: '',
          notes: '',
        };
        break;
      case 2: // Allergies
        initialData = { allergy: '' };
        break;
      case 3: // Family History
        initialData = {
          relation: '',
          condition: '',
          ageOfOnset: '',
        };
        break;
      case 4: // Vaccinations
        initialData = {
          name: '',
          date: '',
          nextDue: '',
          location: '',
        };
        break;
      case 5: // Surgeries
        initialData = {
          procedure: '',
          date: '',
          hospital: '',
          surgeon: '',
          notes: '',
        };
        break;
    }
    
    setFormData(initialData);
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: any, index: number): void => {
    if (activeTab === 2) { // Allergies
      setFormData({ allergy: item });
    } else {
      setFormData(item);
    }
    setEditingItem({ ...item, index });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!profile) return;

    let updatedProfile = { ...profile };
    
    switch (activeTab) {
      case 0: // Conditions
        if (!formData.condition.trim()) {
          Alert.alert('Error', 'Please enter a condition name');
          return;
        }
        const condition: MedicalCondition = {
          id: editingItem?.id || Date.now().toString(),
          condition: formData.condition,
          diagnosedDate: formData.diagnosedDate,
          severity: formData.severity,
          status: formData.status,
          notes: formData.notes,
        };
        
        if (editingItem) {
          updatedProfile.medicalHistory[editingItem.index] = condition;
        } else {
          updatedProfile.medicalHistory = [...(updatedProfile.medicalHistory || []), condition];
        }
        break;

      case 1: // Medications
        if (!formData.name.trim()) {
          Alert.alert('Error', 'Please enter a medication name');
          return;
        }
        
        if (editingItem) {
          updatedProfile.medications[editingItem.index] = formData;
        } else {
          updatedProfile.medications = [...(updatedProfile.medications || []), formData];
        }
        break;

      case 2: // Allergies
        if (!formData.allergy.trim()) {
          Alert.alert('Error', 'Please enter an allergy');
          return;
        }
        
        if (editingItem) {
          updatedProfile.allergies[editingItem.index] = formData.allergy;
        } else {
          updatedProfile.allergies = [...(updatedProfile.allergies || []), formData.allergy];
        }
        break;

      case 3: // Family History
        if (!formData.condition.trim()) {
          Alert.alert('Error', 'Please enter a condition');
          return;
        }
        const familyCondition: FamilyCondition = {
          id: editingItem?.id || Date.now().toString(),
          relation: formData.relation,
          condition: formData.condition,
          ageOfOnset: formData.ageOfOnset ? parseInt(formData.ageOfOnset) : undefined,
        };
        
        if (editingItem) {
          updatedProfile.familyHistory[editingItem.index] = familyCondition;
        } else {
          updatedProfile.familyHistory = [...(updatedProfile.familyHistory || []), familyCondition];
        }
        break;

      case 4: // Vaccinations
        if (!formData.name.trim()) {
          Alert.alert('Error', 'Please enter a vaccination name');
          return;
        }
        const vaccination: Vaccination = {
          id: editingItem?.id || Date.now().toString(),
          name: formData.name,
          date: new Date(formData.date),
          nextDue: formData.nextDue ? new Date(formData.nextDue) : undefined,
          location: formData.location,
        };
        
        if (editingItem) {
          updatedProfile.vaccinations[editingItem.index] = vaccination;
        } else {
          updatedProfile.vaccinations = [...(updatedProfile.vaccinations || []), vaccination];
        }
        break;

      case 5: // Surgeries
        if (!formData.procedure.trim()) {
          Alert.alert('Error', 'Please enter a procedure name');
          return;
        }
        const surgery: Surgery = {
          id: editingItem?.id || Date.now().toString(),
          procedure: formData.procedure,
          date: formData.date,
          hospital: formData.hospital,
          surgeon: formData.surgeon,
          notes: formData.notes,
        };
        
        if (editingItem) {
          updatedProfile.surgeries[editingItem.index] = surgery;
        } else {
          updatedProfile.surgeries = [...(updatedProfile.surgeries || []), surgery];
        }
        break;
    }

    updateProfile(updatedProfile);
    setModalVisible(false);
    setFormData({});
  };

  const handleDelete = (index: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!profile) return;
            
            let updatedProfile = { ...profile };
            
            switch (activeTab) {
              case 0:
                updatedProfile.medicalHistory.splice(index, 1);
                break;
              case 1:
                updatedProfile.medications.splice(index, 1);
                break;
              case 2:
                updatedProfile.allergies.splice(index, 1);
                break;
              case 3:
                updatedProfile.familyHistory.splice(index, 1);
                break;
              case 4:
                updatedProfile.vaccinations.splice(index, 1);
                break;
              case 5:
                updatedProfile.surgeries.splice(index, 1);
                break;
            }
            
            updateProfile(updatedProfile);
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    const data = getCurrentData();
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons 
            name={tabs[activeTab].icon as any} 
            size={64} 
            color={tabs[activeTab].color} 
            style={{ opacity: 0.3 }}
          />
          <Text style={styles.emptyStateTitle}>No {tabs[activeTab].title} Added</Text>
          <Text style={styles.emptyStateText}>
            Start by adding your first {tabs[activeTab].title.toLowerCase()} entry
          </Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: tabs[activeTab].color }]}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add {tabs[activeTab].title.slice(0, -1)}</Text>
            </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: tabs[activeTab].color }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add {tabs[activeTab].title.slice(0, -1)}</Text>
          </TouchableOpacity>
          
        <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
        {data.map((item, index) => (
          <TouchableOpacity 
            key={index} 
              style={styles.itemCard}
            onPress={() => handleEdit(item, index)}
          >
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <View style={[styles.itemIcon, { backgroundColor: tabs[activeTab].color }]}>
                    <Ionicons name={tabs[activeTab].icon as any} size={20} color="#FFFFFF" />
            </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {activeTab === 2 ? String(item) : 
                        (typeof item === 'object' ? 
                          (('condition' in item && item.condition) || 
                           ('name' in item && item.name) || 
                           ('procedure' in item && item.procedure) || 
                           'Untitled') : 
                          'Untitled'
                        )
                      }
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      {activeTab === 0 && typeof item === 'object' && 'diagnosedDate' in item && item.diagnosedDate ? `Diagnosed: ${item.diagnosedDate}` : ''}
                      {activeTab === 1 && typeof item === 'object' && 'dosage' in item && item.dosage ? `Dosage: ${item.dosage}` : ''}
                      {activeTab === 2 && typeof item === 'object' && 'reaction' in item && item.reaction ? `Reaction: ${item.reaction}` : ''}
                      {activeTab === 3 && typeof item === 'object' && 'relation' in item && item.relation ? `${item.relation}${('ageOfOnset' in item && item.ageOfOnset) ? ` (Age ${item.ageOfOnset})` : ''}` : ''}
                      {activeTab === 4 && typeof item === 'object' && 'date' in item && item.date ? `Date: ${new Date(item.date).toLocaleDateString()}` : ''}
                      {activeTab === 5 && typeof item === 'object' && 'date' in item && item.date ? `Date: ${item.date}` : ''}
                    </Text>
                  </View>
                </View>
              <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>
    );
  };

        return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Medical History</Text>
            <Text style={styles.headerSubtitle}>Manage your health records</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
                    <TouchableOpacity
            key={tab.id}
                      style={[
              styles.tabButton,
              activeTab === tab.id && { backgroundColor: tab.color }
                      ]}
            onPress={() => setActiveTab(tab.id)}
                    >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#FFFFFF' : tab.color} 
            />
                      <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive
                      ]}>
              {tab.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
      </ScrollView>

      {/* Content */}
      {renderTabContent()}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Add'} {tabs[activeTab].title.slice(0, -1)}
                    </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {activeTab === 0 && (
                <>
                  <Text style={styles.inputLabel}>Condition Name</Text>
              <TextInput
                    style={styles.input}
                    placeholder="Enter condition name"
                    placeholderTextColor="#8E8E93"
                    value={formData.condition}
                    onChangeText={(text) => setFormData({ ...formData, condition: text })}
                  />
                  <Text style={styles.inputLabel}>Diagnosed Date (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8E8E93"
                    value={formData.diagnosedDate}
                    onChangeText={(text) => setFormData({ ...formData, diagnosedDate: text })}
                  />
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Add any notes..."
                    placeholderTextColor="#8E8E93"
                    value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
          </>
              )}

              {activeTab === 1 && (
                <>
                  <Text style={styles.inputLabel}>Medication Name</Text>
              <TextInput
                    style={styles.input}
                    placeholder="Enter medication name"
                    placeholderTextColor="#8E8E93"
                    value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
                  <Text style={styles.inputLabel}>Dosage (Optional)</Text>
              <TextInput
                    style={styles.input}
                    placeholder="e.g., 10mg daily"
                    placeholderTextColor="#8E8E93"
                    value={formData.dosage}
                    onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                  />
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Add any notes..."
                    placeholderTextColor="#8E8E93"
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    multiline
                  />
                </>
              )}

              {activeTab === 2 && (
                <>
                  <Text style={styles.inputLabel}>Allergy</Text>
              <TextInput
                    style={styles.input}
                    placeholder="Enter allergy (e.g., Peanuts, Penicillin)"
                    placeholderTextColor="#8E8E93"
                    value={formData.allergy}
                    onChangeText={(text) => setFormData({ ...formData, allergy: text })}
              />
          </>
              )}

              {activeTab === 3 && (
          <>
                  <Text style={styles.inputLabel}>Relation</Text>
              <TextInput
                    style={styles.input}
                    placeholder="e.g., Father, Mother, Sister"
                    placeholderTextColor="#8E8E93"
                    value={formData.relation}
                    onChangeText={(text) => setFormData({ ...formData, relation: text })}
                  />
                  <Text style={styles.inputLabel}>Condition</Text>
              <TextInput
                    style={styles.input}
                    placeholder="Enter condition"
                    placeholderTextColor="#8E8E93"
                    value={formData.condition}
                    onChangeText={(text) => setFormData({ ...formData, condition: text })}
                  />
                  <Text style={styles.inputLabel}>Age of Onset (Optional)</Text>
              <TextInput
                    style={styles.input}
                    placeholder="e.g., 45"
                    placeholderTextColor="#8E8E93"
                    value={formData.ageOfOnset}
                    onChangeText={(text) => setFormData({ ...formData, ageOfOnset: text })}
                    keyboardType="numeric"
                  />
                </>
              )}

              {activeTab === 4 && (
                <>
                  <Text style={styles.inputLabel}>Vaccination Name</Text>
              <TextInput
                    style={styles.input}
                    placeholder="e.g., COVID-19, Flu Shot"
                    placeholderTextColor="#8E8E93"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                  <Text style={styles.inputLabel}>Date Received</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8E8E93"
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />
                  <Text style={styles.inputLabel}>Location (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Doctor's Office, Pharmacy"
                    placeholderTextColor="#8E8E93"
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />
                </>
              )}

              {activeTab === 5 && (
                <>
                  <Text style={styles.inputLabel}>Procedure Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Appendectomy, Knee Surgery"
                    placeholderTextColor="#8E8E93"
                    value={formData.procedure}
                    onChangeText={(text) => setFormData({ ...formData, procedure: text })}
                  />
                  <Text style={styles.inputLabel}>Date of Surgery</Text>
              <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8E8E93"
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />
                  <Text style={styles.inputLabel}>Hospital (Optional)</Text>
              <TextInput
                    style={styles.input}
                    placeholder="Hospital name"
                    placeholderTextColor="#8E8E93"
                    value={formData.hospital}
                    onChangeText={(text) => setFormData({ ...formData, hospital: text })}
                  />
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Add any notes..."
                    placeholderTextColor="#8E8E93"
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    multiline
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
                  <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
              </View>
            </View>
              </View>
      </Modal>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  itemCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MedicalHistoryScreen; 