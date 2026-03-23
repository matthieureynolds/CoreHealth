import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { 
  SymptomCategory, 
  PHYSICAL_SYMPTOM_CATEGORIES, 
  MENTAL_SYMPTOM_CATEGORIES,
  DURATION_OPTIONS,
  SEVERITY_LABELS,
  QuickLogData 
} from '../types/symptoms';
import { symptomService } from '../services/symptomService';

interface QuickSymptomLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const QuickSymptomLogModal: React.FC<QuickSymptomLogModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<'physical' | 'mental' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | null>(null);
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState('just_started');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [factors, setFactors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableFactors = [
    'Work', 'Health', 'Family', 'Relationships', 'Weather', 
    'Sleep', 'Exercise', 'Diet', 'Medication', 'Stress'
  ];

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setStep(1);
      setSelectedType(null);
      setSelectedCategory(null);
      setSeverity(5);
      setDuration('just_started');
      setNotes('');
      setLocation('');
      setFactors([]);
    }
  }, [visible]);

  const handleTypeSelection = (type: 'physical' | 'mental') => {
    setSelectedType(type);
    setStep(2);
  };

  const handleCategorySelection = (category: SymptomCategory) => {
    setSelectedCategory(category);
    setStep(3);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleFactorToggle = (factor: string) => {
    setFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedCategory) return;

    try {
      setLoading(true);
      
      const quickData: QuickLogData = {
        type: selectedType,
        category: selectedCategory.name,
        severity: Math.round(severity),
        duration,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        factors: factors.length > 0 ? factors : undefined,
      };

      await symptomService.quickLog(quickData);
      
      Alert.alert('Success', 'Symptom logged successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error logging symptom:', error);
      Alert.alert('Error', 'Failed to log symptom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What would you like to log?</Text>
      
      <View style={styles.typeCards}>
        <TouchableOpacity 
          style={[styles.typeCard, { backgroundColor: '#FF6B6B' }]}
          onPress={() => handleTypeSelection('physical')}
        >
          <Ionicons name="medical-outline" size={40} color="#FFFFFF" />
          <Text style={styles.typeCardTitle}>Physical Symptom</Text>
          <Text style={styles.typeCardSubtitle}>How your body feels right now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.typeCard, { backgroundColor: '#5856D6' }]}
          onPress={() => handleTypeSelection('mental')}
        >
          <Ionicons name="heart-outline" size={40} color="#FFFFFF" />
          <Text style={styles.typeCardTitle}>Mental Symptom</Text>
          <Text style={styles.typeCardSubtitle}>How you're feeling emotionally</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => {
    if (!selectedType) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Loading...</Text>
        </View>
      );
    }
    
    const categories = selectedType === 'physical' ? PHYSICAL_SYMPTOM_CATEGORIES : MENTAL_SYMPTOM_CATEGORIES;
    
    if (!categories || categories.length === 0) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>No categories available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select {selectedType} symptom</Text>
        
        <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderColor: category.color }]}
                onPress={() => handleCategorySelection(category)}
              >
                <Ionicons name={category.icon as any} size={24} color={category.color} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderStep3 = () => {
    if (!selectedCategory) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Loading...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Rate your {selectedCategory.name.toLowerCase()}</Text>
      
      <View style={styles.severityContainer}>
        <Text style={styles.severityLabel}>Severity: {SEVERITY_LABELS[Math.round(severity) - 1]}</Text>
        {Slider ? (
          <Slider
            style={styles.severitySlider}
            minimumValue={1}
            maximumValue={10}
            value={severity}
            onValueChange={setSeverity}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#3A3A3C"
          />
        ) : (
          <Text style={styles.severityLabel}>Slider not available</Text>
        )}
        <View style={styles.severityLabels}>
          <Text style={styles.severityLabelText}>Mild</Text>
          <Text style={styles.severityLabelText}>Severe</Text>
        </View>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.durationOptions}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationOption,
                  duration === option.value && styles.durationOptionSelected
                ]}
                onPress={() => setDuration(option.value)}
              >
                <Text style={[
                  styles.durationOptionText,
                  duration === option.value && styles.durationOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {selectedType === 'physical' && (
        <View style={styles.locationContainer}>
          <Text style={styles.sectionTitle}>Location (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., head, chest, back"
            placeholderTextColor="#8E8E93"
            value={location}
            onChangeText={setLocation}
          />
        </View>
      )}

      <View style={styles.factorsContainer}>
        <Text style={styles.sectionTitle}>What's affecting you? (optional)</Text>
        <View style={styles.factorsGrid}>
          {availableFactors.map((factor) => (
            <TouchableOpacity
              key={factor}
              style={[
                styles.factorChip,
                factors.includes(factor) && styles.factorChipSelected
              ]}
              onPress={() => handleFactorToggle(factor)}
            >
              <Text style={[
                styles.factorChipText,
                factors.includes(factor) && styles.factorChipTextSelected
              ]}>
                {factor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text style={styles.sectionTitle}>Notes (optional)</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          placeholder="Any additional details..."
          placeholderTextColor="#8E8E93"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
    );
  };


  const renderCurrentStep = () => {
    if (!visible) return null;
    
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Symptom</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {step} of 3</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!selectedType || (step === 2 && !selectedCategory) || loading) && styles.nextButtonDisabled
            ]}
            onPress={step === 3 ? handleSubmit : handleNext}
            disabled={!selectedType || (step === 2 && !selectedCategory) || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Log Symptom' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  typeCards: {
    gap: 16,
  },
  typeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  typeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  typeCardSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  categoriesContainer: {
    maxHeight: 400,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  severityContainer: {
    marginBottom: 24,
  },
  severityLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  severitySlider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  severityLabelText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  durationContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
  },
  durationOptionSelected: {
    backgroundColor: '#007AFF',
  },
  durationOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  durationOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#3A3A3C',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  factorsContainer: {
    marginBottom: 24,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
  },
  factorChipSelected: {
    backgroundColor: '#007AFF',
  },
  factorChipText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  factorChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#3A3A3C',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuickSymptomLogModal;
