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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList, MedicalCondition, FamilyCondition, Vaccination, Surgery, LifestyleInfo, OrganCondition } from '../../types';
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
    { id: 0, title: 'Conditions', icon: 'medical-outline' },
    { id: 1, title: 'Allergies', icon: 'warning-outline' },
    { id: 2, title: 'Medications', icon: 'medkit-outline' },
    { id: 3, title: 'Vaccinations', icon: 'shield-checkmark-outline' },
    { id: 4, title: 'Surgeries', icon: 'cut-outline' },
    { id: 5, title: 'Family History', icon: 'people-outline' },
    { id: 6, title: 'Lifestyle', icon: 'fitness-outline' },
    { id: 7, title: 'Organ Conditions', icon: 'body-outline' },
  ];

  const getCurrentData = () => {
    if (!profile) return [];
    
    switch (activeTab) {
      case 0: return profile.medicalHistory || [];
      case 1: return profile.allergies || [];
      case 2: return []; // Medications would be implemented later
      case 3: return profile.vaccinations || [];
      case 4: return profile.surgeries || [];
      case 5: return profile.familyHistory || [];
      case 6: return profile.lifestyle ? [profile.lifestyle] : [];
      case 7: return profile.organSpecificConditions || [];
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
      case 1: // Allergies
        initialData = { allergy: '' };
        break;
      case 3: // Vaccinations
        initialData = {
          name: '',
          date: new Date().toISOString().split('T')[0],
          nextDue: '',
          location: '',
          batchNumber: '',
        };
        break;
      case 4: // Surgeries
        initialData = {
          procedure: '',
          date: '',
          hospital: '',
          surgeon: '',
          complications: '',
          notes: '',
        };
        break;
      case 5: // Family History
        initialData = {
          relation: '',
          condition: '',
          ageOfOnset: '',
        };
        break;
      case 7: // Organ Conditions
        initialData = {
          organSystem: 'cardiovascular',
          condition: '',
          diagnosedDate: '',
          severity: 'mild',
          status: 'active',
          notes: '',
        };
        break;
    }
    
    setFormData(initialData);
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: any, index: number) => {
    if (activeTab === 1) { // Allergies
      setFormData({ allergy: item });
    } else if (activeTab === 6) { // Lifestyle
      setFormData(item);
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

      case 1: // Allergies
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

      case 3: // Vaccinations
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
          batchNumber: formData.batchNumber,
        };
        
        if (editingItem) {
          updatedProfile.vaccinations[editingItem.index] = vaccination;
        } else {
          updatedProfile.vaccinations = [...(updatedProfile.vaccinations || []), vaccination];
        }
        break;

      case 4: // Surgeries
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
          complications: formData.complications,
          notes: formData.notes,
        };
        
        if (editingItem) {
          updatedProfile.surgeries[editingItem.index] = surgery;
        } else {
          updatedProfile.surgeries = [...(updatedProfile.surgeries || []), surgery];
        }
        break;

      case 5: // Family History
        if (!formData.relation.trim() || !formData.condition.trim()) {
          Alert.alert('Error', 'Please enter both relation and condition');
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

      case 6: // Lifestyle
        updatedProfile.lifestyle = formData;
        break;

      case 7: // Organ Conditions
        if (!formData.condition.trim()) {
          Alert.alert('Error', 'Please enter a condition name');
          return;
        }
        const organCondition: OrganCondition = {
          id: editingItem?.id || Date.now().toString(),
          organSystem: formData.organSystem,
          condition: formData.condition,
          diagnosedDate: formData.diagnosedDate,
          severity: formData.severity,
          status: formData.status,
          notes: formData.notes,
        };
        
        if (editingItem) {
          updatedProfile.organSpecificConditions[editingItem.index] = organCondition;
        } else {
          updatedProfile.organSpecificConditions = [...(updatedProfile.organSpecificConditions || []), organCondition];
        }
        break;
    }

    updateProfile(updatedProfile);
    setModalVisible(false);
    setFormData({});
    setEditingItem(null);
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
                updatedProfile.allergies.splice(index, 1);
                break;
              case 3:
                updatedProfile.vaccinations.splice(index, 1);
                break;
              case 4:
                updatedProfile.surgeries.splice(index, 1);
                break;
              case 5:
                updatedProfile.familyHistory.splice(index, 1);
                break;
              case 7:
                updatedProfile.organSpecificConditions.splice(index, 1);
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
            color="#C7C7CC" 
          />
          <Text style={styles.emptyStateTitle}>
            No {tabs[activeTab].title} Added
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {getEmptyStateMessage()}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {data.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.listItem}
            onPress={() => handleEdit(item, index)}
          >
            <View style={styles.listItemContent}>
              {renderListItemContent(item, index)}
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(item, index)}
              >
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
              {activeTab !== 6 && ( // Don't show delete for lifestyle
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderListItemContent = (item: any, index: number) => {
    switch (activeTab) {
      case 0: // Conditions
        return (
          <>
            <Text style={styles.itemTitle}>{item.condition}</Text>
            <Text style={styles.itemSubtitle}>
              {item.severity} • {item.status} • {item.diagnosedDate || 'Date not set'}
            </Text>
            {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
          </>
        );
      
      case 1: // Allergies
        return <Text style={styles.itemTitle}>{item}</Text>;
      
      case 3: // Vaccinations
        return (
          <>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>
              Given: {item.date?.toDateString?.() || item.date}
              {item.nextDue && ` • Next: ${item.nextDue?.toDateString?.() || item.nextDue}`}
            </Text>
            {item.location && <Text style={styles.itemNotes}>Location: {item.location}</Text>}
          </>
        );

      case 4: // Surgeries
        return (
          <>
            <Text style={styles.itemTitle}>{item.procedure}</Text>
            <Text style={styles.itemSubtitle}>
              {item.date || 'Date not set'}
              {item.hospital && ` • ${item.hospital}`}
            </Text>
            {item.surgeon && <Text style={styles.itemNotes}>Surgeon: {item.surgeon}</Text>}
          </>
        );

      case 5: // Family History
        return (
          <>
            <Text style={styles.itemTitle}>{item.condition}</Text>
            <Text style={styles.itemSubtitle}>
              {item.relation}
              {item.ageOfOnset && ` • Age of onset: ${item.ageOfOnset}`}
            </Text>
          </>
        );

      case 6: // Lifestyle
        return (
          <>
            <Text style={styles.itemTitle}>Lifestyle Information</Text>
            <Text style={styles.itemSubtitle}>
              Smoking: {item.smoking?.status} • Alcohol: {item.alcohol?.frequency}
            </Text>
            <Text style={styles.itemSubtitle}>
              Diet: {item.diet?.type} • Exercise: {item.exercise?.frequency}
            </Text>
          </>
        );

      case 7: // Organ Conditions
        return (
          <>
            <Text style={styles.itemTitle}>{item.condition}</Text>
            <Text style={styles.itemSubtitle}>
              {item.organSystem} • {item.severity} • {item.status}
            </Text>
            {item.diagnosedDate && <Text style={styles.itemNotes}>Diagnosed: {item.diagnosedDate}</Text>}
          </>
        );

      default:
        return <Text style={styles.itemTitle}>Unknown item</Text>;
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 0: return 'Add any medical conditions you have been diagnosed with';
      case 1: return 'List any allergies to medications, foods, or environmental factors';
      case 2: return 'Track your current medications and dosages';
      case 3: return 'Keep track of your vaccination history';
      case 4: return 'Record any surgeries or procedures you have had';
      case 5: return 'Document your family medical history';
      case 6: return 'Set up your lifestyle information for personalized health insights';
      case 7: return 'Track organ-specific conditions for targeted monitoring';
      default: return 'No data available';
    }
  };

  const renderModalContent = () => {
    switch (activeTab) {
      case 0: // Conditions
      case 7: // Organ Conditions
        return (
          <>
            {activeTab === 7 && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Organ System</Text>
                <View style={styles.pickerContainer}>
                  {['cardiovascular', 'respiratory', 'digestive', 'nervous', 'endocrine', 'immune', 'urinary', 'reproductive', 'musculoskeletal', 'integumentary'].map((system) => (
                    <TouchableOpacity
                      key={system}
                      style={[
                        styles.pickerOption,
                        formData.organSystem === system && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, organSystem: system })}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.organSystem === system && styles.pickerOptionTextSelected
                      ]}>
                        {system.charAt(0).toUpperCase() + system.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Condition</Text>
              <TextInput
                style={styles.textInput}
                value={formData.condition || ''}
                onChangeText={(text) => setFormData({ ...formData, condition: text })}
                placeholder="Enter condition name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Diagnosed Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.diagnosedDate || ''}
                onChangeText={(text) => setFormData({ ...formData, diagnosedDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Severity</Text>
              <View style={styles.segmentedControl}>
                {['mild', 'moderate', 'severe'].map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.segmentedButton,
                      formData.severity === severity && styles.segmentedButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, severity })}
                  >
                    <Text style={[
                      styles.segmentedButtonText,
                      formData.severity === severity && styles.segmentedButtonTextSelected
                    ]}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.segmentedControl}>
                {['active', 'resolved', 'managed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.segmentedButton,
                      formData.status === status && styles.segmentedButtonSelected
                    ]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text style={[
                      styles.segmentedButtonText,
                      formData.status === status && styles.segmentedButtonTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.notes || ''}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case 1: // Allergies
        return (
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Allergy</Text>
            <TextInput
              style={styles.textInput}
              value={formData.allergy || ''}
              onChangeText={(text) => setFormData({ ...formData, allergy: text })}
              placeholder="Enter allergy (e.g., Penicillin, Peanuts)"
            />
          </View>
        );

      case 3: // Vaccinations
        return (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Vaccine Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name || ''}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter vaccine name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date Given</Text>
              <TextInput
                style={styles.textInput}
                value={formData.date || ''}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Next Due (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.nextDue || ''}
                onChangeText={(text) => setFormData({ ...formData, nextDue: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location || ''}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Clinic or hospital name"
              />
            </View>
          </>
        );

      case 4: // Surgeries
        return (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Procedure</Text>
              <TextInput
                style={styles.textInput}
                value={formData.procedure || ''}
                onChangeText={(text) => setFormData({ ...formData, procedure: text })}
                placeholder="Enter procedure name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.date || ''}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hospital (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.hospital || ''}
                onChangeText={(text) => setFormData({ ...formData, hospital: text })}
                placeholder="Hospital name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Surgeon (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.surgeon || ''}
                onChangeText={(text) => setFormData({ ...formData, surgeon: text })}
                placeholder="Surgeon name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.notes || ''}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        );

      case 5: // Family History
        return (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Relation</Text>
              <TextInput
                style={styles.textInput}
                value={formData.relation || ''}
                onChangeText={(text) => setFormData({ ...formData, relation: text })}
                placeholder="e.g., Mother, Father, Grandmother"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Condition</Text>
              <TextInput
                style={styles.textInput}
                value={formData.condition || ''}
                onChangeText={(text) => setFormData({ ...formData, condition: text })}
                placeholder="Medical condition"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Age of Onset (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.ageOfOnset || ''}
                onChangeText={(text) => setFormData({ ...formData, ageOfOnset: text })}
                placeholder="Age when diagnosed"
                keyboardType="numeric"
              />
            </View>
          </>
        );

      case 6: // Lifestyle
        return (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Smoking Status</Text>
              <View style={styles.segmentedControl}>
                {['never', 'former', 'current'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.segmentedButton,
                      formData.smoking?.status === status && styles.segmentedButtonSelected
                    ]}
                    onPress={() => setFormData({ 
                      ...formData, 
                      smoking: { ...formData.smoking, status } 
                    })}
                  >
                    <Text style={[
                      styles.segmentedButtonText,
                      formData.smoking?.status === status && styles.segmentedButtonTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Alcohol Frequency</Text>
              <View style={styles.pickerContainer}>
                {['never', 'rarely', 'monthly', 'weekly', 'daily'].map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.pickerOption,
                      formData.alcohol?.frequency === frequency && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ 
                      ...formData, 
                      alcohol: { ...formData.alcohol, frequency } 
                    })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.alcohol?.frequency === frequency && styles.pickerOptionTextSelected
                    ]}>
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Diet Type</Text>
              <View style={styles.pickerContainer}>
                {['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerOption,
                      formData.diet?.type === type && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ 
                      ...formData, 
                      diet: { ...formData.diet, type } 
                    })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.diet?.type === type && styles.pickerOptionTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Exercise Frequency</Text>
              <View style={styles.pickerContainer}>
                {['never', 'rarely', '1-2_times_week', '3-4_times_week', '5+_times_week', 'daily'].map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    style={[
                      styles.pickerOption,
                      formData.exercise?.frequency === frequency && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ 
                      ...formData, 
                      exercise: { ...formData.exercise, frequency } 
                    })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.exercise?.frequency === frequency && styles.pickerOptionTextSelected
                    ]}>
                      {frequency.replace('_', ' ').replace('+', '+')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        );

      default:
        return <Text>Form not implemented for this tab</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={activeTab === tab.id ? "#007AFF" : "#8E8E93"} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? `Edit ${tabs[activeTab].title}` : `Add ${tabs[activeTab].title}`}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {renderModalContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingTop: 20,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  modalCancelButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  modalSaveButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentedButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentedButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  segmentedButtonTextSelected: {
    color: '#007AFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
});

export default MedicalHistoryScreen; 