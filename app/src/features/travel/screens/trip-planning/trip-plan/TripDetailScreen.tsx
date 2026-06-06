import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../../../../shared/context/SettingsContext';
import { TravelStackParamList, SerializedTrip } from '../../../../../shared/types';
import { EnhancedJetLagService } from '../../../../../shared/services/travel/enhancedJetLagService';
import { PlanDay, Action } from '../../../../../shared/types';
import {
  buildEnhancedTrip,
  TripForPlan,
  getCityUtcOffsetHours,
} from '../../../../../shared/services/travel/jetLagService';

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

function getCityCode(location: string): string {
  const city = location.split(',')[0].trim();
  const codes: Record<string, string> = {
    london: 'LDN', paris: 'PAR', madrid: 'MAD', tokyo: 'TYO',
    'new york': 'NYC', 'los angeles': 'LAX', dubai: 'DXB',
    singapore: 'SIN', sydney: 'SYD', rome: 'ROM', berlin: 'BER',
    amsterdam: 'AMS', bangkok: 'BKK', barcelona: 'BCN', lisbon: 'LIS',
    milan: 'MIL', munich: 'MUC', vienna: 'VIE', zurich: 'ZRH',
    istanbul: 'IST', cairo: 'CAI', nairobi: 'NBO', toronto: 'YTO',
    'san francisco': 'SFO', chicago: 'CHI', miami: 'MIA', seattle: 'SEA',
    boston: 'BOS', denver: 'DEN', honolulu: 'HNL', 'hong kong': 'HKG',
    seoul: 'SEL', beijing: 'PEK', shanghai: 'SHA', mumbai: 'BOM',
    delhi: 'DEL', 'cape town': 'CPT', rio: 'RIO', 'buenos aires': 'BUE',
    mexico: 'MEX', lagos: 'LOS', accra: 'ACC', marrakech: 'RAK',
  };
  return codes[city.toLowerCase()] || city.slice(0, 3).toUpperCase();
}

