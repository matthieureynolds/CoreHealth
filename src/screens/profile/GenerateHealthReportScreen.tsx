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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const generateHTML = () => {
    const patientName = user?.displayName || user?.firstName || 'User';
    const currentDate = new Date().toLocaleDateString();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CoreHealth Health Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #007AFF;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .item {
            background-color: #f8f9fa;
            border-left: 4px solid #007AFF;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          .item-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .item-detail {
            color: #666;
            font-size: 14px;
            margin-bottom: 3px;
          }
          .empty-section {
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">CoreHealth Health Report</div>
          <div class="subtitle">Generated on ${currentDate}</div>
          <div class="subtitle">Patient: ${patientName}</div>
        </div>
        
        <div class="warning">
          <strong>⚠️ Confidential Medical Information</strong><br>
          This report contains sensitive health information. Please handle with appropriate care and only share with authorized healthcare providers.
        </div>
    `;

    // Personal Information Section
    if (selectedSections.includes('personal_info')) {
      html += `
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="item">
            <div class="item-title">Basic Information</div>
            <div class="item-detail">Name: ${patientName}</div>
            <div class="item-detail">Age: ${profile?.age || 'Not specified'} years</div>
            <div class="item-detail">Gender: ${profile?.gender || 'Not specified'}</div>
            ${profile?.height ? `<div class="item-detail">Height: ${profile.height} cm</div>` : ''}
            ${profile?.weight ? `<div class="item-detail">Weight: ${profile.weight} kg</div>` : ''}
            ${profile?.bloodType ? `<div class="item-detail">Blood Type: ${profile.bloodType}</div>` : ''}
          </div>
        </div>
      `;
    }

    // Medical Conditions Section
    if (selectedSections.includes('medical_conditions') && profile?.medicalHistory && profile.medicalHistory.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Medical Conditions</div>
      `;
      profile.medicalHistory.forEach((condition, index) => {
        html += `
          <div class="item">
            <div class="item-title">${condition.condition}</div>
            <div class="item-detail">Diagnosed: ${formatDate(condition.diagnosedDate)}</div>
            <div class="item-detail">Severity: ${condition.severity}</div>
            <div class="item-detail">Status: ${condition.status}</div>
            ${condition.resolvedDate ? `<div class="item-detail">Resolved: ${formatDate(condition.resolvedDate)}</div>` : ''}
            ${condition.notes ? `<div class="item-detail">Notes: ${condition.notes}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('medical_conditions')) {
      html += `
        <div class="section">
          <div class="section-title">Medical Conditions</div>
          <div class="empty-section">No medical conditions recorded</div>
        </div>
      `;
    }

    // Medications Section
    if (selectedSections.includes('medications') && profile?.medications && profile.medications.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Current Medications</div>
      `;
      profile.medications.forEach((medication, index) => {
        html += `
          <div class="item">
            <div class="item-title">${medication.name}</div>
            ${medication.dosage ? `<div class="item-detail">Dosage: ${medication.dosage}</div>` : ''}
            ${medication.frequency ? `<div class="item-detail">Frequency: ${medication.frequency}</div>` : ''}
            ${medication.startDate ? `<div class="item-detail">Started: ${formatDate(medication.startDate)}</div>` : ''}
            ${medication.duration ? `<div class="item-detail">Duration: ${medication.duration}</div>` : ''}
            ${medication.notes ? `<div class="item-detail">Notes: ${medication.notes}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('medications')) {
      html += `
        <div class="section">
          <div class="section-title">Current Medications</div>
          <div class="empty-section">No medications recorded</div>
        </div>
      `;
    }

    // Allergies Section
    if (selectedSections.includes('allergies') && profile?.allergies && profile.allergies.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Allergies</div>
      `;
      profile.allergies.forEach((allergy, index) => {
        html += `
          <div class="item">
            <div class="item-title">${allergy.name}</div>
            <div class="item-detail">Severity: ${allergy.severity}</div>
            <div class="item-detail">Status: ${allergy.status}</div>
            <div class="item-detail">Started: ${formatDate(allergy.startDate)}</div>
            ${allergy.endDate ? `<div class="item-detail">Resolved: ${formatDate(allergy.endDate)}</div>` : ''}
            ${allergy.reaction ? `<div class="item-detail">Reaction: ${allergy.reaction}</div>` : ''}
            ${allergy.notes ? `<div class="item-detail">Notes: ${allergy.notes}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('allergies')) {
      html += `
        <div class="section">
          <div class="section-title">Allergies</div>
          <div class="empty-section">No allergies recorded</div>
        </div>
      `;
    }

    // Family History Section
    if (selectedSections.includes('family_history') && profile?.familyHistory && profile.familyHistory.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Family Medical History</div>
      `;
      profile.familyHistory.forEach((condition, index) => {
        html += `
          <div class="item">
            <div class="item-title">${condition.condition}</div>
            <div class="item-detail">Relation: ${condition.relation}</div>
            ${condition.ageOfOnset ? `<div class="item-detail">Age of Onset: ${condition.ageOfOnset} years</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('family_history')) {
      html += `
        <div class="section">
          <div class="section-title">Family Medical History</div>
          <div class="empty-section">No family history recorded</div>
        </div>
      `;
    }

    // Vaccinations Section
    if (selectedSections.includes('vaccinations') && profile?.vaccinations?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Vaccinations</div>
      `;
      profile.vaccinations.forEach((vaccination, index) => {
        html += `
          <div class="item">
            <div class="item-title">${vaccination.name}</div>
            <div class="item-detail">Date Received: ${formatDate(vaccination.date.toISOString())}</div>
            ${vaccination.nextDue ? `<div class="item-detail">Next Due: ${formatDate(vaccination.nextDue.toISOString())}</div>` : ''}
            ${vaccination.location ? `<div class="item-detail">Location: ${vaccination.location}</div>` : ''}
            ${vaccination.batchNumber ? `<div class="item-detail">Batch Number: ${vaccination.batchNumber}</div>` : ''}
            ${vaccination.notes ? `<div class="item-detail">Notes: ${vaccination.notes}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('vaccinations')) {
      html += `
        <div class="section">
          <div class="section-title">Vaccinations</div>
          <div class="empty-section">No vaccinations recorded</div>
        </div>
      `;
    }

    // Screenings Section
    if (selectedSections.includes('screenings') && profile?.screenings?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Health Screenings</div>
      `;
      profile.screenings.forEach((screening, index) => {
        html += `
          <div class="item">
            <div class="item-title">${screening.name}</div>
            <div class="item-detail">Date: ${formatDate(screening.date.toISOString())}</div>
            <div class="item-detail">Result: ${screening.result}</div>
            ${screening.nextDue ? `<div class="item-detail">Next Due: ${formatDate(screening.nextDue.toISOString())}</div>` : ''}
            ${screening.location ? `<div class="item-detail">Location: ${screening.location}</div>` : ''}
            ${screening.notes ? `<div class="item-detail">Notes: ${screening.notes}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('screenings')) {
      html += `
        <div class="section">
          <div class="section-title">Health Screenings</div>
          <div class="empty-section">No screenings recorded</div>
        </div>
      `;
    }

    // Medical Records Section
    if (selectedSections.includes('medical_records') && profile?.medicalRecords?.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">Medical Records</div>
      `;
      profile.medicalRecords.forEach((record, index) => {
        html += `
          <div class="item">
            <div class="item-title">${record.name}</div>
            <div class="item-detail">Type: ${record.type}</div>
            <div class="item-detail">Date: ${formatDate(record.date.toISOString())}</div>
            ${record.fileSize ? `<div class="item-detail">File Size: ${record.fileSize} KB</div>` : ''}
            ${record.notes ? `<div class="item-detail">Notes: ${record.notes}</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    } else if (selectedSections.includes('medical_records')) {
      html += `
        <div class="section">
          <div class="section-title">Medical Records</div>
          <div class="empty-section">No medical records uploaded</div>
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p>Generated by CoreHealth App</p>
          <p>This report is for informational purposes only and should not replace professional medical advice.</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const generateReport = async () => {
    if (selectedSections.length === 0) {
      Alert.alert('Error', 'Please select at least one section to include in the report');
      return;
    }

    setIsGenerating(true);

    try {
      const html = generateHTML();
      
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false
      });

      setIsGenerating(false);

      Alert.alert(
        'Report Generated Successfully!',
        'Your health report has been created as a PDF file.',
        [
          { 
            text: 'View Report', 
            onPress: async () => {
              try {
                await Print.printAsync({ uri });
              } catch (error) {
                Alert.alert('Error', 'Could not open the report');
              }
            }
          },
          { 
            text: 'Share Report', 
            onPress: async () => {
              try {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Health Report'
                  });
                } else {
                  Alert.alert('Sharing not available', 'Sharing is not available on this device');
                }
              } catch (error) {
                Alert.alert('Error', 'Could not share the report');
              }
            }
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (error) {
      setIsGenerating(false);
      Alert.alert('Error', 'Failed to generate the health report. Please try again.');
      console.error('PDF generation error:', error);
    }
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
                Patient: {user?.displayName || user?.firstName || 'User'}
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