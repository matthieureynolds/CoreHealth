import React from 'react';
import { View, Text, Animated } from 'react-native';
import { styles } from '../../TravelScreen.styles';
import { GENERAL_MEDS } from '../../travelMetricHelpers';

interface VaccinationsMedicationsSectionProps {
  getRowAnim: (key: string) => { opacity: Animated.Value; translate: Animated.Value };
}

const VaccinationsMedicationsSection: React.FC<VaccinationsMedicationsSectionProps> = ({ getRowAnim }) => (
  <>
    {/* Vaccinations */}
    <Animated.View
      style={[
        styles.vaccinationSection,
        {
          opacity: getRowAnim('vaccinations').opacity,
          transform: [{ translateY: getRowAnim('vaccinations').translate }],
        },
      ]}
    >
      <View style={styles.sectionGroupCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Vaccinations</Text>
        </View>
        <View style={styles.vaccineRow}>
          <View style={styles.vaccineLeft}>
            <Text style={styles.vaccineName}>COVID-19</Text>
          </View>
          <View style={styles.vaccineRight}>
            <Text style={[styles.vaccineBadge, { color: '#FF3B30' }]}>Required</Text>
          </View>
        </View>
        <View style={styles.vaccineRow}>
          <View style={styles.vaccineLeft}>
            <Text style={styles.vaccineName}>Hepatitis A</Text>
          </View>
          <View style={styles.vaccineRight}>
            <Text style={[styles.vaccineBadge, { color: '#FF9F0A' }]}>Recommended</Text>
          </View>
        </View>
        <View style={styles.vaccineRow}>
          <View style={styles.vaccineLeft}>
            <Text style={styles.vaccineName}>Typhoid</Text>
          </View>
          <View style={styles.vaccineRight}>
            <Text style={[styles.vaccineBadge, { color: '#FF9F0A' }]}>Recommended</Text>
          </View>
        </View>
      </View>
    </Animated.View>

    {/* Medications */}
    <View style={styles.medicationSection}>
      <View style={styles.sectionGroupCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Medications</Text>
        </View>
        {GENERAL_MEDS.map((m: { name: string; note: string }, idx: number) => (
          <View key={`gen-${m.name}-${idx}`} style={styles.vaccineRow}>
            <View style={styles.vaccineLeft}>
              <Text style={styles.vaccineName}>{m.name}</Text>
            </View>
            <View style={styles.vaccineRight}>
              <Text style={styles.vaccineBadge}>{(m as any).note}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  </>
);

export default VaccinationsMedicationsSection;
