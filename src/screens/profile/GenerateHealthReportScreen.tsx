import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';

const GenerateHealthReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile } = useHealthData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'personal_info',
    'medical_conditions',
    'medications',
    'allergies',
    'family_history',
    'vaccinations',
    'screenings',
    'medical_records'
  ]);

  const reportSections = [
    { id: 'personal_info', label: 'Personal Information', icon: 'person-outline' },
    { id: 'medical_conditions', label: 'Medical Conditions', icon: 'medical-outline' },
    { id: 'medications', label: 'Medications', icon: 'medical-outline' },
    { id: 'allergies', label: 'Allergies', icon: 'warning-outline' },
    { id: 'family_history', label: 'Family History', icon: 'people-outline' },
    { id: 'vaccinations', label: 'Vaccinations', icon: 'shield-checkmark-outline' },
    { id: 'screenings', label: 'Screenings', icon: 'search-outline' },
    { id: 'medical_records', label: 'Medical Records', icon: 'folder-outline' },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const generateReport = async () => {
    if (selectedSections.length === 0) {
      Alert.alert('Error', 'Please select at least one section to include in the report');
      return;
    }

    setIsGenerating(true);

    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert(
        'Report Generated',
        'Your health report has been generated successfully!',
        [
          { text: 'View Report', onPress: () => viewReport() },
          { text: 'Share Report', onPress: () => shareReport() },
          { text: 'OK', style: 'cancel' }
        ]
      );
    }, 2000);
  };

  const viewReport = () => {
    Alert.alert('View Report', 'PDF viewer would open here to display the generated report');
  };

  const shareReport = () => {
    Alert.alert('Share Report', 'Share options would appear here (email, messaging, etc.)');
  };

  const getSectionCount = (sectionId: string) => {
    switch (sectionId) {
      case 'medical_conditions':
        return profile?.medicalHistory?.length || 0;
      case 'medications':
        return profile?.medications?.length || 0;
      case 'allergies':
        return profile?.allergies?.length || 0;
      case 'family_history':
        return profile?.familyHistory?.length || 0;
      case 'vaccinations':
        return profile?.vaccinations?.length || 0;
      case 'screenings':
        return profile?.screenings?.length || 0;
      case 'medical_records':
        return profile?.medicalRecords?.length || 0;
      default:
        return 0;
    }
  };

  const getSectionIcon = (iconName: string) => {
    return iconName as any;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate Health Report</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Report Info */}
          <View style={styles.infoSection}>
            <Ionicons name="document-text-outline" size={48} color="#007AFF" />
            <Text style={styles.infoTitle}>Health Report</Text>
            <Text style={styles.infoSubtitle}>
              Generate a comprehensive PDF report of your health information
            </Text>
          </View>

          {/* Sections Selection */}
          <View style={styles.sectionsSection}>
            <Text style={styles.sectionTitle}>Select Sections to Include</Text>
            <Text style={styles.sectionSubtitle}>
              Choose which information to include in your health report
            </Text>

            {reportSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionCard,
                  selectedSections.includes(section.id) && styles.selectedSection
                ]}
                onPress={() => toggleSection(section.id)}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionInfo}>
                    <Ionicons 
                      name={getSectionIcon(section.icon)} 
                      size={24} 
                      color={selectedSections.includes(section.id) ? '#007AFF' : '#888'} 
                    />
                    <View style={styles.sectionText}>
                      <Text style={[
                        styles.sectionLabel,
                        selectedSections.includes(section.id) && styles.selectedSectionText
                      ]}>
                        {section.label}
                      </Text>
                      {section.id !== 'personal_info' && (
                        <Text style={styles.sectionCount}>
                          {getSectionCount(section.id)} items
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedSections.includes(section.id) && styles.checkedBox
                  ]}>
                    {selectedSections.includes(section.id) && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <View style={styles.generateSection}>
            <TouchableOpacity
              style={[
                styles.generateButton,
                selectedSections.length === 0 && styles.disabledButton
              ]}
              onPress={generateReport}
              disabled={selectedSections.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="document-text-outline" size={20} color="#fff" />
              )}
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating Report...' : 'Generate Health Report'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Report Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Report Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewHeader}>CoreHealth Health Report</Text>
              <Text style={styles.previewDate}>
                Generated on {new Date().toLocaleDateString()}
              </Text>
              <Text style={styles.previewPatient}>
                Patient: {user?.displayName || 'User'}
              </Text>
              <View style={styles.previewSections}>
                <Text style={styles.previewSectionsTitle}>Included Sections:</Text>
                {selectedSections.map(sectionId => {
                  const section = reportSections.find(s => s.id === sectionId);
                  return (
                    <Text key={sectionId} style={styles.previewSectionItem}>
                      • {section?.label}
                    </Text>
                  );
                })}
              </View>
              <Text style={styles.previewNote}>
                This report contains confidential health information. Please handle with care.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedSection: {
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionText: {
    marginLeft: 12,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  selectedSectionText: {
    color: '#007AFF',
  },
  sectionCount: {
    fontSize: 14,
    color: '#888',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  generateSection: {
    marginBottom: 32,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  previewHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  previewPatient: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  previewSections: {
    marginBottom: 16,
  },
  previewSectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  previewSectionItem: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
    marginLeft: 8,
  },
  previewNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default GenerateHealthReportScreen; 