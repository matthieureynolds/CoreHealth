import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import BodyMap from './components/BodyMap';
import { organsList } from './organs';
import {
  DocumentProcessor,
  ProcessedDocument,
  ExtractedBiomarker,
} from '../../services/documentProcessor';
import BiomarkerModal, {
  BiomarkerInfo,
} from '../../components/common/BiomarkerModal';
import { getBiomarkerInfo } from '../../data/biomarkerDatabase';
import BodySystemSelector, {
  BodySystemType,
} from './components/BodySystemSelector';
import SkeletonBodyMap from './components/SkeletonBodyMap';
import CirculationBodyMap from './components/CirculationBodyMap';
import NutritionBodyMap from './components/NutritionBodyMap';

const BodyMapScreen: React.FC = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [processedDocuments, setProcessedDocuments] = useState<
    ProcessedDocument[]
  >([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [extractedBiomarkers, setExtractedBiomarkers] = useState<
    ExtractedBiomarker[]
  >([]);
  const [selectedBiomarker, setSelectedBiomarker] =
    useState<BiomarkerInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSystem, setSelectedSystem] =
    useState<BodySystemType>('organs');
  const getWindowDimensions = () => {
    try {
      return Dimensions.get('window');
    } catch (error) {
      return { width: 375, height: 812 }; // fallback dimensions
    }
  };

  const { height, width } = getWindowDimensions();

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
      Alert.alert(
        'Permission Required',
        'Camera permission is required to scan documents.',
      );
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
        size: result.assets[0].fileSize || 0,
      };

      setUploadedDocuments(prev => [...prev, newDoc]);
      Alert.alert(
        'Document Scanned Successfully! 📱',
        'Your document is ready for processing. Tap "Scan My Results" to extract biomarkers using AI.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Scan Now', onPress: () => handleProcessDocument(newDoc) },
        ],
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
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB for optimal processing.',
          );
          return;
        }

        const docId = Date.now().toString();
        const newDoc = {
          id: docId,
          type: 'upload',
          uri: asset.uri,
          name: asset.name || `Document ${uploadedDocuments.length + 1}`,
          timestamp: new Date(),
          size: asset.size || 0,
        };

        setUploadedDocuments(prev => [...prev, newDoc]);
        Alert.alert(
          'Document Uploaded Successfully! 📄',
          'Your document is ready for processing. Tap "Scan My Results" to extract biomarkers using AI.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Scan Now', onPress: () => handleProcessDocument(newDoc) },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        'Upload Error',
        'Failed to upload document. Please try again.',
      );
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
      const processedDoc = await DocumentProcessor.processDocument(
        document.uri,
        document.name,
      );

      setProcessingStep('✅ Processing complete!');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessedDocuments(prev => [...prev, processedDoc]);
      setExtractedBiomarkers(prev => [
        ...prev,
        ...processedDoc.extractedBiomarkers,
      ]);

      // Update organ biomarkers with extracted data
      const updatedBiomarkers = DocumentProcessor.updateOrganBiomarkers(
        processedDoc.extractedBiomarkers,
      );

      const biomarkerCount = processedDoc.extractedBiomarkers.length;
      const processingTime = processedDoc.processingTimeMs
        ? Math.round(processedDoc.processingTimeMs / 1000)
        : 0;

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
            },
          },
          { text: 'Continue', style: 'cancel' },
        ],
      );
    } catch (error) {
      console.error('Document processing error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process document. Please try again with a clearer image or different document.',
      );
    } finally {
      setIsProcessing(null);
      setProcessingStep('');
    }
  };

  const getBiomarkerStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return '#30D158';
      case 'low':
        return '#FF9F0A';
      case 'high':
        return '#FF6B35';
      case 'critical':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getBiomarkerStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return 'checkmark-circle';
      case 'low':
        return 'arrow-down-circle';
      case 'high':
        return 'arrow-up-circle';
      case 'critical':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const groupBiomarkersByOrgan = (biomarkers: ExtractedBiomarker[]) => {
    return biomarkers.reduce((groups, biomarker) => {
      const organ = biomarker.organ || 'Other';
      if (!groups[organ]) {
        groups[organ] = [];
      }
      groups[organ].push(biomarker);
      return groups;
    }, {} as { [key: string]: ExtractedBiomarker[] });
  };

  const handleBiomarkerPress = (
    biomarkerName: string,
    value: number,
    status?: string,
  ) => {
    const biomarkerStatus = status as 'normal' | 'low' | 'high' | 'critical';
    const biomarkerInfo = getBiomarkerInfo(
      biomarkerName,
      value,
      biomarkerStatus || 'normal',
    );

    if (biomarkerInfo) {
      setSelectedBiomarker(biomarkerInfo);
      setModalVisible(true);
    }
  };

  const handleSystemChange = (system: BodySystemType) => {
    setSelectedSystem(system);
    setSelectedOrgan(null);
    panelAnim.setValue(0);
  };

  const handleSkeletonPartPress = (partId: string) => {
    console.log('Skeleton part pressed:', partId);
  };

  const handleCirculationPointPress = (pointId: string) => {
    console.log('Circulation point pressed:', pointId);
  };

  const handleNutritionItemPress = (item: any) => {
    // Handle nutrition item press - could show detailed modal
    console.log('Nutrition item pressed:', item.name);
  };

  const renderBodyMap = () => {
    switch (selectedSystem) {
      case 'organs':
        return <BodyMap onOrganPress={handleOrganPress} />;
      case 'skeleton':
        return <SkeletonBodyMap onPartPress={handleSkeletonPartPress} />;
      case 'circulation':
        return <CirculationBodyMap onPointPress={handleCirculationPointPress} />;
      case 'nutrition':
        return <NutritionBodyMap onNutritionItemPress={handleNutritionItemPress} />;
      default:
        return <BodyMap onOrganPress={handleOrganPress} />;
    }
  };

  const renderBiomarkerResults = () => {
    if (extractedBiomarkers.length === 0) return null;

    const groupedBiomarkers = groupBiomarkersByOrgan(extractedBiomarkers);

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Extracted Biomarkers</Text>
          <Text style={styles.resultsSubtitle}>
            {extractedBiomarkers.length} biomarkers found
        </Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.resultsScrollContainer}
        >
        {Object.entries(groupedBiomarkers).map(([organ, biomarkers]) => (
            <View key={organ} style={styles.organResultsCard}>
              <View style={styles.organResultsHeader}>
                <Ionicons 
                  name="medical" 
                  size={16} 
                  color="#007AFF" 
                />
                <Text style={styles.organResultsTitle}>{organ}</Text>
              </View>
              
              {biomarkers.map((biomarker, index) => (
                <TouchableOpacity
                  key={`${biomarker.name}-${index}`}
                  style={styles.biomarkerResultItem}
                  onPress={() =>
                    handleBiomarkerPress(
                      biomarker.name,
                      biomarker.value,
                      biomarker.status,
                    )
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.biomarkerResultContent}>
                    <Text style={styles.biomarkerResultName} numberOfLines={1}>
                      {biomarker.name}
                    </Text>
                    <Text style={styles.biomarkerResultValue}>
                      {biomarker.value} {biomarker.unit}
                    </Text>
                  </View>
                  
                  <View style={styles.biomarkerResultStatus}>
                    <Ionicons
                      name={getBiomarkerStatusIcon(biomarker.status)}
                      size={16}
                      color={getBiomarkerStatusColor(biomarker.status)}
                    />
                    <Text 
                      style={[
                        styles.biomarkerResultStatusText,
                        { color: getBiomarkerStatusColor(biomarker.status) }
                      ]}
                    >
                      {biomarker.status?.toUpperCase() || 'NORMAL'}
                  </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        ))}
        </ScrollView>
      </View>
    );
  };

  const renderDocumentUploadSection = () => {
    const getSectionTitle = () => {
      if (uploadedDocuments.length === 0) {
        return 'Upload Lab Results';
      }
      return `Uploaded Documents (${uploadedDocuments.length})`;
    };

    const getSectionDescription = () => {
      if (uploadedDocuments.length === 0) {
        return 'Scan or upload your lab results to see biomarkers on your body map';
      }
      return 'Tap on any document to process it with AI and extract biomarkers';
    };

    const getSupportedFormats = () => {
      return 'Supports: PDF, JPG, PNG, HEIC';
    };

    return (
      <View style={styles.uploadSection}>
        <View style={styles.uploadHeader}>
          <Text style={styles.uploadTitle}>{getSectionTitle()}</Text>
          <Text style={styles.uploadDescription}>{getSectionDescription()}</Text>
          <Text style={styles.uploadFormats}>{getSupportedFormats()}</Text>
        </View>

        <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity
            style={styles.uploadButton}
          onPress={handleCameraPress}
            activeOpacity={0.8}
          >
            <View style={styles.uploadButtonContent}>
              <View style={styles.uploadButtonIcon}>
                <Ionicons name="camera" size={24} color="#007AFF" />
              </View>
              <Text style={styles.uploadButtonText}>Scan Document</Text>
              <Text style={styles.uploadButtonSubtext}>Use Camera</Text>
            </View>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.uploadButton}
          onPress={handleDocumentPicker}
            activeOpacity={0.8}
          >
            <View style={styles.uploadButtonContent}>
              <View style={styles.uploadButtonIcon}>
                <Ionicons name="folder-open" size={24} color="#007AFF" />
              </View>
              <Text style={styles.uploadButtonText}>Choose File</Text>
              <Text style={styles.uploadButtonSubtext}>From Device</Text>
            </View>
        </TouchableOpacity>
      </View>

      {uploadedDocuments.length > 0 && (
          <View style={styles.documentsList}>
            <Text style={styles.documentsTitle}>Recent Documents</Text>
            {uploadedDocuments.map((doc, index) => (
            <View key={doc.id} style={styles.documentItem}>
                <View style={styles.documentInfo}>
                <Ionicons
                  name={doc.type === 'camera' ? 'camera' : 'document'}
                  size={20}
                    color="#8E8E93"
                />
                  <View style={styles.documentDetails}>
                    <Text style={styles.documentName} numberOfLines={1}>
                      {doc.name}
                </Text>
                    <Text style={styles.documentMeta}>
                      {doc.timestamp.toLocaleDateString()} • {doc.type}
                </Text>
              </View>
                </View>

                <View style={styles.documentActions}>
                  {isProcessing === doc.id ? (
                    <View style={styles.processingIndicator}>
                      <ActivityIndicator size="small" color="#007AFF" />
                      <Text style={styles.processingText}>{processingStep}</Text>
                    </View>
                  ) : (
              <TouchableOpacity
                      style={styles.processButton}
                onPress={() => handleProcessDocument(doc)}
                      activeOpacity={0.7}
              >
                      <Text style={styles.processButtonText}>Scan Results</Text>
              </TouchableOpacity>
                  )}
                </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
  };

  const renderInfoPanel = () => {
    if (!selectedOrgan) return null;

    const organ = organsList.find(o => o.id === selectedOrgan);
    if (!organ) return null;

    return (
      <Animated.View
        style={[
          styles.infoPanel,
          {
            transform: [
              {
                translateY: panelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <View style={styles.panelHeaderContent}>
            <Text style={styles.panelTitle}>{organ.data.name}</Text>
            <Text style={styles.panelSubtitle}>{organ.data.description}</Text>
          </View>
          <TouchableOpacity onPress={handleClosePanel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.panelContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.biomarkersSection}>
            <Text style={styles.biomarkersTitle}>Key Biomarkers</Text>
            {organ.data.biomarkers.map((biomarker, index) => (
              <TouchableOpacity
                key={index}
                style={styles.biomarkerItem}
                onPress={() =>
                  handleBiomarkerPress(
                    biomarker.name,
                    biomarker.value,
                    biomarker.status,
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.biomarkerContent}>
                <Text style={styles.biomarkerName}>{biomarker.name}</Text>
                <Text style={styles.biomarkerValue}>
                  {biomarker.value} {biomarker.unit}
                </Text>
                  <Text style={styles.biomarkerRange}>
                    ({biomarker.referenceRange})
                  </Text>
                </View>
                
                <View style={styles.biomarkerStatus}>
                  <Ionicons
                    name={getBiomarkerStatusIcon(biomarker.status)}
                    size={16}
                    color={getBiomarkerStatusColor(biomarker.status)}
                  />
                  <Text
                    style={[
                      styles.biomarkerStatusText,
                      { color: getBiomarkerStatusColor(biomarker.status) },
                    ]}
                  >
                    {biomarker.status?.toUpperCase() || 'NORMAL'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {organ.recommendations && organ.recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
              {organ.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Body</Text>
          <Text style={styles.headerSubtitle}>Explore your organs, track biomarkers, and upload lab results for AI-powered health insights</Text>
        </View>
        </View>

      {/* Body System Selector */}
        <BodySystemSelector
          selectedSystem={selectedSystem}
          onSystemChange={handleSystemChange}
        />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Body Map */}
        {selectedSystem === 'nutrition' ? (
          renderBodyMap()
        ) : (
          <View style={styles.bodyMapContainer}>
            {renderBodyMap()}
          </View>
        )}

        {/* Biomarker Results */}
        {renderBiomarkerResults()}

        {/* Document Upload Section */}
        {renderDocumentUploadSection()}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Info Panel */}
      {renderInfoPanel()}

      {/* Biomarker Modal */}
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32, // Match Health Assistant height
    paddingBottom: 2, // Match Health Assistant height
    backgroundColor: '#000000',
  },
  headerContent: {
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bodyMapContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  resultsScrollContainer: {
    paddingRight: 16,
  },
  organResultsCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  organResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  organResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  biomarkerResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  biomarkerResultContent: {
    flex: 1,
  },
  biomarkerResultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  biomarkerResultValue: {
    fontSize: 12,
    color: '#8E8E93',
  },
  biomarkerResultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biomarkerResultStatusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  uploadSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadHeader: {
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  uploadFormats: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  uploadButtonContent: {
    alignItems: 'center',
  },
  uploadButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  documentsList: {
    marginTop: 16,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 12,
    color: '#8E8E93',
  },
  documentActions: {
    alignItems: 'flex-end',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
  },
  processButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  processButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  panelHeaderContent: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  biomarkersSection: {
    paddingVertical: 16,
  },
  biomarkersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  biomarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  biomarkerContent: {
    flex: 1,
  },
  biomarkerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  biomarkerValue: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  biomarkerRange: {
    fontSize: 12,
    color: '#8E8E93',
  },
  biomarkerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biomarkerStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendationsSection: {
    paddingVertical: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default BodyMapScreen;
