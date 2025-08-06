import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHealthData } from '../../context/HealthDataContext';
import { Screening } from '../../types';

const ScreeningsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useHealthData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [result, setResult] = useState<'normal' | 'abnormal' | 'inconclusive'>('normal');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const resultOptions = [
    { value: 'normal', label: 'Normal', color: '#4CD964' },
    { value: 'abnormal', label: 'Abnormal', color: '#FF3B30' },
    { value: 'inconclusive', label: 'Inconclusive', color: '#FF9500' },
  ];

  const addScreening = () => {
    if (!name.trim() || !date.trim()) {
      Alert.alert('Error', 'Please enter screening name and date');
      return;
    }

    const newScreening: Screening = {
      id: Date.now().toString(),
      name: name.trim(),
      date: new Date(date),
      nextDue: nextDue ? new Date(nextDue) : undefined,
      result,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const updatedScreenings = [...(profile?.screenings || []), newScreening];
    updateProfile({
      ...profile,
      screenings: updatedScreenings,
    });

    setShowAddModal(false);
    setName('');
    setDate('');
    setNextDue('');
    setResult('normal');
    setLocation('');
    setNotes('');
  };

  const deleteScreening = (id: string) => {
    Alert.alert(
      'Delete Screening',
      'Are you sure you want to delete this screening?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedScreenings = profile?.screenings?.filter(s => s.id !== id) || [];
            updateProfile({
              ...profile,
              screenings: updatedScreenings,
            });
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const isOverdue = (nextDue?: Date) => {
    if (!nextDue) return false;
    return new Date() > nextDue;
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'normal': return '#4CD964';
      case 'abnormal': return '#FF3B30';
      case 'inconclusive': return '#FF9500';
      default: return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Screenings</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Screenings List */}
        <View style={styles.content}>
          {profile?.screenings?.length ? (
            profile.screenings.map((screening) => (
              <View key={screening.id} style={styles.screeningCard}>
                <View style={styles.screeningHeader}>
                  <View style={styles.screeningInfo}>
                    <Text style={styles.screeningName}>{screening.name}</Text>
                    <Text style={styles.screeningDate}>Date: {formatDate(screening.date)}</Text>
                    <View style={styles.screeningTags}>
                      <View style={[styles.tag, { backgroundColor: getResultColor(screening.result || 'normal') + '20' }]}>
                        <Text style={[styles.tagText, { color: getResultColor(screening.result || 'normal') }]}>
                          {screening.result?.charAt(0).toUpperCase() + screening.result?.slice(1) || 'Normal'}
                        </Text>
                      </View>
                    </View>
                    {screening.nextDue && (
                      <View style={styles.nextDueContainer}>
                        <Text style={[
                          styles.nextDue,
                          isOverdue(screening.nextDue) && styles.overdue
                        ]}>
                          Next due: {formatDate(screening.nextDue)}
                        </Text>
                        {isOverdue(screening.nextDue) && (
                          <View style={styles.overdueBadge}>
                            <Text style={styles.overdueText}>Overdue</Text>
                          </View>
                        )}
                      </View>
                    )}
                    {screening.location && (
                      <Text style={styles.location}>Location: {screening.location}</Text>
                    )}
                    {screening.notes && <Text style={styles.notes}>{screening.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteScreening(screening.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Screenings</Text>
              <Text style={styles.emptySubtitle}>Add your health screenings to track preventive care</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addFirstButtonText}>Add Screening</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Screening Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Screening</Text>
            <TouchableOpacity onPress={addScreening}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Screening Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Screening Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Mammogram, Colonoscopy, Blood Test"
                placeholderTextColor="#666"
              />
            </View>

            {/* Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            </View>

            {/* Result */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Result</Text>
              <View style={styles.optionsContainer}>
                {resultOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      result === option.value && styles.selectedOption
                    ]}
                    onPress={() => setResult(option.value as any)}
                  >
                    <Text style={[
                      styles.optionText,
                      result === option.value && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Next Due */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Next Due Date (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={nextDue}
                onChangeText={setNextDue}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Hospital, Clinic, Lab"
                placeholderTextColor="#666"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any additional notes about this screening"
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  screeningCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  screeningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  screeningInfo: {
    flex: 1,
  },
  screeningName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  screeningDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  screeningTags: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nextDueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextDue: {
    fontSize: 14,
    color: '#4CD964',
    marginRight: 8,
  },
  overdue: {
    color: '#FF3B30',
  },
  overdueBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  overdueText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#181818',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#181818',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#fff',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ScreeningsScreen; 