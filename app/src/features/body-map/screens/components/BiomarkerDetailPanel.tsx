import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanelPayload } from '../../types';
import { getBiomarkerStatusColor } from '../../utils/biomarkerStatus';
import { getBiomarkerInfo } from '../../../../shared/data/biomarkerDatabase';
import { BiomarkerInfo } from '../../../../shared/components/modals/BiomarkerModal';
import styles from './BodyMapStyles';

interface BiomarkerDetailPanelProps {
  selectedOrganData: PanelPayload | null;
  panelAnim: Animated.Value;
  onClose: () => void;
  onBiomarkerPress: (info: BiomarkerInfo) => void;
}

const { height } = Dimensions.get('window');

const BiomarkerDetailPanel: React.FC<BiomarkerDetailPanelProps> = ({
  selectedOrganData,
  panelAnim,
  onClose,
  onBiomarkerPress,
}) => {
  if (!selectedOrganData) return null;

  const organ = selectedOrganData;

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
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.biomarkerScrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.biomarkerList}>
          {organ.data.biomarkers.map((biomarker, index) => (
            <TouchableOpacity
              key={index}
              style={styles.biomarkerItem}
              onPress={() => {
                const biomarkerInfo = getBiomarkerInfo(
                  biomarker.name,
                  biomarker.value,
                  biomarker.status as 'low' | 'high' | 'normal' | 'critical',
                );
                if (biomarkerInfo) {
                  onBiomarkerPress(biomarkerInfo);
                }
              }}
            >
              <View style={styles.biomarkerColumn1}>
                <Text style={styles.biomarkerName}>{biomarker.name}</Text>
              </View>
              <View style={styles.biomarkerColumn2}>
                <Text
                  style={[
                    styles.biomarkerValue,
                    { color: getBiomarkerStatusColor(biomarker.status), fontWeight: 'bold' },
                  ]}
                >
                  {biomarker.value} {biomarker.unit}
                </Text>
              </View>
              <View style={styles.biomarkerColumn3}>
                <Text style={styles.biomarkerRange}>({biomarker.range})</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default BiomarkerDetailPanel;
