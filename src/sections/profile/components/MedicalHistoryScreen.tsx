import React, { useState, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList, MedicalCondition, FamilyCondition, Vaccination, Surgery, LifestyleInfo, OrganCondition } from '../../types';
import { useHealthData } from '../../context/HealthDataContext';

type MedicalHistoryScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const { width } = Dimensions.get('window');

const MedicalHistoryScreen: React.FC = () => {
  const navigation = useNavigation<MedicalHistoryScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();
  
  const [activeTab, setActiveTab] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const recordingAnimation = useRef(new Animated.Value(0)).current;

  const tabs = [
    { id: 0, title: 'Conditions', icon: 'medical-outline', color: '#FF6B6B' },
    { id: 1, title: 'Allergies', icon: 'warning-outline', color: '#FFD93D' },
    { id: 2, title: 'Vaccinations', icon: 'shield-checkmark-outline', color: '#6BCF7F' },
    { id: 3, title: 'Family History', icon: 'people-outline', color: '#4ECDC4' },
    { id: 4, title: 'Surgeries', icon: 'cut-outline', color: '#A8E6CF' },
    { id: 5, title: 'Lifestyle', icon: 'fitness-outline', color: '#FF8B94' },
  ];

  const getCurrentData = () => {
    if (!profile) return [];
    
    switch (activeTab) {
      case 0: return profile.medicalHistory || [];
      case 1: return profile.allergies || [];
      case 2: return profile.vaccinations || [];
      case 3: return profile.familyHistory || [];
      case 4: return profile.surgeries || [];
      case 5: return profile.lifestyle ? [profile.lifestyle] : [];
      default: return [];
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to use voice input.');
        return;
      }

      setIsRecording(true);
      setTranscribedText('');
      setAiSuggestions([]);

      // Animate recording indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Simulate voice transcription (in real app, use actual speech-to-text)
      setTimeout(() => {
        const mockTranscriptions = {
          0: ['I have diabetes type 2', 'Hypertension diagnosed in 2020', 'Asthma since childhood'],
          1: ['Peanut allergy', 'Penicillin allergy', 'Latex allergy'],
          2: ['COVID vaccine', 'Flu shot', 'Tetanus booster'],
          3: ['Father has heart disease', 'Mother has diabetes', 'Sister has asthma'],
          4: ['Appendectomy in 2018', 'Knee surgery', 'Cataract surgery'],
          5: ['I exercise 3 times a week', 'I don\'t smoke', 'I drink occasionally'],
        };

        const transcription = mockTranscriptions[activeTab as keyof typeof mockTranscriptions]?.[Math.floor(Math.random() * 3)] || 'I have a medical condition';
        setTranscribedText(transcription);
        
        // Simulate AI suggestions
        setTimeout(() => {
          const suggestions = generateAiSuggestions(transcription, activeTab);
          setAiSuggestions(suggestions);
          setIsProcessing(false);
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingAnimation.stopAnimation();
    setIsProcessing(true);
  };

  const generateAiSuggestions = (text: string, tabIndex: number): string[] => {
    const suggestions = {
      0: ['Diabetes Type 2', 'Hypertension', 'Asthma', 'Depression', 'Anxiety'],
      1: ['Peanut Allergy', 'Penicillin Allergy', 'Latex Allergy', 'Shellfish Allergy', 'Dairy Allergy'],
      2: ['COVID-19 Vaccine', 'Influenza Vaccine', 'Tetanus Booster', 'MMR Vaccine', 'Hepatitis B Vaccine'],
      3: ['Father - Heart Disease', 'Mother - Diabetes', 'Sister - Asthma', 'Brother - Hypertension'],
      4: ['Appendectomy', 'Knee Surgery', 'Cataract Surgery', 'Hernia Repair', 'Gallbladder Removal'],
      5: ['Non-smoker', 'Occasional drinker', 'Regular exercise', 'Vegetarian diet', 'Good sleep habits'],
    };

    return suggestions[tabIndex as keyof typeof suggestions] || [];
  };

  const handleVoiceSuggestion = (suggestion: string) => {
    setFormData({ ...formData, [getCurrentFieldName()]: suggestion });
    setVoiceModalVisible(false);
    setModalVisible(true);
  };

  const getCurrentFieldName = () => {
    switch (activeTab) {
      case 0: return 'condition';
      case 1: return 'allergy';
      case 2: return 'name';
      case 3: return 'condition';
      case 4: return 'procedure';
      case 5: return 'notes';
      default: return 'name';
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
      case 2: // Vaccinations
        initialData = {
          name: '',
          date: new Date().toISOString().split('T')[0],
          nextDue: '',
          location: '',
          batchNumber: '',
        };
        break;
      case 3: // Family History
        initialData = {
          relation: '',
          condition: '',
          ageOfOnset: '',
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
      case 5: // Lifestyle
        initialData = {
          smoking: { status: 'never' },
          alcohol: { frequency: 'never' },
          diet: { type: 'omnivore' },
          exercise: { frequency: 'never' },
          sleep: { averageHoursPerNight: 7 },
          stress: { level: 'low' },
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
    } else if (activeTab === 5) { // Lifestyle
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

      case 2: // Vaccinations
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

      case 5: // Lifestyle
        updatedProfile.lifestyle = formData as LifestyleInfo;
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
                updatedProfile.allergies.splice(index, 1);
                break;
              case 2:
                updatedProfile.vaccinations.splice(index, 1);
                break;
              case 3:
                updatedProfile.familyHistory.splice(index, 1);
                break;
              case 4:
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
          <View style={styles.emptyStateActions}>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: tabs[activeTab].color }]}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add {tabs[activeTab].title.slice(0, -1)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.voiceButton, { borderColor: tabs[activeTab].color }]}
              onPress={() => setVoiceModalVisible(true)}
            >
              <Ionicons name="mic" size={20} color={tabs[activeTab].color} />
              <Text style={[styles.voiceButtonText, { color: tabs[activeTab].color }]}>
                Voice Input
          </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.addSection}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: tabs[activeTab].color }]}
            onPress={handleAdd}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add {tabs[activeTab].title.slice(0, -1)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.voiceButton, { borderColor: tabs[activeTab].color }]}
            onPress={() => setVoiceModalVisible(true)}
          >
            <Ionicons name="mic" size={20} color={tabs[activeTab].color} />
            <Text style={[styles.voiceButtonText, { color: tabs[activeTab].color }]}>
              Voice
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
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
                      {activeTab === 1 ? String(item) : 
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
                      {activeTab === 0 && typeof item === 'object' && 'diagnosedDate' in item && item.diagnosedDate && `Diagnosed: ${item.diagnosedDate}`}
                      {activeTab === 2 && typeof item === 'object' && 'date' in item && item.date && `Date: ${new Date(item.date).toLocaleDateString()}`}
                      {activeTab === 3 && typeof item === 'object' && 'relation' in item && item.relation && `${item.relation}${('ageOfOnset' in item && item.ageOfOnset) ? ` (Age ${item.ageOfOnset})` : ''}`}
                      {activeTab === 4 && typeof item === 'object' && 'date' in item && item.date && `Date: ${item.date}`}
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical History</Text>
        <Text style={styles.headerSubtitle}>Manage your health information</Text>
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

      {/* Voice Input Modal */}
      <Modal
        visible={voiceModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.voiceModalContent}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>Voice Input</Text>
              <TouchableOpacity 
                onPress={() => setVoiceModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
                </View>

            <View style={styles.voiceContent}>
              {!isRecording && !transcribedText && (
                <View style={styles.voiceStart}>
                  <Text style={styles.voiceInstructions}>
                    Tap the microphone to start recording your {tabs[activeTab].title.toLowerCase()}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.recordButton, { backgroundColor: tabs[activeTab].color }]}
                    onPress={startRecording}
                  >
                    <Ionicons name="mic" size={32} color="#FFFFFF" />
                  </TouchableOpacity>
              </View>
            )}
            
              {isRecording && (
                <View style={styles.recordingState}>
                  <Animated.View 
                    style={[
                      styles.recordingIndicator,
                      { 
                        backgroundColor: tabs[activeTab].color,
                        transform: [{ scale: recordingAnimation }]
                      }
                    ]}
                  />
                  <Text style={styles.recordingText}>Recording...</Text>
                  <TouchableOpacity 
                    style={styles.stopButton}
                    onPress={stopRecording}
                  >
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
            </View>
              )}

              {isProcessing && (
                <View style={styles.processingState}>
                  <Text style={styles.processingText}>Processing your voice...</Text>
            </View>
              )}

              {transcribedText && !isProcessing && (
                <View style={styles.resultsState}>
                  <Text style={styles.transcribedTitle}>You said:</Text>
                  <Text style={styles.transcribedText}>{transcribedText}</Text>
                  
                  {aiSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <Text style={styles.suggestionsTitle}>AI Suggestions:</Text>
                      {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                          key={index}
                          style={styles.suggestionButton}
                          onPress={() => handleVoiceSuggestion(suggestion)}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                          <Ionicons name="checkmark" size={20} color="#007AFF" />
                  </TouchableOpacity>
                ))}
              </View>
                  )}
            </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

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
                <Ionicons name="close" size={24} color="#8E8E93" />
                  </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {activeTab === 0 && (
                <>
              <TextInput
                    style={styles.input}
                    placeholder="Condition name"
                    value={formData.condition}
                    onChangeText={(text) => setFormData({ ...formData, condition: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Diagnosed date (optional)"
                    value={formData.diagnosedDate}
                    onChangeText={(text) => setFormData({ ...formData, diagnosedDate: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Notes (optional)"
                    value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
          </>
              )}

              {activeTab === 1 && (
            <TextInput
                  style={styles.input}
                  placeholder="Allergy name"
                  value={formData.allergy}
              onChangeText={(text) => setFormData({ ...formData, allergy: text })}
            />
              )}

              {activeTab === 2 && (
          <>
              <TextInput
                    style={styles.input}
                    placeholder="Vaccination name"
                    value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                    style={styles.input}
                    placeholder="Date received"
                    value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
              <TextInput
                    style={styles.input}
                    placeholder="Location (optional)"
                    value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
          </>
              )}

              {activeTab === 3 && (
          <>
              <TextInput
                    style={styles.input}
                    placeholder="Relation (e.g., Father, Mother, Sister)"
                    value={formData.relation}
                    onChangeText={(text) => setFormData({ ...formData, relation: text })}
                  />
              <TextInput
                    style={styles.input}
                    placeholder="Condition"
                    value={formData.condition}
                    onChangeText={(text) => setFormData({ ...formData, condition: text })}
                  />
              <TextInput
                    style={styles.input}
                    placeholder="Age of onset (optional)"
                    value={formData.ageOfOnset}
                    onChangeText={(text) => setFormData({ ...formData, ageOfOnset: text })}
                    keyboardType="numeric"
                  />
                </>
              )}

              {activeTab === 4 && (
                <>
              <TextInput
                    style={styles.input}
                    placeholder="Procedure name"
                    value={formData.procedure}
                    onChangeText={(text) => setFormData({ ...formData, procedure: text })}
                  />
              <TextInput
                    style={styles.input}
                    placeholder="Date of surgery"
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />
              <TextInput
                    style={styles.input}
                    placeholder="Hospital (optional)"
                    value={formData.hospital}
                    onChangeText={(text) => setFormData({ ...formData, hospital: text })}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Surgeon (optional)"
                    value={formData.surgeon}
                    onChangeText={(text) => setFormData({ ...formData, surgeon: text })}
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
    backgroundColor: '#F2F2F7',
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
  addSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
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
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#1C1C1E',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  voiceModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  voiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  voiceModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  voiceContent: {
    padding: 20,
    alignItems: 'center',
  },
  voiceStart: {
    alignItems: 'center',
  },
  voiceInstructions: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingState: {
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  processingState: {
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  resultsState: {
    width: '100%',
  },
  transcribedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  transcribedText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  modalBody: {
    padding: 20,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MedicalHistoryScreen; 