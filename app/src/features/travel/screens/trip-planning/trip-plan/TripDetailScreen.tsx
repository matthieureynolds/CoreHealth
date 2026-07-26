import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../../../../shared/context/SettingsContext';
import { TravelStackParamList, SerializedTrip } from '../../../../../shared/types';
import { EnhancedJetLagService } from '../../../../../shared/services/jetlag-brain/enhancedJetLagService';
import { PlanDay, Action, Commitment } from '../../../../../shared/types';
import {
  buildEnhancedTrip,
  TripForPlan,
  getCityUtcOffsetHours,
} from '../../../../../shared/services/jetlag-brain/jetLagService';
import {
  estimateCircadianPhase,
  computeAdaptationFactor,
  updateDirectionalEfficiency,
  DEFAULT_EFFICIENCY,
  CircadianEstimate,
  DirectionalEfficiency,
} from '../../../../../shared/services/jetlag-brain/circadianModel';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRecentSleepWindow,
  getOvernightHrNadir,
  getOvernightGlucoseNadir,
} from '../../../../../shared/services/device/healthKitService';

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
    originTimezone: s.originTimezone,
    layovers: s.layovers,
    commitments: s.commitments,
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
  meal: { emoji: '🍽️', title: 'Meal Timing', blockStyle: 'meal' },
  commitment: { emoji: '📌', title: 'Commitment', blockStyle: 'commitment' },
};

const blockColors = {
  sleep: { bg: 'rgba(88,86,214,0.10)', border: '#5856D6' },
  light: { bg: 'rgba(255,214,10,0.07)', border: '#FFD60A' },
  lightAvoid: { bg: 'rgba(100,100,130,0.08)', border: '#636366' },
  caffeine: { bg: 'rgba(255,149,0,0.07)', border: '#FF9500' },
  caffeineCut: { bg: 'rgba(255,69,58,0.06)', border: '#FF453A' },
  melatonin: { bg: 'rgba(175,130,255,0.08)', border: '#AF82FF' },
  flight: { bg: 'rgba(0,122,255,0.07)', border: '#007AFF' },
  meal: { bg: 'rgba(48,209,88,0.07)', border: '#30D158' },
  commitment: { bg: 'rgba(255,55,95,0.08)', border: '#FF375F' },
};

