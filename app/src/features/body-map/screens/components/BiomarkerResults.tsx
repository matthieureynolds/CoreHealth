import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExtractedBiomarker } from '../../../../shared/services/data/documentProcessor';
import { getBiomarkerStatusColor, getBiomarkerStatusIcon } from '../../utils/biomarkerStatus';
import styles from './BodyMapStyles';

interface BiomarkerResultsProps {
  extractedBiomarkers: ExtractedBiomarker[];
  onBiomarkerPress: (name: string, value: number, status?: string) => void;
}

const groupBiomarkersByOrgan = (biomarkers: ExtractedBiomarker[]) =>
  biomarkers.reduce((groups, biomarker) => {
    const organ = biomarker.organSystem || 'Other';
    if (!groups[organ]) {
      groups[organ] = [];
    }
    groups[organ].push(biomarker);
    return groups;
  }, {} as { [key: string]: ExtractedBiomarker[] });

const BiomarkerResults: React.FC<BiomarkerResultsProps> = ({
  extractedBiomarkers,
  onBiomarkerPress,
}) => {
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
              <Ionicons name="medical" size={16} color="#007AFF" />
              <Text style={styles.organResultsTitle}>{organ}</Text>
            </View>

            {biomarkers.map((biomarker, index) => (
              <TouchableOpacity
                key={`${biomarker.name}-${index}`}
                style={styles.biomarkerResultItem}
                onPress={() =>
                  onBiomarkerPress(biomarker.name, biomarker.value, biomarker.status)
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
                      { color: getBiomarkerStatusColor(biomarker.status) },
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

export default BiomarkerResults;