function formatDateRange(dep: Date, ret?: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return ret ? `${fmt(dep)} – ${fmt(ret)}` : fmt(dep);
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatChipDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

// Action → display config
const ACTION_CONFIG: Record<string, { emoji: string; title: string; blockStyle: keyof typeof blockColors }> = {
  sleep: { emoji: '🌙', title: 'Sleep', blockStyle: 'sleep' },
  seek_light: { emoji: '☀️', title: 'Seek Light', blockStyle: 'light' },
  avoid_light: { emoji: '🌑', title: 'Avoid Light', blockStyle: 'lightAvoid' },
  caffeine_ok: { emoji: '☕', title: 'Caffeine OK', blockStyle: 'caffeine' },
  caffeine_cutoff: { emoji: '🚫', title: 'Caffeine Cutoff', blockStyle: 'caffeineCut' },
  melatonin: { emoji: '💊', title: 'Melatonin', blockStyle: 'melatonin' },
  nap: { emoji: '😴', title: 'Nap', blockStyle: 'sleep' },
  in_flight: { emoji: '✈️', title: 'In Flight', blockStyle: 'flight' },
};

const blockColors = {
  sleep: { bg: 'rgba(88,86,214,0.10)', border: '#5856D6' },
  light: { bg: 'rgba(255,214,10,0.07)', border: '#FFD60A' },
  lightAvoid: { bg: 'rgba(100,100,130,0.08)', border: '#636366' },
  caffeine: { bg: 'rgba(255,149,0,0.07)', border: '#FF9500' },
  caffeineCut: { bg: 'rgba(255,69,58,0.06)', border: '#FF453A' },
  melatonin: { bg: 'rgba(175,130,255,0.08)', border: '#AF82FF' },
  flight: { bg: 'rgba(0,122,255,0.07)', border: '#007AFF' },
};

function formatActionTime(action: Action): string {
  if (action.start_local && action.end_local) {
    return `${action.start_local}–${action.end_local}`;
  }
  if (action.at_local) {
    return action.at_local.startsWith('After') ? action.at_local : action.at_local;
  }
  return '';
}

function getActionSubtitle(action: Action): string | null {
  if (action.type === 'sleep') return 'Shift bedtime earlier';
  if (action.type === 'seek_light') return 'Get outdoor morning light';
  if (action.type === 'avoid_light') return 'Dim screens, stay indoors';
  if (action.type === 'caffeine_ok') return 'Enjoy your coffee';
  if (action.type === 'caffeine_cutoff') return 'No caffeine after this';
  if (action.type === 'melatonin') return '0.5mg before bed';
  if (action.rationale) return action.rationale;
  return null;
}

const VACCINATIONS = [
  { name: 'COVID-19', severity: 'Required', color: '#FF3B30' },
  { name: 'Hepatitis A', severity: 'Recommended', color: '#FF9F0A' },
  { name: 'Typhoid', severity: 'Recommended', color: '#FF9F0A' },
];

const MEDICATIONS = [
  { name: 'Antihistamines', note: 'Recommended for allergies' },
  { name: 'Antacids', note: 'Recommended for heartburn' },
  { name: 'First Aid', note: 'Recommended for minor cuts' },
  { name: 'ORS', note: 'Recommended for food poisoning' },
];

const TripDetailScreen: React.FC = () => {
  const route = useRoute<TripDetailRoute>();
  const navigation = useNavigation<TripDetailNav>();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const trip = deserializeTrip(route.params.trip);

  const sleepSchedule = settings?.lifestyle?.sleepSchedule ?? { bedTime: '22:00', wakeUpTime: '07:00' };
  const enhancedOutbound = buildEnhancedTrip(trip, 'outbound', sleepSchedule);
  const planDays: PlanDay[] = EnhancedJetLagService.generatePlan(enhancedOutbound);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [sectionTab, setSectionTab] = useState<'sleep' | 'health'>('sleep');
  const pagerRef = useRef<PagerView>(null);

  const switchSection = (tab: 'sleep' | 'health') => {
    setSectionTab(tab);
    pagerRef.current?.setPage(tab === 'sleep' ? 0 : 1);
  };
  const depCode = getCityCode(trip.departureLocation);
  const destCode = getCityCode(trip.destination);

  const originOffset = getCityUtcOffsetHours(trip.departureLocation) ?? 0;
  const destOffset = getCityUtcOffsetHours(trip.destination) ?? 0;
  const tzDiff = destOffset - originOffset;
  const tzLabel = `+${Math.abs(tzDiff)}h ${tzDiff >= 0 ? 'East' : 'West'}`;

  const selectedDay = planDays[selectedDayIdx] || planDays[0];


  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Fixed header */}
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={s.heroRoute}>
          <Text style={s.heroCode}>{depCode}</Text>
          <Text style={s.heroArrow}>→</Text>
          <Text style={s.heroCode}>{destCode}</Text>
        </View>
        <View style={s.headerSpacer} />
      </View>

      <View style={s.heroMeta}>
        <Text style={s.heroDates}>{formatDateRange(trip.departureDate, trip.returnDate)}</Text>
        <Text style={s.heroDir}>→ {tzLabel}</Text>
      </View>

      {/* Section tabs: Sleep Plan / Travel Health */}
      <View style={s.sectionTabsRow}>
        <TouchableOpacity
          style={[s.sectionTab, sectionTab === 'sleep' && s.sectionTabActive]}
          onPress={() => switchSection('sleep')}
        >
          <Text style={[s.sectionTabText, sectionTab === 'sleep' && s.sectionTabTextActive]}>
            Sleep Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.sectionTab, sectionTab === 'health' && s.sectionTabActive]}
          onPress={() => switchSection('health')}
        >
          <Text style={[s.sectionTabText, sectionTab === 'health' && s.sectionTabTextActive]}>
            Travel Health
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable pages */}
      <PagerView
        ref={pagerRef}
        style={s.pager}
        initialPage={0}
        onPageSelected={(e) => {
          setSectionTab(e.nativeEvent.position === 0 ? 'sleep' : 'health');
        }}
      >
        {/* Page 0: Sleep Plan */}
        <ScrollView
          key="sleep"
          contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.chipStrip}
            contentContainerStyle={s.chipStripContent}
          >
            {planDays.map((day, idx) => {
              const isActive = idx === selectedDayIdx;
              const chipLabel = day.location.segment === 'in_flight'
                ? '✈ Flight'
                : day.location.label;
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[s.chip, isActive && s.chipActive]}
                  onPress={() => setSelectedDayIdx(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.chipDay, isActive && s.chipDayActive]}>
                    {formatChipDay(day.date_local)}
                  </Text>
                  <Text style={[s.chipSub, isActive && s.chipSubActive]}>
                    {chipLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDay && (
            <View style={s.dayHeader}>
              <Text style={s.dayHeaderTitle}>{formatDayHeader(selectedDay.date_local)}</Text>
              <Text style={s.dayHeaderLoc}>{selectedDay.location.label}</Text>
            </View>
          )}

          {selectedDay && (
            <View style={s.blocks}>
              {selectedDay.actions.map((action, idx) => {
                const config = ACTION_CONFIG[action.type];
                if (!config) return null;
                const colors = blockColors[config.blockStyle];
                const subtitle = getActionSubtitle(action);
                const time = formatActionTime(action);
                return (
                  <View
                    key={`${action.type}-${idx}`}
                    style={[s.block, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}
                  >
                    <Text style={s.blockEmoji}>{config.emoji}</Text>
                    <View style={s.blockInfo}>
                      <Text style={s.blockTitle}>{config.title}</Text>
                      {subtitle ? <Text style={s.blockSub}>{subtitle}</Text> : null}
                    </View>
                    {time ? <Text style={s.blockTime}>{time}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Page 1: Travel Health */}
        <ScrollView
          key="health"
          contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.healthSectionTitle}>Vaccinations</Text>
          <View style={s.healthList}>
            {VACCINATIONS.map((vax) => (
              <View key={vax.name} style={s.healthRow}>
                <Text style={s.healthRowName}>{vax.name}</Text>
                <Text style={[s.healthRowBadge, { color: vax.color }]}>{vax.severity}</Text>
              </View>
            ))}
          </View>

          <Text style={s.healthSectionTitle}>Medications</Text>
          <View style={s.healthList}>
            {MEDICATIONS.map((med) => (
              <View key={med.name} style={s.healthRow}>
                <Text style={s.healthRowName}>{med.name}</Text>
                <Text style={s.healthRowNote}>{med.note}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </PagerView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { flex: 1 },
  pager: { flex: 1 },

  // Header row
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 2,
  },
  backBtn: { width: 36 },
  headerSpacer: { width: 36 },

  // Hero
  heroRoute: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  heroCode: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  heroArrow: { fontSize: 20, color: '#3A3A3C' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 2, marginBottom: 18 },
  heroDates: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  heroDir: { fontSize: 11, color: '#FF9500', fontWeight: '600' },

  // Section tabs
  sectionTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  sectionTabActive: { borderBottomColor: '#007AFF' },
  sectionTabText: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  sectionTabTextActive: { color: '#FFFFFF' },

  // Date chips
  chipStrip: { marginBottom: 20 },
  chipStripContent: { paddingHorizontal: 20, gap: 6 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: '#1C1C1E', alignItems: 'center', minWidth: 68,
  },
  chipActive: { backgroundColor: '#007AFF' },
  chipDay: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  chipDayActive: { color: '#FFFFFF' },
  chipSub: { fontSize: 10, color: '#8E8E93', marginTop: 2 },
  chipSubActive: { color: 'rgba(255,255,255,0.7)' },

  // Day header
  dayHeader: {
    paddingHorizontal: 20, marginBottom: 14,
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
  },
  dayHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  dayHeaderLoc: { fontSize: 13, color: '#8E8E93' },

  // Activity blocks
  blocks: { paddingHorizontal: 20 },
  block: {
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 3,
  },
  blockEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  blockInfo: { flex: 1 },
  blockTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  blockSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  blockTime: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },

  // Health sections
  healthSectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#FFFFFF',
    paddingHorizontal: 20, marginTop: 20, marginBottom: 12,
  },
  healthList: { paddingHorizontal: 20 },
  healthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#2C2C2E', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  healthRowName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  healthRowBadge: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  healthRowNote: { fontSize: 12, color: '#8E8E93' },
});

export default TripDetailScreen;