// ── Timeshifter-style 24h day rail ─────────────────────────────────────────
const HOUR_H = 15;                       // px per hour
const RAIL_H = HOUR_H * 24;              // full midnight→midnight height
const SCREEN_W = Dimensions.get('window').width;
const CAP_W = 34;
const MARK = 30;                         // icon chip diameter
// Fixed category columns, left → right. Each action type lives in exactly one
// column; time positions it vertically. This keeps the rail organised instead
// of scattering icons across fuzzy lanes.
const RAIL_INSET = 34;                    // matches the vertical frame rails
const COL_KEYS = ['food', 'sleep', 'avoidLight', 'seekLight', 'coffee', 'commit', 'plane'] as const;
type ColKey = typeof COL_KEYS[number];
const COL_W = (SCREEN_W - RAIL_INSET * 2) / COL_KEYS.length;
const colCenterX = (col: number) => RAIL_INSET + (col + 0.5) * COL_W;
const colIndex = (k: ColKey) => COL_KEYS.indexOf(k);
const yForMin = (min: number) => (min / 60) * HOUR_H;
const parseMin = (t?: string | null): number | null => {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
};
function hourLabel(h: number): string {
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${h < 12 || h === 24 ? 'am' : 'pm'}`;
}
const CAP_STYLE: Record<string, { bg: string; border?: string }> = {
  sleep: { bg: 'rgba(59,59,102,0.72)' },
  flight: { bg: 'rgba(47,95,168,0.72)' },
  seek: { bg: 'rgba(183,148,32,0.72)' },
  avoid: { bg: 'rgba(85,85,95,0.72)' },
};
// Every capsule segment renders this icon in its rounded top as its head.
const CAP_HEAD: Record<string, keyof typeof Ionicons.glyphMap> = {
  sleep: 'bed',
  flight: 'airplane',
  seek: 'sunny',
  avoid: 'moon',
};
const MARK_TINT: Record<string, { bg: string; border: string; icon: string; glyph: keyof typeof Ionicons.glyphMap }> = {
  seek: { bg: 'rgba(183,148,32,0.72)', border: 'rgba(183,148,32,0.72)', icon: '#FFFFFF', glyph: 'sunny' },
  avoid: { bg: 'rgba(85,85,95,0.72)', border: 'rgba(85,85,95,0.72)', icon: '#FFFFFF', glyph: 'moon' },
  coffee: { bg: 'rgba(168,95,28,0.72)', border: 'rgba(168,95,28,0.72)', icon: '#FFFFFF', glyph: 'cafe' },
  cut: { bg: 'rgba(168,58,52,0.72)', border: 'rgba(168,58,52,0.72)', icon: '#FFFFFF', glyph: 'ban' },
  mela: { bg: 'rgba(110,82,168,0.72)', border: 'rgba(110,82,168,0.72)', icon: '#FFFFFF', glyph: 'medical' },
  meal: { bg: 'rgba(46,140,67,0.72)', border: 'rgba(46,140,67,0.72)', icon: '#FFFFFF', glyph: 'restaurant' },
  commit: { bg: 'rgba(168,58,84,0.72)', border: 'rgba(168,58,84,0.72)', icon: '#FFFFFF', glyph: 'calendar' },
  flight: { bg: 'rgba(47,95,168,0.72)', border: 'rgba(47,95,168,0.72)', icon: '#FFFFFF', glyph: 'airplane' },
  sleep: { bg: 'rgba(59,59,102,0.72)', border: 'rgba(59,59,102,0.72)', icon: '#FFFFFF', glyph: 'bed' },
};
type RailCap = { col: number; style: string; s: number; e: number };
type RailMark = { col: number; at: number; tint: keyof typeof MARK_TINT; label?: string };
function buildRail(actions: Action[]): { caps: RailCap[]; marks: RailMark[] } {
  const caps: RailCap[] = [];
  const marks: RailMark[] = [];
  const pushCap = (col: number, style: string, s: number | null, e: number | null) => {
    if (s == null || e == null) return;
    if (e <= s) { caps.push({ col, style, s, e: 1440 }); caps.push({ col, style, s: 0, e }); }
    else caps.push({ col, style, s, e });
  };
  const SLEEP = colIndex('sleep');
  const AVOID_LIGHT = colIndex('avoidLight');
  const SEEK_LIGHT = colIndex('seekLight');
  const COFFEE = colIndex('coffee');
  const FOOD = colIndex('food');
  const COMMIT = colIndex('commit');
  const PLANE = colIndex('plane');
  actions.forEach((a) => {
    const s = parseMin(a.start_local);
    const e = parseMin(a.end_local);
    const at = parseMin(a.at_local) ?? s;
    switch (a.type) {
      case 'sleep':
      case 'nap':
        pushCap(SLEEP, 'sleep', s, e);
        break;
      case 'in_flight':
        pushCap(PLANE, 'flight', s, e);
        break;
      case 'seek_light':
        pushCap(SEEK_LIGHT, 'seek', s, e);
        break;
      case 'avoid_light':
        pushCap(AVOID_LIGHT, 'avoid', s, e);
        break;
      case 'caffeine_ok':
        if (at != null) marks.push({ col: COFFEE, at, tint: 'coffee' });
        break;
      case 'caffeine_cutoff':
        if (at != null) marks.push({ col: COFFEE, at, tint: 'cut' });
        break;
      case 'melatonin':
        if (at != null) marks.push({ col: SLEEP, at, tint: 'mela' });
        break;
      case 'meal':
        if (at != null) marks.push({ col: FOOD, at, tint: 'meal' });
        break;
      case 'commitment':
        if (at != null) marks.push({ col: COMMIT, at, tint: 'commit', label: a.label });
        break;
    }
  });
  return { caps, marks };
}

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
  if (action.type === 'melatonin') return '0.5–3mg before bed';
  if (action.type === 'meal') return 'Eat on destination time';
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
  const { profile } = useHealthData();
  const trip = deserializeTrip(route.params.trip);

  const sleepSchedule = settings?.lifestyle?.sleepSchedule ?? { bedTime: '22:00', wakeUpTime: '07:00' };
  const jl = settings?.travel?.jetLag;
  const jetLagPrefs = jl ? {
    chronotype: jl.chronotype,
    planStyle: jl.defaultPlanStyle,
    caffeine: jl.guidanceOptions.caffeine,
    melatonin: jl.guidanceOptions.melatonin,
    naps: jl.guidanceOptions.naps,
  } : undefined;

  const settingsSleep = { start: sleepSchedule.bedTime, end: sleepSchedule.wakeUpTime };
  // Personalised body-clock estimate. Starts from settings, then upgrades to the
  // wearable-derived CBTmin once recent sleep + overnight HR are read (real device).
  const [circadian, setCircadian] = useState<CircadianEstimate>(() =>
    estimateCircadianPhase({ settingsSleep }),
  );
  const [adaptationFactor, setAdaptationFactor] = useState<number>(() =>
    computeAdaptationFactor({ age: profile?.age }),
  );
  useEffect(() => {
    let alive = true;
    (async () => {
      const [measuredSleep, hrNadirLocal, glucoseNadirLocal] = await Promise.all([
        getRecentSleepWindow(),
        getOvernightHrNadir(),
        getOvernightGlucoseNadir(),
      ]);
      if (!alive) return;
      setCircadian(estimateCircadianPhase({ settingsSleep, measuredSleep, hrNadirLocal, glucoseNadirLocal }));
      // Refine adaptation speed with measured sleep (chronic sleep debt).
      setAdaptationFactor(computeAdaptationFactor({ age: profile?.age, measuredSleep }));
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsSleep.start, settingsSleep.end, profile?.age]);

  // Commitments (meetings etc.) the plan should keep you alert for. Session-local
  // for now (seeded from any persisted on the trip); editable below.
  const [commitments, setCommitments] = useState<Commitment[]>(trip.commitments ?? []);
  const [returnFlight, setReturnFlight] = useState<{ departureTime: string; arrivalTime: string } | null>(null);
  const tripForPlan = { ...trip, commitments, returnFlight: returnFlight ?? undefined };

  // Persist commitments per-trip so they survive navigation and app restarts.
  const commitsLoaded = useRef(false);
  useEffect(() => {
    AsyncStorage.getItem(`trip_commitments_${trip.id}`)
      .then(raw => { if (raw) { try { setCommitments(JSON.parse(raw)); } catch { /* ignore */ } } })
      .finally(() => { commitsLoaded.current = true; });
  }, [trip.id]);
  useEffect(() => {
    if (!commitsLoaded.current) return;
    AsyncStorage.setItem(`trip_commitments_${trip.id}`, JSON.stringify(commitments)).catch(() => {});
  }, [commitments, trip.id]);

  // Persist the captured return flight times per-trip.
  const returnLoaded = useRef(false);
  useEffect(() => {
    AsyncStorage.getItem(`trip_returnflight_${trip.id}`)
      .then(raw => { if (raw) { try { setReturnFlight(JSON.parse(raw)); } catch { /* ignore */ } } })
      .finally(() => { returnLoaded.current = true; });
  }, [trip.id]);
  useEffect(() => {
    if (!returnLoaded.current) return;
    AsyncStorage.setItem(`trip_returnflight_${trip.id}`, JSON.stringify(returnFlight)).catch(() => {});
  }, [returnFlight, trip.id]);

  // Learned per-direction efficiency (persisted across trips).
  const [efficiency, setEfficiency] = useState<DirectionalEfficiency>(DEFAULT_EFFICIENCY);
  useEffect(() => {
    AsyncStorage.getItem('jetlag_efficiency')
      .then(raw => { if (raw) { try { setEfficiency(JSON.parse(raw)); } catch { /* ignore */ } } })
      .catch(() => {});
  }, []);

  // Closed-loop: how many days into the trip are we, and is a live wearable reading
  // available? If so, feed the body's MEASURED phase as `measuredNow` and keep the
  // engine's home baseline from settings (the wearable now reflects the shift, not home).
  const dayOffset = Math.floor(
    (new Date().setHours(0, 0, 0, 0) - new Date(trip.departureDate).setHours(0, 0, 0, 0)) / 86_400_000,
  );
  const settingsCbt = `${String((parseInt(settingsSleep.end.slice(0, 2)) + 22) % 24).padStart(2, '0')}:${settingsSleep.end.slice(3)}`; // wake − 2h
  const hasWearable = circadian.source !== 'settings';
  const tripOver = !!trip.returnDate && dayOffset > Math.ceil((new Date(trip.returnDate).getTime() - new Date(trip.departureDate).getTime()) / 86_400_000) + 1;
  const useMeasuredNow = dayOffset >= 0 && hasWearable && !tripOver;

  const homeSleep = useMeasuredNow ? settingsSleep : circadian.sleep;
  const homeCbt = useMeasuredNow ? settingsCbt : circadian.cbtMin;
  const planSleep = { bedTime: homeSleep.start, wakeUpTime: homeSleep.end };
  const extras = {
    advanceEfficiency: efficiency.advance,
    delayEfficiency: efficiency.delay,
    measuredNow: useMeasuredNow ? { day_offset: dayOffset, cbt_min_local: circadian.cbtMin } : undefined,
  };

  const enhancedOutbound = buildEnhancedTrip(tripForPlan, 'outbound', planSleep, jetLagPrefs, homeCbt, adaptationFactor, undefined, extras);
  const hasReturn = !!trip.returnDate;
  // The return leg only needs to undo however much the body actually adapted outbound.
  const outboundAdaptation = EnhancedJetLagService.getAchievedAdaptation(enhancedOutbound);
  const enhancedReturn = hasReturn
    ? buildEnhancedTrip(tripForPlan, 'return', planSleep, jetLagPrefs, homeCbt, adaptationFactor, outboundAdaptation, extras)
    : null;
  const outboundPlan: PlanDay[] = EnhancedJetLagService.generatePlan(enhancedOutbound);
  const returnPlan: PlanDay[] = enhancedReturn ? EnhancedJetLagService.generatePlan(enhancedReturn) : [];

  // Learn this user's directional efficiency from the live observation (once per reading).
  useEffect(() => {
    if (!useMeasuredNow) return;
    const rate = EnhancedJetLagService.getObservedShiftRate(enhancedOutbound);
    if (!rate) return;
    setEfficiency(prev => {
      const next = updateDirectionalEfficiency(prev, rate.direction, rate.observedPerDay, rate.expectedPerDay);
      AsyncStorage.setItem('jetlag_efficiency', JSON.stringify(next)).catch(() => {});
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMeasuredNow, circadian.cbtMin, dayOffset]);

  const [leg, setLeg] = useState<'outbound' | 'return'>('outbound');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [sectionTab, setSectionTab] = useState<'sleep' | 'health'>('sleep');
  const pagerRef = useRef<PagerView>(null);

  const planDays = leg === 'return' ? returnPlan : outboundPlan;
  const activeEnhanced = leg === 'return' && enhancedReturn ? enhancedReturn : enhancedOutbound;
  const nowCard = EnhancedJetLagService.generateNowCard(activeEnhanced, planDays);
  const switchLeg = (next: 'outbound' | 'return') => {
    setLeg(next);
    setSelectedDayIdx(0);
  };

  // Add-commitment form state.
  const [showCommitForm, setShowCommitForm] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDayIdx, setDraftDayIdx] = useState(0);
  const [draftStart, setDraftStart] = useState('09:00');
  const [draftEnd, setDraftEnd] = useState('10:00');
  const [openPicker, setOpenPicker] = useState<null | 'start' | 'end'>(null);
  const [editingCommit, setEditingCommit] = useState<Commitment | null>(null);
  const isHHMM = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  const hhmmToDate = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };
  const dateToHHMM = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const canSaveCommit = draftTitle.trim().length > 0 && isHHMM(draftStart) && isHHMM(draftEnd);
  const openAddCommit = () => {
    setEditingCommit(null);
    setDraftTitle(''); setDraftStart('09:00'); setDraftEnd('10:00'); setDraftDayIdx(0);
    setOpenPicker(null);
    setShowCommitForm(true);
  };
  const openEditCommit = (c: Commitment) => {
    const idx = planDays.findIndex(d => d.date_local === c.date_local);
    setEditingCommit(c);
    setDraftTitle(c.title);
    setDraftStart(c.start_local);
    setDraftEnd(c.end_local);
    setDraftDayIdx(idx >= 0 ? idx : 0);
    setOpenPicker(null);
    setShowCommitForm(true);
  };
  const saveCommitment = () => {
    const day = planDays[draftDayIdx];
    if (!canSaveCommit || !day) return;
    const next: Commitment = { title: draftTitle.trim(), date_local: day.date_local, start_local: draftStart, end_local: draftEnd };
    setCommitments(prev => editingCommit ? prev.map(x => (x === editingCommit ? next : x)) : [...prev, next]);
    setDraftTitle(''); setDraftStart('09:00'); setDraftEnd('10:00'); setDraftDayIdx(0);
    setEditingCommit(null);
    setOpenPicker(null);
    setShowCommitForm(false);
  };
  const closeCommitForm = () => { setOpenPicker(null); setEditingCommit(null); setShowCommitForm(false); };

  // Return-flight capture form.
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [draftRetDep, setDraftRetDep] = useState(returnFlight?.departureTime ?? '12:00');
  const [draftRetArr, setDraftRetArr] = useState(returnFlight?.arrivalTime ?? '16:00');
  const saveReturnFlight = () => {
    if (!isHHMM(draftRetDep) || !isHHMM(draftRetArr)) return;
    setReturnFlight({ departureTime: draftRetDep, arrivalTime: draftRetArr });
    setShowReturnForm(false);
  };

  const switchSection = (tab: 'sleep' | 'health') => {
    setSectionTab(tab);
    pagerRef.current?.setPage(tab === 'sleep' ? 0 : 1);
  };
  const depCode = getCityCode(trip.departureLocation);
  const destCode = getCityCode(trip.destination);
  const fromCode = leg === 'return' ? destCode : depCode;
  const toCode = leg === 'return' ? depCode : destCode;

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
          <Text style={s.heroCode}>{fromCode}</Text>
          <Text style={s.heroArrow}>→</Text>
          <Text style={s.heroCode}>{toCode}</Text>
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
        scrollEnabled={false}
        onPageSelected={(e) => {
          setSectionTab(e.nativeEvent.position === 0 ? 'sleep' : 'health');
        }}
      >
        {/* Page 0: Sleep Plan */}
        <ScrollView
          key="sleep"
          contentContainerStyle={{ paddingBottom: 90 + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {hasReturn && (
            <View style={s.legToggleRow}>
              <TouchableOpacity
                style={[s.legToggle, leg === 'outbound' && s.legToggleActive]}
                onPress={() => switchLeg('outbound')}
                activeOpacity={0.8}
              >
                <Text style={[s.legToggleText, leg === 'outbound' && s.legToggleTextActive]}>
                  Outbound {depCode}→{destCode}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.legToggle, leg === 'return' && s.legToggleActive]}
                onPress={() => switchLeg('return')}
                activeOpacity={0.8}
              >
                <Text style={[s.legToggleText, leg === 'return' && s.legToggleTextActive]}>
                  Return {destCode}→{depCode}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {hasReturn && leg === 'return' && (
            <TouchableOpacity
              style={s.returnFlightRow}
              onPress={() => {
                setDraftRetDep(returnFlight?.departureTime ?? '12:00');
                setDraftRetArr(returnFlight?.arrivalTime ?? '16:00');
                setShowReturnForm(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="airplane" size={16} color="#3AABF0" style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={s.returnFlightText}>
                {returnFlight
                  ? `Return flight ${returnFlight.departureTime}→${returnFlight.arrivalTime}`
                  : 'Set your return flight time for an accurate plan'}
              </Text>
              <Text style={s.returnFlightEdit}>{returnFlight ? 'Edit' : 'Add'}</Text>
            </TouchableOpacity>
          )}

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

          {selectedDay && (() => {
            const { caps, marks } = buildRail(selectedDay.actions);
            return (
              <View style={s.rail}>
                {/* vertical frame rails at the plot edges */}
                <View style={[s.railVLine, { left: 34 }]} />
                <View style={[s.railVLine, { right: 34 }]} />
                {/* hour gridlines + labels both sides */}
                {Array.from({ length: 25 }).map((_, h) => (
                  h % 2 === 0 ? (
                    <View key={`hl-${h}`} style={[s.railHourLine, { top: h * HOUR_H }]}>
                      <Text style={s.railHourL}>{hourLabel(h)}</Text>
                      <Text style={s.railHourR}>{hourLabel(h)}</Text>
                    </View>
                  ) : null
                ))}
                {/* duration capsules */}
                {caps.map((c, i) => {
                  const cs = CAP_STYLE[c.style];
                  const top = Math.max(yForMin(c.s), 0);
                  const bottom = Math.min(Math.max(yForMin(c.e), yForMin(c.s) + CAP_W), RAIL_H);
                  const headGlyph = CAP_HEAD[c.style];
                  return (
                    <View
                      key={`cap-${i}`}
                      style={[
                        s.railCap,
                        {
                          top,
                          height: bottom - top,
                          left: colCenterX(c.col) - CAP_W / 2,
                          backgroundColor: cs.bg,
                          borderWidth: cs.border ? 1.5 : 0,
                          borderColor: cs.border ?? 'transparent',
                        },
                      ]}
                    >
                      {headGlyph && (
                        <Ionicons
                          name={headGlyph}
                          size={15}
                          color="#FFFFFF"
                          style={{ position: 'absolute', top: (CAP_W - 15) / 2, left: (CAP_W - 15) / 2 }}
                        />
                      )}
                    </View>
                  );
                })}
                {/* point-in-time icon chips (events with no duration capsule) */}
                {marks.map((m, i) => {
                  const tint = MARK_TINT[m.tint];
                  const top = Math.min(Math.max(yForMin(m.at) - MARK / 2, 0), RAIL_H - MARK);
                  const left = colCenterX(m.col) - MARK / 2;
                  return (
                    <View key={`mk-${i}`} style={[s.railMarkRow, { top, left }]}>
                      <View style={[s.railMark, { backgroundColor: tint.bg, borderColor: tint.bg }]}>
                        <Ionicons name={tint.glyph} size={15} color={tint.icon} />
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })()}

          {/* Commitments — meetings/events the plan keeps you alert for */}
          <View style={s.commitSection}>
            <View style={s.commitHeaderRow}>
              <Text style={s.commitHeader}>Commitments</Text>
              <TouchableOpacity onPress={openAddCommit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={s.commitAdd}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {commitments.length === 0 ? (
              <Text style={s.commitEmpty}>
                Add a meeting or event and the plan will keep you sharp for it.
              </Text>
            ) : (
              commitments
                .slice()
                .sort((a, b) => (a.date_local + a.start_local).localeCompare(b.date_local + b.start_local))
                .map((c, i) => (
                  <Swipeable
                    key={`${c.date_local}-${c.start_local}-${i}`}
                    friction={2}
                    rightThreshold={80}
                    dragOffsetFromRightEdge={30}
                    containerStyle={s.commitSwipeContainer}
                    renderRightActions={() => (
                      <View style={s.commitActions}>
                        <RectButton style={[s.commitAction, s.commitActionEdit]} onPress={() => openEditCommit(c)}>
                          <Ionicons name="pencil" size={20} color="#fff" />
                          <Text style={s.commitActionText}>Edit</Text>
                        </RectButton>
                        <RectButton
                          style={[s.commitAction, s.commitActionDelete]}
                          onPress={() => setCommitments(prev => prev.filter(x => x !== c))}
                        >
                          <Ionicons name="trash-outline" size={20} color="#fff" />
                          <Text style={s.commitActionText}>Remove</Text>
                        </RectButton>
                      </View>
                    )}
                  >
                    <View style={s.commitCard}>
                      <View style={s.commitIcon}>
                        <Ionicons name="calendar" size={16} color="#FF375F" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.commitTitle}>{c.title}</Text>
                        <Text style={s.commitMeta}>
                          {formatChipDay(c.date_local)} · {c.start_local}–{c.end_local}
                        </Text>
                      </View>
                    </View>
                  </Swipeable>
                ))
            )}
          </View>
        </ScrollView>

        {/* Page 1: Travel Health */}
        <ScrollView
          key="health"
          contentContainerStyle={{ paddingBottom: 90 + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.healthSectionTitle}>Vaccinations</Text>
          <View style={s.healthList}>
            {VACCINATIONS.map((vax) => (
              <View key={vax.name} style={s.healthRow}>
                <View style={s.healthRowLeft}>
                  <Text style={s.healthRowName}>{vax.name}</Text>
                </View>
                <View style={s.healthRowRight}>
                  <Text style={[s.healthRowBadge, { color: vax.color }]}>{vax.severity}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={s.healthSectionTitle}>Medications</Text>
          <View style={s.healthList}>
            {MEDICATIONS.map((med) => (
              <View key={med.name} style={s.healthRow}>
                <View style={s.healthRowLeft}>
                  <Text style={s.healthRowName}>{med.name}</Text>
                </View>
                <View style={s.healthRowRight}>
                  <Text style={s.healthRowNote}>{med.note}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </PagerView>

      {/* Add-commitment sheet */}
      <Modal visible={showCommitForm} transparent animationType="slide" onRequestClose={closeCommitForm}>
        <View style={s.sheetRoot}>
          <TouchableOpacity style={s.sheetBackdrop} activeOpacity={1} onPress={closeCommitForm} />
          <View style={[s.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={s.grabber} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{editingCommit ? 'Edit commitment' : 'Add commitment'}</Text>
              <TouchableOpacity
                style={[s.tickBtn, !canSaveCommit && s.tickBtnDisabled]}
                onPress={saveCommitment}
                disabled={!canSaveCommit}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={s.sheetInput}
              placeholder="e.g. Board meeting"
              placeholderTextColor="#8E8E93"
              value={draftTitle}
              onChangeText={setDraftTitle}
            />

            <Text style={s.sheetLabel}>DAY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {planDays.map((day, idx) => {
                const active = idx === draftDayIdx;
                return (
                  <TouchableOpacity
                    key={day.id}
                    style={[s.dayChip, active ? s.dayChipActive : s.dayChipIdle]}
                    onPress={() => setDraftDayIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.dayChipText}>{formatChipDay(day.date_local)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={s.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetLabel}>START</Text>
                <TouchableOpacity
                  style={[s.timeCard, openPicker === 'start' && s.timeCardOpen]}
                  onPress={() => setOpenPicker(openPicker === 'start' ? null : 'start')}
                  activeOpacity={0.7}
                >
                  <Text style={[s.timeCardValue, openPicker === 'start' && s.timeCardValueOpen]}>{draftStart}</Text>
                  <Text style={s.timeCardHint}>{openPicker === 'start' ? 'Roll to adjust' : 'Tap to set'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetLabel}>END</Text>
                <TouchableOpacity
                  style={[s.timeCard, openPicker === 'end' && s.timeCardOpen]}
                  onPress={() => setOpenPicker(openPicker === 'end' ? null : 'end')}
                  activeOpacity={0.7}
                >
                  <Text style={[s.timeCardValue, openPicker === 'end' && s.timeCardValueOpen]}>{draftEnd}</Text>
                  <Text style={s.timeCardHint}>{openPicker === 'end' ? 'Roll to adjust' : 'Tap to set'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {openPicker && (
              <View style={s.wheelWrap}>
                <DateTimePicker
                  mode="time"
                  display="spinner"
                  value={hhmmToDate(openPicker === 'start' ? draftStart : draftEnd)}
                  themeVariant="dark"
                  textColor="#FFFFFF"
                  minuteInterval={5}
                  style={s.wheel}
                  onChange={(_, date) => {
                    if (!date) return;
                    if (openPicker === 'start') setDraftStart(dateToHHMM(date));
                    else setDraftEnd(dateToHHMM(date));
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Return-flight time modal */}
      <Modal visible={showReturnForm} transparent animationType="fade" onRequestClose={() => setShowReturnForm(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Return flight ({destCode}→{depCode})</Text>
            <View style={s.modalTimeRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.modalLabel}>Departs (local)</Text>
                <TextInput style={s.modalInput} placeholder="12:00" placeholderTextColor="#8E8E93" value={draftRetDep} onChangeText={setDraftRetDep} keyboardType="numbers-and-punctuation" maxLength={5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.modalLabel}>Arrives (local)</Text>
                <TextInput style={s.modalInput} placeholder="16:00" placeholderTextColor="#8E8E93" value={draftRetArr} onChangeText={setDraftRetArr} keyboardType="numbers-and-punctuation" maxLength={5} />
              </View>
            </View>
            <View style={s.modalBtnRow}>
              {returnFlight ? (
                <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => { setReturnFlight(null); setShowReturnForm(false); }}>
                  <Text style={s.modalBtnCancelText}>Clear</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setShowReturnForm(false)}>
                  <Text style={s.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.modalBtn, s.modalBtnSave]} onPress={saveReturnFlight}>
                <Text style={s.modalBtnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // "Right now" card
  nowCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0A2540',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  nowCardKicker: { fontSize: 11, fontWeight: '700', color: '#3AABF0', letterSpacing: 1, marginBottom: 6 },
  nowCardTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  nowCardWindow: { fontSize: 14, fontWeight: '600', color: '#3AABF0', marginBottom: 8 },
  nowCardExplain: { fontSize: 13, color: '#C7C7CC', lineHeight: 18 },
  nowCardNext: { fontSize: 12, color: '#8E8E93', marginTop: 8 },

  // Outbound / Return leg toggle
  legToggleRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  legToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  legToggleActive: { backgroundColor: '#0A2540', borderColor: '#007AFF' },
  legToggleText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  legToggleTextActive: { color: '#FFFFFF' },

  // Strategy summary banner
  planBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD60A',
  },
  planBannerLabel: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  planBannerDetail: { fontSize: 13, color: '#8E8E93', lineHeight: 18 },
  planBannerSourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sourceDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 7 },
  planBannerSource: { flex: 1, fontSize: 12, color: '#8E8E93', lineHeight: 16 },

  // Commitments
  commitSection: { marginTop: 8, marginHorizontal: 20, paddingTop: 16 },
  commitHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  commitHeader: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  commitAdd: { fontSize: 15, fontWeight: '600', color: '#3AABF0' },
  commitEmpty: { fontSize: 13, color: '#8E8E93', lineHeight: 18 },
  commitSwipeContainer: { marginBottom: 10, borderRadius: 14 },
  commitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,55,95,0.08)', borderLeftWidth: 3, borderLeftColor: '#FF375F',
    borderRadius: 14, overflow: 'hidden', paddingVertical: 14, paddingHorizontal: 14,
  },
  commitIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,55,95,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  commitActions: { flexDirection: 'row', alignItems: 'stretch', gap: 8, paddingLeft: 8 },
  commitAction: { width: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  commitActionEdit: { backgroundColor: '#FF9500' },
  commitActionDelete: { backgroundColor: '#FF3B30' },
  commitActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 2 },
  commitTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  commitMeta: { fontSize: 12, color: '#8E8E93', marginTop: 2 },

  // Return-flight capture row
  returnFlightRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 16, padding: 12,
    borderRadius: 10, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E',
  },
  returnFlightText: { flex: 1, fontSize: 13, color: '#C7C7CC' },
  returnFlightEdit: { fontSize: 14, fontWeight: '600', color: '#3AABF0' },

  // Add-commitment modal
  // Add-commitment bottom sheet
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.78)' },
  sheet: {
    backgroundColor: '#1C1C1E', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 8,
    borderTopWidth: 1, borderColor: '#2C2C2E',
  },
  grabber: { width: 36, height: 5, borderRadius: 3, backgroundColor: '#48484A', alignSelf: 'center', marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  tickBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#30D158', alignItems: 'center', justifyContent: 'center' },
  tickBtnDisabled: { backgroundColor: '#2C2C2E' },
  sheetLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.2, marginTop: 18, marginBottom: 8 },
  sheetInput: {
    backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: '#FFFFFF', fontSize: 15, marginTop: 6, borderWidth: 1, borderColor: 'transparent',
  },
  dayChip: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', minWidth: 64 },
  dayChipIdle: { backgroundColor: '#2C2C2E' },
  dayChipActive: { backgroundColor: '#007AFF' },
  dayChipText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeCard: { backgroundColor: '#2C2C2E', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'transparent' },
  timeCardOpen: { backgroundColor: '#1F1F22', borderColor: '#007AFF' },
  timeCardValue: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  timeCardValueOpen: { color: '#007AFF' },
  timeCardHint: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  wheelWrap: { marginTop: 12, backgroundColor: '#2C2C2E', borderRadius: 14, overflow: 'hidden', alignItems: 'center' },
  wheel: { width: 220, alignSelf: 'center' },

  // Return-flight modal (legacy centered card)
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginTop: 12, marginBottom: 6 },
  modalInput: {
    backgroundColor: '#2C2C2E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#FFFFFF', fontSize: 15,
  },
  modalTimeRow: { flexDirection: 'row', gap: 12 },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#2C2C2E' },
  modalBtnCancelText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  modalBtnSave: { backgroundColor: '#007AFF' },
  modalBtnSaveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

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

  // Timeshifter-style day rail
  rail: { height: RAIL_H, marginTop: 8, marginBottom: 30, position: 'relative' },
  railHourLine: { position: 'absolute', left: 34, right: 34, height: 0, borderTopWidth: 1, borderTopColor: '#1C1C1E' },
  railVLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#1C1C1E' },
  railHourL: { position: 'absolute', left: -75, top: -8, width: 72, textAlign: 'right', fontSize: 12, color: '#636366' },
  railHourR: { position: 'absolute', right: -75, top: -8, width: 72, textAlign: 'left', fontSize: 12, color: '#636366' },
  railCap: { position: 'absolute', width: CAP_W, borderRadius: CAP_W / 2 },
  railMarkRow: { position: 'absolute', height: MARK, flexDirection: 'row', alignItems: 'center' },
  railMark: { width: MARK, height: MARK, borderRadius: MARK / 2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  railMarkIcon: { fontSize: 15 },
  railMarkLabel: { marginLeft: 8, fontSize: 12, fontWeight: '600', color: '#FFFFFF', maxWidth: 120 },

  // Health sections
  healthSectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#FFFFFF',
    paddingHorizontal: 20, marginTop: 20, marginBottom: 12,
  },
  healthList: { paddingHorizontal: 20 },
  healthRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    backgroundColor: '#2C2C2E', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  healthRowLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 8, width: '50%',
  },
  healthRowRight: {
    width: '50%', alignItems: 'flex-start',
  },
  healthRowName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  healthRowBadge: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  healthRowNote: { fontSize: 12, color: '#8E8E93' },
});

export default TripDetailScreen;
