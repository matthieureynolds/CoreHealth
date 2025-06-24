import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import BodyMap from './components/BodyMap';
import { organs } from './organs';
import { DocumentProcessor, ProcessedDocument, ExtractedBiomarker } from '../../services/documentProcessor';
import BiomarkerModal, { BiomarkerInfo } from '../../components/common/BiomarkerModal';
import { getBiomarkerInfo } from '../../data/biomarkerDatabase';
import BodySystemSelector, { BodySystemType } from './components/BodySystemSelector';
import SkeletonBodyMap from './components/SkeletonBodyMap';
import CirculationBodyMap from './components/CirculationBodyMap';

const BodyMapScreen: React.FC = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractedBiomarkers, setExtractedBiomarkers] = useState<ExtractedBiomarker[]>([]);
  const [selectedBiomarker, setSelectedBiomarker] = useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<BodySystemType>('organs');
  const { height, width } = Dimensions.get('window');

  const handleOrganPress = (organId: string) => {
    setSelectedOrgan(organId);
    Animated.spring(panelAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleClosePanel = () => {
    Animated.spring(panelAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setSelectedOrgan(null);
    });
  };

  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to scan documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Reduce quality for faster processing
    });

    if (!result.canceled) {
      const docId = Date.now().toString();
      const newDoc = { 
        id: docId,
        type: 'camera', 
        uri: result.assets[0].uri, 
        name: `Scanned Document ${uploadedDocuments.length + 1}`,
        timestamp: new Date(),
        size: result.assets[0].fileSize || 0
      };
      
      setUploadedDocuments(prev => [...prev, newDoc]);
      Alert.alert(
        'Document Scanned Successfully! 📱', 
        'Your document is ready for processing. Tap "Scan My Results" to extract biomarkers using AI.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Scan Now', onPress: () => handleProcessDocument(newDoc) }
        ]
      );
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Check file size (10MB limit)
        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB for optimal processing.');
          return;
        }

        const docId = Date.now().toString();
        const newDoc = { 
          id: docId,
          type: 'upload', 
          uri: asset.uri,
          name: asset.name || `Document ${uploadedDocuments.length + 1}`,
          timestamp: new Date(),
          size: asset.size || 0
        };
        
        setUploadedDocuments(prev => [...prev, newDoc]);
        Alert.alert(
          'Document Uploaded Successfully! 📄', 
          'Your document is ready for processing. Tap "Scan My Results" to extract biomarkers using AI.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Scan Now', onPress: () => handleProcessDocument(newDoc) }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload document. Please try again.');
    }
  };

  const handleProcessDocument = async (document: any) => {
    setIsProcessing(document.id);
    setProcessingStep('Preparing document...');
    
    try {
      // Step-by-step processing with user feedback
      setProcessingStep('📷 Scanning document with AI...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show progress
      
      setProcessingStep('🧠 Extracting biomarkers with GPT...');
      const processedDoc = await DocumentProcessor.processDocument(document.uri, document.name);
      
      setProcessingStep('✅ Processing complete!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessedDocuments(prev => [...prev, processedDoc]);
      setExtractedBiomarkers(prev => [...prev, ...processedDoc.extractedBiomarkers]);
      
      // Update organ biomarkers with extracted data
      const updatedBiomarkers = DocumentProcessor.updateOrganBiomarkers(processedDoc.extractedBiomarkers);
      
      const biomarkerCount = processedDoc.extractedBiomarkers.length;
      const processingTime = processedDoc.processingTimeMs ? Math.round(processedDoc.processingTimeMs / 1000) : 0;
      
      Alert.alert(
        '🎉 Success!', 
        `Found ${biomarkerCount} biomarkers in ${processingTime}s!\n\nYour body map has been updated with the latest lab results.`,
        [
          {
            text: 'View Results',
            onPress: () => {
              // Show the first organ that was updated
              const firstOrgan = Object.keys(updatedBiomarkers)[0];
              if (firstOrgan) {
                handleOrganPress(firstOrgan);
              }
            }
          },
          { text: 'Great!' }
        ]
      );
      
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert(
        'Processing Error', 
        'Unable to process this document. Please ensure it\'s a clear medical report and try again.',
        [
          { text: 'Try Again', onPress: () => handleProcessDocument(document) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessing(null);
      setProcessingStep('');
    }
  };

  const getBiomarkerStatusColor = (status?: string) => {
    switch (status) {
      case 'high':
      case 'critical':
        return '#FF3B30';
      case 'low':
        return '#FF9500';
      case 'normal':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getBiomarkerStatusIcon = (status?: string) => {
    switch (status) {
      case 'high':
      case 'critical':
        return 'warning';
      case 'low':
        return 'alert-circle';
      case 'normal':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const groupBiomarkersByOrgan = (biomarkers: ExtractedBiomarker[]) => {
    const grouped: { [organ: string]: ExtractedBiomarker[] } = {};
    biomarkers.forEach(biomarker => {
      if (!grouped[biomarker.organSystem]) {
        grouped[biomarker.organSystem] = [];
      }
      grouped[biomarker.organSystem].push(biomarker);
    });
    return grouped;
  };

  const handleBiomarkerPress = (biomarkerName: string, value: number, status?: string) => {
    const normalizedStatus = status as 'normal' | 'low' | 'high' | 'critical' || 'normal';
    const biomarkerInfo = getBiomarkerInfo(biomarkerName, value, normalizedStatus);
    
    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setModalVisible(true);
    }
  };

  const handleSystemChange = (system: BodySystemType) => {
    setSelectedSystem(system);
    // Close any open panels when switching systems
    if (selectedOrgan) {
      handleClosePanel();
    }
  };

  const handleSkeletonPartPress = (partId: string) => {
    // Handle skeleton part selection - could open a detailed view
    console.log('Skeleton part pressed:', partId);
    // For now, just show an alert with mock data
    Alert.alert('Skeleton Health', `Selected: ${partId}\nClick to view detailed bone and joint health information.`);
  };

  const handleCirculationPointPress = (pointId: string) => {
    // Handle circulation point selection
    console.log('Circulation point pressed:', pointId);
    Alert.alert('Cardiovascular Health', `Selected: ${pointId}\nClick to view detailed cardiovascular information.`);
  };



  const renderBodyMap = () => {
    switch (selectedSystem) {
      case 'organs':
        return <BodyMap onOrganPress={handleOrganPress} />;
      case 'skeleton':
        return <SkeletonBodyMap onPartPress={handleSkeletonPartPress} />;
      case 'circulation':
        return <CirculationBodyMap onPointPress={handleCirculationPointPress} />;
      default:
        return <BodyMap onOrganPress={handleOrganPress} />;
    }
  };

  const renderBiomarkerResults = () => {
    if (extractedBiomarkers.length === 0) return null;

    const groupedBiomarkers = groupBiomarkersByOrgan(extractedBiomarkers);

    return (
      <View style={styles.biomarkerResults}>
        <Text style={styles.biomarkerResultsTitle}>📊 Your Latest Results</Text>
        <Text style={styles.biomarkerResultsSubtitle}>
          {extractedBiomarkers.length} biomarkers extracted from your lab reports
        </Text>

        {Object.entries(groupedBiomarkers).map(([organ, biomarkers]) => (
          <View key={organ} style={styles.organGroup}>
            <TouchableOpacity 
              style={styles.organGroupHeader}
              onPress={() => handleOrganPress(organ)}
            >
              <Text style={styles.organGroupTitle}>
                {organ.charAt(0).toUpperCase() + organ.slice(1)} ({biomarkers.length})
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <View style={styles.biomarkersList}>
              {biomarkers.slice(0, 3).map((biomarker, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.biomarkerResultItem}
                  onPress={() => handleBiomarkerPress(biomarker.name, biomarker.value, biomarker.status)}
                >
                  <View style={styles.biomarkerResultInfo}>
                    <Text style={styles.biomarkerResultName}>{biomarker.name}</Text>
                    <Text style={styles.biomarkerResultValue}>
                      {biomarker.value} {biomarker.unit}
                      {biomarker.referenceRange && (
                        <Text style={styles.biomarkerResultRange}> ({biomarker.referenceRange})</Text>
                      )}
                    </Text>
                  </View>
                  <View style={[styles.statusIndicator, { backgroundColor: getBiomarkerStatusColor(biomarker.status) }]}>
                    <Ionicons 
                      name={getBiomarkerStatusIcon(biomarker.status)} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </View>
                </TouchableOpacity>
              ))}
              {biomarkers.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => handleOrganPress(organ)}
                >
                  <Text style={styles.viewMoreText}>View {biomarkers.length - 3} more</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderDocumentUploadSection = () => (
    <View style={styles.documentSection}>
      <Text style={styles.sectionTitle}>Upload Your Lab Results</Text>
      <Text style={styles.sectionDescription}>
        Scan or upload your blood test, urine test, or any lab report to automatically update your biomarkers using AI
      </Text>

      <View style={styles.uploadOptions}>
        <TouchableOpacity 
          style={[styles.uploadButton, isProcessing && styles.uploadButtonDisabled]} 
          onPress={handleCameraPress}
          disabled={!!isProcessing}
        >
          <Ionicons name="camera" size={32} color={isProcessing ? "#8E8E93" : "#34C759"} />
          <Text style={[styles.uploadButtonText, isProcessing && styles.uploadButtonTextDisabled]}>
            Scan Document
          </Text>
          <Text style={[styles.uploadButtonSubtext, isProcessing && styles.uploadButtonTextDisabled]}>
            Use camera to scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.uploadButton, isProcessing && styles.uploadButtonDisabled]} 
          onPress={handleDocumentPicker}
          disabled={!!isProcessing}
        >
          <Ionicons name="document" size={32} color={isProcessing ? "#8E8E93" : "#007AFF"} />
          <Text style={[styles.uploadButtonText, isProcessing && styles.uploadButtonTextDisabled]}>
            Upload File
          </Text>
          <Text style={[styles.uploadButtonSubtext, isProcessing && styles.uploadButtonTextDisabled]}>
            Choose from gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Processing Status */}
      {isProcessing && processingStep && (
        <View style={styles.processingStatus}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>{processingStep}</Text>
          <Text style={styles.processingSubtext}>This may take 10-30 seconds</Text>
        </View>
      )}

      {uploadedDocuments.length > 0 && (
        <View style={styles.uploadedDocuments}>
          <Text style={styles.uploadedTitle}>📎 Recent Uploads</Text>
          {uploadedDocuments.slice(-3).map((doc, index) => (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentIcon}>
                <Ionicons 
                  name={doc.type === 'camera' ? 'camera' : 'document'} 
                  size={20} 
                  color="#007AFF" 
                />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>
                  {doc.name.length > 25 ? `${doc.name.substring(0, 25)}...` : doc.name}
                </Text>
                <Text style={styles.documentDate}>
                  {doc.timestamp.toLocaleDateString()} • {doc.size ? `${Math.round(doc.size / 1024)}KB` : 'Unknown size'}
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.processButton,
                  isProcessing === doc.id && styles.processingButton,
                  processedDocuments.some(pd => pd.name === doc.name) && styles.processedButton
                ]}
                onPress={() => handleProcessDocument(doc)}
                disabled={isProcessing === doc.id || processedDocuments.some(pd => pd.name === doc.name)}
              >
                <Text style={[
                  styles.processButtonText,
                  processedDocuments.some(pd => pd.name === doc.name) && styles.processedButtonText
                ]}>
                  {isProcessing === doc.id ? 'Scanning...' : 
                   processedDocuments.some(pd => pd.name === doc.name) ? 'Processed ✓' : 'Scan My Results'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Biomarker Results */}
      {renderBiomarkerResults()}

      <View style={styles.supportedFormats}>
        <Text style={styles.supportedTitle}>✅ Supported formats:</Text>
        <Text style={styles.supportedText}>• Blood test reports (PDF, JPG, PNG)</Text>
        <Text style={styles.supportedText}>• Urine analysis reports</Text>
        <Text style={styles.supportedText}>• Lipid panels, metabolic panels</Text>
        <Text style={styles.supportedText}>• Thyroid function tests</Text>
        <Text style={styles.supportedNote}>Files must be under 10MB for optimal processing</Text>
      </View>
    </View>
  );

  const renderInfoPanel = () => {
    if (!selectedOrgan || !organs[selectedOrgan]) return null;

    const organ = organs[selectedOrgan];
    const data = organ.data;
    const translateY = panelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [height, 0],
    });

    return (
      <Animated.View
        style={[
          styles.infoPanel,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.organTitle}>{data.name}</Text>
          <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.organDescription}>{data.description}</Text>
        
        <ScrollView 
          style={styles.biomarkerScrollView}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.biomarkerList}>
            {data.biomarkers.map((biomarker, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.biomarkerItem}
                onPress={() => handleBiomarkerPress(biomarker.name, biomarker.value, biomarker.status)}
              >
                <Text style={styles.biomarkerName}>{biomarker.name}</Text>
                <Text style={styles.biomarkerValue}>
                  {biomarker.value} {biomarker.unit}
                </Text>
                <Text style={styles.biomarkerRange}>({biomarker.range})</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Body</Text>
        </View>
        
        <BodySystemSelector 
          selectedSystem={selectedSystem}
          onSystemChange={handleSystemChange}
        />
        
        <View style={styles.bodyMapContainer}>
          {renderBodyMap()}
        </View>

        {selectedSystem === 'organs' && renderDocumentUploadSection()}
      </ScrollView>
      
      {renderInfoPanel()}

      <BiomarkerModal
        visible={modalVisible}
        biomarker={selectedBiomarker}
        onClose={() => {
          setModalVisible(false);
          setSelectedBiomarker(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  bodyMapContainer: {
    height: 600,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  documentSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  uploadButtonDisabled: {
    borderColor: '#8E8E93',
  },
  uploadButtonTextDisabled: {
    color: '#8E8E93',
  },
  uploadedDocuments: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  uploadedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  documentIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  processButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  processingButton: {
    backgroundColor: '#FF9500',
  },
  processedButton: {
    backgroundColor: '#34C759',
  },
  processedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  processingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  biomarkerResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  biomarkerResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  biomarkerResultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  organGroup: {
    marginBottom: 16,
  },
  organGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  biomarkersList: {
    marginTop: 8,
  },
  biomarkerResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  biomarkerResultInfo: {
    flex: 1,
  },
  biomarkerResultName: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  biomarkerResultValue: {
    fontSize: 14,
    color: '#666',
  },
  biomarkerResultRange: {
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMoreButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  supportedFormats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  supportedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  supportedText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  supportedNote: {
    fontSize: 12,
    color: '#666',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  organTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  organDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  biomarkerScrollView: {
    flex: 1,
  },
  biomarkerList: {
    gap: 16,
    paddingBottom: 20,
  },
  biomarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  biomarkerName: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  biomarkerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginRight: 8,
  },
  biomarkerRange: {
    fontSize: 14,
    color: '#666',
  },
});

export default BodyMapScreen; 