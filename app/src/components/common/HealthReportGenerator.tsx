import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HealthReport {
  id: string;
  type: string;
  title: string;
  content: string;
  generatedAt: string;
  specialist: string;
}

interface HealthReportGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (report: HealthReport) => void;
  userProfile?: any;
}

const HealthReportGenerator: React.FC<HealthReportGeneratorProps> = ({
  visible,
  onClose,
  onGenerate,
  userProfile,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'dental',
      title: 'Dental Health Report',
      subtitle: 'For dentists and oral health specialists',
      icon: 'tooth',
      color: '#4ECDC4',
      description: 'Includes dental history, current oral health status, and relevant medical conditions that may affect dental treatment.',
    },
    {
      id: 'dermatology',
      title: 'Dermatology Report',
      subtitle: 'For dermatologists and skin specialists',
      icon: 'body',
      color: '#FFB347',
      description: 'Comprehensive skin health overview, allergies, medications, and family history of skin conditions.',
    },
    {
      id: 'cardiology',
      title: 'Cardiology Report',
      subtitle: 'For cardiologists and heart specialists',
      icon: 'heart',
      color: '#FF6B6B',
      description: 'Cardiovascular health summary, risk factors, family history, and current medications affecting heart health.',
    },
    {
      id: 'orthopedic',
      title: 'Orthopedic Report',
      subtitle: 'For orthopedic surgeons and bone specialists',
      icon: 'fitness',
      color: '#96CEB4',
      description: 'Musculoskeletal history, injuries, surgeries, and current physical limitations or conditions.',
    },
    {
      id: 'general',
      title: 'General Health Summary',
      subtitle: 'For general practitioners and family doctors',
      icon: 'medical',
      color: '#45B7D1',
      description: 'Complete health overview including medical history, current conditions, medications, and lifestyle factors.',
    },
    {
      id: 'emergency',
      title: 'Emergency Medical Summary',
      subtitle: 'For emergency room and urgent care',
      icon: 'warning',
      color: '#FF9500',
      description: 'Critical information for emergency situations including allergies, medications, and emergency contacts.',
    },
  ];

  const generateReport = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a report type.');
      return;
    }

    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      const reportType = reportTypes.find(type => type.id === selectedType);
      const report: HealthReport = {
        id: Date.now().toString(),
        type: selectedType,
        title: reportType?.title || 'Health Report',
        specialist: reportType?.subtitle || '',
        generatedAt: new Date().toISOString(),
        content: generateReportContent(selectedType, userProfile),
      };

      onGenerate(report);
      setIsGenerating(false);
      onClose();
    }, 3000);
  };

  const generateReportContent = (type: string, profile: any): string => {
    const baseInfo = `
PATIENT INFORMATION
Name: ${profile?.displayName || 'Not provided'}
Age: ${profile?.age || 'Not provided'}
Gender: ${profile?.gender || 'Not provided'}
Blood Type: ${profile?.bloodType || 'Not provided'}

MEDICAL HISTORY
Conditions: ${profile?.medicalHistory?.map((c: any) => c.condition).join(', ') || 'None reported'}
Allergies: ${profile?.allergies?.join(', ') || 'None reported'}
Medications: ${profile?.medications?.join(', ') || 'None reported'}
Surgeries: ${profile?.surgeries?.map((s: any) => s.procedure).join(', ') || 'None reported'}

FAMILY HISTORY
${profile?.familyHistory?.map((f: any) => `${f.relation}: ${f.condition}`).join('\n') || 'None reported'}

LIFESTYLE FACTORS
Smoking: ${profile?.lifestyle?.smoking?.status || 'Not specified'}
Alcohol: ${profile?.lifestyle?.alcohol?.frequency || 'Not specified'}
Exercise: ${profile?.lifestyle?.exercise?.frequency || 'Not specified'}
Diet: ${profile?.lifestyle?.diet?.type || 'Not specified'}
`;

    switch (type) {
      case 'dental':
        return `${baseInfo}

DENTAL-SPECIFIC INFORMATION
Oral Health History: Based on available medical records
Current Dental Concerns: None reported
Medications Affecting Dental Treatment: ${profile?.medications?.filter((m: string) => 
          m.toLowerCase().includes('blood') || m.toLowerCase().includes('heart')).join(', ') || 'None identified'}
Dental Allergies: ${profile?.allergies?.filter((a: string) => 
          a.toLowerCase().includes('latex') || a.toLowerCase().includes('anesthetic')).join(', ') || 'None reported'}

RECOMMENDATIONS
- Review complete dental history during consultation
- Consider blood thinning medications for dental procedures
- Verify latex allergy status before treatment
- Monitor for any signs of oral health complications`;

      case 'dermatology':
        return `${baseInfo}

DERMATOLOGY-SPECIFIC INFORMATION
Skin Conditions: ${profile?.medicalHistory?.filter((c: any) => 
          c.condition.toLowerCase().includes('skin') || c.condition.toLowerCase().includes('dermat')).map((c: any) => c.condition).join(', ') || 'None reported'}
Skin Allergies: ${profile?.allergies?.filter((a: string) => 
          a.toLowerCase().includes('latex') || a.toLowerCase().includes('nickel') || a.toLowerCase().includes('cosmetic')).join(', ') || 'None reported'}
Sun Sensitivity: Not specified
Previous Skin Treatments: None reported

RECOMMENDATIONS
- Conduct full body skin examination
- Review family history of skin conditions
- Consider patch testing for identified allergies
- Monitor for any new skin changes or lesions`;

      case 'cardiology':
        return `${baseInfo}

CARDIOLOGY-SPECIFIC INFORMATION
Cardiovascular Conditions: ${profile?.medicalHistory?.filter((c: any) => 
          c.condition.toLowerCase().includes('heart') || c.condition.toLowerCase().includes('cardio') || c.condition.toLowerCase().includes('hypertension')).map((c: any) => c.condition).join(', ') || 'None reported'}
Family Heart History: ${profile?.familyHistory?.filter((f: any) => 
          f.condition.toLowerCase().includes('heart') || f.condition.toLowerCase().includes('cardio')).map((f: any) => `${f.relation}: ${f.condition}`).join(', ') || 'None reported'}
Cardiac Medications: ${profile?.medications?.filter((m: string) => 
          m.toLowerCase().includes('blood') || m.toLowerCase().includes('heart') || m.toLowerCase().includes('pressure')).join(', ') || 'None reported'}

RECOMMENDATIONS
- Review complete cardiovascular history
- Consider family history of heart conditions
- Monitor blood pressure and heart rate
- Assess cardiovascular risk factors
- Review current medications for cardiac effects`;

      case 'orthopedic':
        return `${baseInfo}

ORTHOPEDIC-SPECIFIC INFORMATION
Musculoskeletal Conditions: ${profile?.medicalHistory?.filter((c: any) => 
          c.condition.toLowerCase().includes('joint') || c.condition.toLowerCase().includes('bone') || c.condition.toLowerCase().includes('spine')).map((c: any) => c.condition).join(', ') || 'None reported'}
Previous Injuries: None reported
Previous Surgeries: ${profile?.surgeries?.map((s: any) => s.procedure).join(', ') || 'None reported'}
Physical Limitations: Not specified

RECOMMENDATIONS
- Review complete musculoskeletal history
- Assess current range of motion and function
- Consider previous injuries and surgeries
- Evaluate for any chronic pain conditions
- Review imaging studies if available`;

      case 'emergency':
        return `${baseInfo}

EMERGENCY CRITICAL INFORMATION
Blood Type: ${profile?.bloodType || 'Unknown'}
Allergies: ${profile?.allergies?.join(', ') || 'None'}
Current Medications: ${profile?.medications?.join(', ') || 'None'}
Emergency Contacts: ${profile?.emergencyContacts?.map((c: any) => `${c.name}: ${c.phone}`).join(', ') || 'None provided'}

CRITICAL ALERTS
- Verify blood type before transfusion
- Check for listed allergies before medication administration
- Review current medications for interactions
- Contact emergency contacts if patient is unable to communicate

EMERGENCY PROTOCOLS
- Follow standard emergency protocols
- Check for medical alert bracelet or information
- Review recent medical history for relevant conditions
- Monitor vital signs and respond to changes`;

      default:
        return `${baseInfo}

GENERAL HEALTH SUMMARY
Overall Health Status: Based on available information
Risk Factors: To be assessed during consultation
Preventive Care Recommendations: To be determined
Follow-up Requirements: As needed based on consultation

RECOMMENDATIONS
- Complete comprehensive physical examination
- Review all current medications and supplements
- Assess lifestyle factors and provide recommendations
- Schedule appropriate preventive screenings
- Address any specific health concerns`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generate Health Report</Text>
          <TouchableOpacity 
            onPress={generateReport} 
            style={[styles.generateButton, !selectedType && styles.generateButtonDisabled]}
            disabled={!selectedType || isGenerating}
          >
            <Text style={[styles.generateButtonText, !selectedType && styles.generateButtonTextDisabled]}>
              {isGenerating ? 'Generating...' : 'Generate'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Specialist Health Reports</Text>
            <Text style={styles.introSubtitle}>
              Generate comprehensive health reports tailored for specific medical specialists. 
              Each report includes relevant medical history, current conditions, and specialist-specific recommendations.
            </Text>
          </View>

          {/* Report Types */}
          <View style={styles.reportTypesSection}>
            <Text style={styles.sectionTitle}>Select Report Type</Text>
            
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.reportTypeCard,
                  selectedType === type.id && { borderColor: type.color, borderWidth: 2 }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View style={styles.reportTypeHeader}>
                  <View style={[styles.reportTypeIcon, { backgroundColor: type.color }]}>
                    <Ionicons name={type.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.reportTypeInfo}>
                    <Text style={styles.reportTypeTitle}>{type.title}</Text>
                    <Text style={styles.reportTypeSubtitle}>{type.subtitle}</Text>
                  </View>
                  {selectedType === type.id && (
                    <View style={[styles.selectedIndicator, { backgroundColor: type.color }]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.reportTypeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generating State */}
          {isGenerating && (
            <View style={styles.generatingSection}>
              <View style={styles.generatingIcon}>
                <Ionicons name="analytics" size={48} color="#007AFF" />
              </View>
              <Text style={styles.generatingTitle}>Generating Report</Text>
              <Text style={styles.generatingSubtitle}>
                Creating a comprehensive health report for your specialist...
              </Text>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 8,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateButtonTextDisabled: {
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  reportTypesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  reportTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTypeInfo: {
    flex: 1,
  },
  reportTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  reportTypeSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportTypeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  generatingSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  generatingIcon: {
    marginBottom: 16,
  },
  generatingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  generatingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HealthReportGenerator; 