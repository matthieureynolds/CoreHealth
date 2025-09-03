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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Doctor } from '../../types';

const ShareWithDoctorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
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

  // New doctor form state
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    office: '',
    address: '',
    notes: '',
  });

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
    const doctorName = selectedDoctor?.name || 'Healthcare Provider';
    const doctorSpecialty = selectedDoctor?.specialty || 'Medical Professional';
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>CoreHealth Health Report - Shared with Doctor</title>
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
          .doctor-info {
            background-color: #f0f8ff;
            border: 1px solid #007AFF;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .doctor-title {
            font-size: 18px;
            font-weight: bold;
            color: #007AFF;
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
        
        <div class="doctor-info">
          <div class="doctor-title">Shared with Healthcare Provider</div>
          <div class="subtitle">Dr. ${doctorName} - ${doctorSpecialty}</div>
          ${selectedDoctor?.office ? `<div class="subtitle">${selectedDoctor.office}</div>` : ''}
        </div>
        
        <div class="warning">
          <strong>⚠️ Confidential Medical Information</strong><br>
          This report contains sensitive health information shared with your healthcare provider. Please handle with appropriate care and only share with authorized medical professionals.
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
          <p>Shared with Dr. ${doctorName} on ${currentDate}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const addNewDoctor = () => {
    if (!newDoctor.name.trim() || !newDoctor.specialty.trim()) {
      Alert.alert('Error', 'Please enter doctor name and specialty');
      return;
    }

    const doctor: Doctor = {
      id: Date.now().toString(),
      name: newDoctor.name.trim(),
      specialty: newDoctor.specialty.trim(),
      phone: newDoctor.phone.trim(),
      email: newDoctor.email.trim(),
      office: newDoctor.office.trim(),
      address: newDoctor.address.trim(),
      notes: newDoctor.notes.trim(),
      isRegistered: false,
    };

    const updatedDoctors = [...(profile?.doctors || []), doctor];
    updateProfile({
      ...profile,
      doctors: updatedDoctors,
    });

    setSelectedDoctor(doctor);
    setShowAddDoctor(false);
    setNewDoctor({
      name: '',
      specialty: '',
      phone: '',
      email: '',
      office: '',
      address: '',
      notes: '',
    });

    Alert.alert('Success', 'Doctor added successfully');
  };

  const generateAndShareReport = async () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }

    if (selectedSections.length === 0) {
      Alert.alert('Error', 'Please select at least one section to include in the report');
      return;
    }

    setIsGenerating(true);

    try {
      const html = generateHTML();
      
      // Generate PDF with better options
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
        width: 612, // Standard letter size width
        height: 792, // Standard letter size height
        margins: {
          left: 36,
          right: 36,
          top: 36,
          bottom: 36,
        },
      });

      setIsGenerating(false);

      // Create a more user-friendly filename
      const patientName = user?.displayName || user?.firstName || 'User';
      const date = new Date().toISOString().split('T')[0];
      const doctorName = selectedDoctor.name.replace(/\s+/g, '_');
      const filename = `CoreHealth_Report_${patientName.replace(/\s+/g, '_')}_Dr_${doctorName}_${date}.pdf`;

      // Show options for what to do with the PDF
      Alert.alert(
        'Health Report Generated! 📄',
        `Your health report has been created and is ready to share with Dr. ${selectedDoctor.name}.`,
        [
          { 
            text: 'Share with Doctor', 
            onPress: async () => {
              try {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Share Health Report with Dr. ${selectedDoctor.name}`,
                    UTI: 'com.adobe.pdf'
                  });
                } else {
                  Alert.alert('Sharing not available', 'Sharing is not available on this device');
                }
              } catch (error) {
                Alert.alert('Error', 'Could not share the report');
              }
            }
          },
          { 
            text: 'Save to Device', 
            onPress: async () => {
              try {
                // For iOS, we'll use the share sheet which includes save options
                if (Platform.OS === 'ios') {
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                      mimeType: 'application/pdf',
                      dialogTitle: 'Save Health Report',
                      UTI: 'com.adobe.pdf'
                    });
                  }
                } else {
                  // For Android, try to save to Downloads
                  const downloadsDir = FileSystem.documentDirectory + 'Downloads/';
                  await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
                  const newUri = downloadsDir + filename;
                  await FileSystem.copyAsync({ from: uri, to: newUri });
                  Alert.alert('Saved!', `Report saved as ${filename} in Downloads folder.`);
                }
              } catch (error) {
                Alert.alert('Error', 'Could not save the report. Please try sharing instead.');
              }
            }
          },
          { 
            text: 'View Report', 
            onPress: async () => {
              try {
                // Use Linking to open the PDF directly in the default PDF viewer
                const { Linking } = require('react-native');
                const canOpen = await Linking.canOpenURL(uri);
                if (canOpen) {
                  await Linking.openURL(uri);
                } else {
                  // Fallback to sharing if direct opening fails
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, {
                      mimeType: 'application/pdf',
                      dialogTitle: 'View Health Report',
                      UTI: 'com.adobe.pdf'
                    });
                  } else {
                    Alert.alert('Viewing not available', 'PDF viewing is not available on this device');
                  }
                }
              } catch (error) {
                Alert.alert('Error', 'Could not open the report');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
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
          <Text style={styles.headerTitle}>Share with Doctor</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Doctor Selection */}
          <View style={styles.doctorSection}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a registered doctor or add a new one
            </Text>

            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => setShowDoctorPicker(true)}
            >
              {selectedDoctor ? (
                <View style={styles.selectedDoctor}>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>Dr. {selectedDoctor.name}</Text>
                    <Text style={styles.doctorSpecialty}>{selectedDoctor.specialty}</Text>
                    {selectedDoctor.office && (
                      <Text style={styles.doctorOffice}>{selectedDoctor.office}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </View>
              ) : (
                <View style={styles.noDoctorSelected}>
                  <Ionicons name="person-add-outline" size={24} color="#888" />
                  <Text style={styles.noDoctorText}>Select a doctor</Text>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addDoctorButton}
              onPress={() => setShowAddDoctor(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addDoctorButtonText}>Add New Doctor</Text>
            </TouchableOpacity>
          </View>

          {/* Report Sections */}
          <View style={styles.sectionsSection}>
            <Text style={styles.sectionTitle}>Select Information to Share</Text>
            <Text style={styles.sectionSubtitle}>
              Choose which health information to include in the report
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

          {/* Generate and Share Button */}
          <View style={styles.shareSection}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                (!selectedDoctor || selectedSections.length === 0) && styles.disabledButton
              ]}
              onPress={generateAndShareReport}
              disabled={!selectedDoctor || selectedSections.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="share-outline" size={20} color="#fff" />
              )}
              <Text style={styles.shareButtonText}>
                {isGenerating ? 'Generating & Sharing...' : 'Generate & Share Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Doctor Picker Modal */}
      <Modal
        visible={showDoctorPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDoctorPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDoctorPicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {profile?.doctors && profile.doctors.length > 0 ? (
              <>
                <Text style={styles.doctorCountText}>
                  {profile.doctors.length} doctor{profile.doctors.length > 1 ? 's' : ''} available
                </Text>
                {profile.doctors.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={styles.doctorOption}
                    onPress={() => {
                      setSelectedDoctor(doctor);
                      setShowDoctorPicker(false);
                    }}
                  >
                    <View style={styles.doctorOptionInfo}>
                      <Text style={styles.doctorOptionName}>Dr. {doctor.name}</Text>
                      <Text style={styles.doctorOptionSpecialty}>{doctor.specialty}</Text>
                      {doctor.office && (
                        <Text style={styles.doctorOptionOffice}>{doctor.office}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#888" />
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.noDoctorsState}>
                <Ionicons name="people-outline" size={48} color="#666" />
                <Text style={styles.noDoctorsTitle}>No Doctors Added</Text>
                <Text style={styles.noDoctorsSubtitle}>
                  Add a doctor in the "Doctors" tab first, or add a new doctor here
                </Text>
                <TouchableOpacity
                  style={styles.addFromDoctorsButton}
                  onPress={() => {
                    setShowDoctorPicker(false);
                    setShowAddDoctor(true);
                  }}
                >
                  <Text style={styles.addFromDoctorsButtonText}>Add New Doctor</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal
        visible={showAddDoctor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddDoctor(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddDoctor(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Doctor</Text>
            <TouchableOpacity onPress={addNewDoctor}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Doctor Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.name}
                onChangeText={(text) => setNewDoctor({...newDoctor, name: text})}
                placeholder="e.g., John Smith"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Specialty *</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.specialty}
                onChangeText={(text) => setNewDoctor({...newDoctor, specialty: text})}
                placeholder="e.g., Cardiology, General Practice"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.phone}
                onChangeText={(text) => setNewDoctor({...newDoctor, phone: text})}
                placeholder="e.g., +1 (555) 123-4567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.email}
                onChangeText={(text) => setNewDoctor({...newDoctor, email: text})}
                placeholder="e.g., doctor@hospital.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Office/Hospital</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.office}
                onChangeText={(text) => setNewDoctor({...newDoctor, office: text})}
                placeholder="e.g., City General Hospital"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.textInput}
                value={newDoctor.address}
                onChangeText={(text) => setNewDoctor({...newDoctor, address: text})}
                placeholder="e.g., 123 Medical Center Dr"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newDoctor.notes}
                onChangeText={(text) => setNewDoctor({...newDoctor, notes: text})}
                placeholder="Add any additional notes about this doctor"
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
  content: {
    padding: 20,
  },
  doctorSection: {
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
  doctorCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedDoctor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  doctorOffice: {
    fontSize: 14,
    color: '#888',
  },
  noDoctorSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noDoctorText: {
    fontSize: 16,
    color: '#888',
    flex: 1,
    marginLeft: 12,
  },
  addDoctorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF20',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addDoctorButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionsSection: {
    marginBottom: 32,
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
  shareSection: {
    marginBottom: 32,
  },
  shareButton: {
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
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
  doctorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  doctorOptionInfo: {
    flex: 1,
  },
  doctorOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  doctorOptionSpecialty: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  doctorOptionOffice: {
    fontSize: 14,
    color: '#888',
  },
  noDoctorsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDoctorsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  noDoctorsSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
  doctorCountText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  addFromDoctorsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  addFromDoctorsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ShareWithDoctorScreen; 