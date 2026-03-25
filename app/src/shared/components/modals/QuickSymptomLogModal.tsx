import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymptomCategory, QuickLogData } from '../../types/symptoms';
import { symptomService } from '../../services/user/symptomService';
import StepTypeSelection from './components/StepTypeSelection';
import StepCategorySelection from './components/StepCategorySelection';
import StepSeverityDetails from './components/StepSeverityDetails';

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

  useEffect(() => {
    if (visible) {
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

  const handleFactorToggle = (factor: string) => {
    setFactors(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]
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

  const renderCurrentStep = () => {
    if (!visible) return null;
    switch (step) {
      case 1:
        return <StepTypeSelection onSelect={handleTypeSelection} />;
      case 2:
        return <StepCategorySelection selectedType={selectedType} onSelect={handleCategorySelection} />;
      case 3:
        return (
          <StepSeverityDetails
            selectedType={selectedType}
            selectedCategory={selectedCategory}
            severity={severity}
            onSeverityChange={setSeverity}
            duration={duration}
            onDurationChange={setDuration}
            location={location}
            onLocationChange={setLocation}
            factors={factors}
            onFactorToggle={handleFactorToggle}
            notes={notes}
            onNotesChange={setNotes}
          />
        );
      default:
        return <StepTypeSelection onSelect={handleTypeSelection} />;
    }
  };

  if (!visible) return null;

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
              (!selectedType || (step === 2 && !selectedCategory) || loading) && styles.nextButtonDisabled,
            ]}
            onPress={step === 3 ? handleSubmit : () => setStep(step + 1)}
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
