import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../../../../shared/context/SettingsContext';
import { TravelStackParamList, SerializedTrip } from '../../../../../shared/types';
import JetLagPlanningCard from '../../../../home/travel-health/jet-lag-planning/JetLagPlanningCard';
import { PlanTimeline } from '../../../components/PlanTimeline';
import { EnhancedJetLagService } from '../../../../../shared/services/travel/enhancedJetLagService';
import { PlanDay } from '../../../../../shared/types';
import {
  buildJetLagEvent,
  buildEnhancedTrip,
  TripForPlan,
} from '../../../../../shared/services/travel/jetLagService';
import { colors } from '../../../../../shared/theme/colors';

type TripDetailRoute = RouteProp<TravelStackParamList, 'TripDetail'>;
type TripDetailNav = StackNavigationProp<TravelStackParamList, 'TripDetail'>;

function deserializeTrip(s: SerializedTrip): TripForPlan {
  return {
    id: s.id,
    departureLocation: s.departureLocation,
    destination: s.destination,
    departureDate: new Date(s.departureDate),
    returnDate: s.returnDate ? new Date(s.returnDate) : undefined,
    timezone: s.timezone,
    jetLagPlanner: s.jetLagPlanner,
  };
}

const TripDetailScreen: React.FC = () => {
  const route = useRoute<TripDetailRoute>();
  const navigation = useNavigation<TripDetailNav>();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const trip = deserializeTrip(route.params.trip);

  const [addonsExpanded, setAddonsExpanded] = useState(false);
  const [addonTab, setAddonTab] = useState<'vaccinations' | 'medications'>('vaccinations');
  const [vaxChecked, setVaxChecked] = useState<Record<string, boolean>>({});

  const sleepSchedule = settings?.lifestyle?.sleepSchedule ?? { bedTime: '22:00', wakeUpTime: '07:00' };
  const outboundEvent = buildJetLagEvent(trip, 'outbound', sleepSchedule);
  const returnEvent = buildJetLagEvent(trip, 'return', sleepSchedule);
  const enhancedOutbound = buildEnhancedTrip(trip, 'outbound', sleepSchedule);
  const planDays: PlanDay[] = EnhancedJetLagService.generatePlan(enhancedOutbound);

  const title = `${trip.departureLocation} → ${trip.destination}`;

  const toggleVax = (name: string) => {
    setVaxChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingLeft: 0, paddingRight: 0 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentBlock}>
          <JetLagPlanningCard event={outboundEvent} />
          <View style={styles.timelineWrap}>
            <PlanTimeline planDays={planDays} />
          </View>
          {trip.returnDate ? <JetLagPlanningCard event={returnEvent} /> : null}
        </View>

        <TouchableOpacity
          style={styles.addonToggle}
          onPress={() => setAddonsExpanded((e) => !e)}
          activeOpacity={0.8}
        >
          <Ionicons name={addonsExpanded ? 'remove' : 'add'} size={18} color="#FFFFFF" />
          <Text style={styles.addonToggleText}>Trip Add-ons</Text>
        </TouchableOpacity>

        {addonsExpanded && (
          <View style={styles.addonsContainer}>
            <View style={styles.tabsRow}>
              <TouchableOpacity onPress={() => setAddonTab('vaccinations')}>
                <Text style={[styles.tab, addonTab === 'vaccinations' && styles.tabActive]}>
                  Vaccinations
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAddonTab('medications')}>
                <Text style={[styles.tab, addonTab === 'medications' && styles.tabActive]}>
                  Medications
                </Text>
              </TouchableOpacity>
            </View>
            {addonTab === 'vaccinations' ? (
              <View style={styles.checklistBox}>
                {['COVID-19', 'Hepatitis A', 'Typhoid'].map(vax => (
                  <TouchableOpacity key={vax} style={styles.checklistRow} onPress={() => toggleVax(vax)}>
                    <View style={styles.checklistLeft}>
                      <Ionicons name="shield-checkmark" size={18} color="#34C759" />
                      <Text style={styles.checklistText}>{vax}</Text>
                    </View>
                    <Ionicons
                      name={vaxChecked[vax] ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={vaxChecked[vax] ? '#34C759' : '#8E8E93'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.checklistBox}>
                {['ORS (Oral Rehydration Salts)', 'Antihistamines', 'Pain Relievers'].map(med => (
                  <View key={med} style={styles.checklistRow}>
                    <View style={styles.checklistLeft}>
                      <Ionicons name="medkit" size={18} color="#FF9500" />
                      <Text style={styles.checklistText}>{med}</Text>
                    </View>
                    <Ionicons name="ellipse-outline" size={18} color="#8E8E93" />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 4, paddingTop: 20 },
  contentBlock: { marginBottom: 24 },
  timelineWrap: { marginTop: 12 },
  addonToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', backgroundColor: '#2C2C2E', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 12 },
  addonToggleText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  addonsContainer: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 12, marginBottom: 16 },
  tabsRow: { flexDirection: 'row', gap: 12, marginBottom: 12, justifyContent: 'center' },
  tab: { color: '#8E8E93', fontWeight: '600', fontSize: 13, backgroundColor: '#2C2C2E', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  tabActive: { color: '#FFFFFF', backgroundColor: '#3AABF020' },
  checklistBox: { backgroundColor: '#2C2C2E', borderRadius: 12, padding: 12 },
  checklistRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  checklistLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checklistText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

export default TripDetailScreen;
