import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../shared/types';

type Nav = StackNavigationProp<ProfileTabParamList, 'CommunityLeaderboard'>;

// ─── Private Circles data ───────────────────────────────────────────────────
type Circle = { id: string; name: string; members: number; icon: string; color: string };
const ALL_CIRCLES: Circle[] = [
  { id: 'c1', name: 'Family',           members: 5,  icon: 'home',       color: '#5856D6' },
  { id: 'c2', name: 'Friends',          members: 8,  icon: 'people',     color: '#5856D6' },
  { id: 'c3', name: 'Hikes and Parties',members: 42, icon: 'trail-sign', color: '#5856D6' },
  { id: 'c4', name: 'Football Paris',   members: 18, icon: 'football',   color: '#5856D6' },
  { id: 'c5', name: 'Wellness Warriors',members: 12, icon: 'fitness',    color: '#5856D6' },
  { id: 'c6', name: 'Weekend Runners',  members: 9,  icon: 'walk',       color: '#5856D6' },
];

// ─── Public Leagues data ─────────────────────────────────────────────────────
type League = { id: string; name: string; members: number; category: string };
const ALL_LEAGUES: League[] = [
  { id: 'rl1',  name: 'UK · Men 20–30',            members: 128, category: 'Regional' },
  { id: 'rl3',  name: 'Football · Recovery Circle', members: 96,  category: 'Sport'    },
  { id: 'rl4',  name: 'Entrepreneurs Anti‑Stress',  members: 173, category: 'Lifestyle' },
  { id: 'rl5',  name: 'Paris · Women 30–40',        members: 88,  category: 'Regional' },
  { id: 'rl6',  name: 'NYC · High Performers',      members: 142, category: 'Regional' },
  { id: 'rl7',  name: 'Mindful Mornings',           members: 121, category: 'Lifestyle' },
  { id: 'rl8',  name: 'Longevity Pros',             members: 110, category: 'Health'   },
  { id: 'rl9',  name: 'Sleep Optimizers',           members: 97,  category: 'Health'   },
  { id: 'rl10', name: 'Mediterranean Health',       members: 104, category: 'Regional' },
];

// ─── Country data ─────────────────────────────────────────────────────────────
const flagFromCode = (code: string) => {
  const u = code.toUpperCase();
  const b = 0x1f1e6;
  return String.fromCodePoint(u.charCodeAt(0) - 65 + b, u.charCodeAt(1) - 65 + b);
};
const COUNTRIES = [
  { name: 'Japan',              code: 'JP', score: 84.4, delta:  1 },
  { name: 'Switzerland',        code: 'CH', score: 83.7, delta:  0 },
  { name: 'Singapore',          code: 'SG', score: 83.5, delta: -1 },
  { name: 'Spain',              code: 'ES', score: 83.5, delta:  1 },
  { name: 'South Korea',        code: 'KR', score: 83.2, delta:  0 },
  { name: 'Italy',              code: 'IT', score: 83.2, delta: -1 },
  { name: 'Sweden',             code: 'SE', score: 83.0, delta:  1 },
  { name: 'Norway',             code: 'NO', score: 82.9, delta:  0 },
  { name: 'Australia',          code: 'AU', score: 82.9, delta: -1 },
  { name: 'Israel',             code: 'IL', score: 82.8, delta:  1 },
  { name: 'France',             code: 'FR', score: 82.6, delta:  0 },
  { name: 'Iceland',            code: 'IS', score: 82.6, delta: -1 },
  { name: 'Canada',             code: 'CA', score: 82.0, delta:  1 },
  { name: 'Netherlands',        code: 'NL', score: 82.0, delta:  0 },
  { name: 'Greece',             code: 'GR', score: 81.9, delta: -1 },
  { name: 'Austria',            code: 'AT', score: 81.8, delta:  1 },
  { name: 'Finland',            code: 'FI', score: 81.8, delta:  0 },
  { name: 'Belgium',            code: 'BE', score: 81.7, delta: -1 },
  { name: 'New Zealand',        code: 'NZ', score: 81.7, delta:  1 },
  { name: 'United Kingdom',     code: 'GB', score: 81.2, delta:  0 },
  { name: 'Denmark',            code: 'DK', score: 81.2, delta: -1 },
  { name: 'Germany',            code: 'DE', score: 81.0, delta:  1 },
  { name: 'Portugal',           code: 'PT', score: 80.9, delta:  0 },
  { name: 'Luxembourg',         code: 'LU', score: 80.7, delta: -1 },
  { name: 'Ireland',            code: 'IE', score: 80.6, delta:  1 },
  { name: 'Malta',              code: 'MT', score: 80.5, delta:  0 },
  { name: 'Slovenia',           code: 'SI', score: 80.2, delta: -1 },
  { name: 'Cyprus',             code: 'CY', score: 80.1, delta:  1 },
  { name: 'United States',      code: 'US', score: 78.5, delta: -1 },
  { name: 'Czech Republic',     code: 'CZ', score: 78.3, delta:  0 },
  { name: 'Poland',             code: 'PL', score: 77.8, delta:  1 },
  { name: 'Chile',              code: 'CL', score: 77.6, delta:  0 },
  { name: 'Costa Rica',         code: 'CR', score: 77.5, delta: -1 },
  { name: 'Cuba',               code: 'CU', score: 77.4, delta:  1 },
  { name: 'Croatia',            code: 'HR', score: 77.2, delta:  0 },
  { name: 'China',              code: 'CN', score: 77.1, delta: -1 },
  { name: 'Slovakia',           code: 'SK', score: 76.9, delta:  1 },
  { name: 'Estonia',            code: 'EE', score: 76.8, delta:  0 },
  { name: 'Lithuania',          code: 'LT', score: 76.4, delta: -1 },
  { name: 'Argentina',          code: 'AR', score: 76.3, delta:  1 },
  { name: 'Panama',             code: 'PA', score: 76.2, delta:  0 },
  { name: 'Uruguay',            code: 'UY', score: 76.1, delta: -1 },
  { name: 'Latvia',             code: 'LV', score: 75.5, delta:  1 },
  { name: 'Brazil',             code: 'BR', score: 75.9, delta:  0 },
  { name: 'Hungary',            code: 'HU', score: 75.4, delta: -1 },
  { name: 'Serbia',             code: 'RS', score: 75.2, delta:  1 },
  { name: 'Thailand',           code: 'TH', score: 75.0, delta:  0 },
  { name: 'Mexico',             code: 'MX', score: 74.8, delta: -1 },
  { name: 'Malaysia',           code: 'MY', score: 74.7, delta:  1 },
  { name: 'Colombia',           code: 'CO', score: 74.5, delta:  0 },
  { name: 'Vietnam',            code: 'VN', score: 74.3, delta: -1 },
  { name: 'Albania',            code: 'AL', score: 74.1, delta:  1 },
  { name: 'Ecuador',            code: 'EC', score: 73.8, delta:  0 },
  { name: 'Sri Lanka',          code: 'LK', score: 73.6, delta: -1 },
  { name: 'Turkey',             code: 'TR', score: 73.0, delta:  1 },
  { name: 'Peru',               code: 'PE', score: 72.8, delta:  0 },
  { name: 'Jamaica',            code: 'JM', score: 72.6, delta: -1 },
  { name: 'Dominican Rep.',     code: 'DO', score: 72.4, delta:  1 },
  { name: 'Iran',               code: 'IR', score: 72.2, delta:  0 },
  { name: 'UAE',                code: 'AE', score: 72.0, delta: -1 },
  { name: 'Jordan',             code: 'JO', score: 71.8, delta:  1 },
  { name: 'Paraguay',           code: 'PY', score: 71.5, delta:  0 },
  { name: 'Tunisia',            code: 'TN', score: 71.3, delta: -1 },
  { name: 'Morocco',            code: 'MA', score: 71.1, delta:  1 },
  { name: 'Bolivia',            code: 'BO', score: 70.9, delta:  0 },
  { name: 'India',              code: 'IN', score: 70.4, delta: -1 },
  { name: 'Egypt',              code: 'EG', score: 70.2, delta:  1 },
  { name: 'Philippines',        code: 'PH', score: 70.1, delta:  0 },
  { name: 'Indonesia',          code: 'ID', score: 69.8, delta: -1 },
  { name: 'Mongolia',           code: 'MN', score: 69.5, delta:  1 },
  { name: 'Ukraine',            code: 'UA', score: 69.2, delta:  0 },
  { name: 'Russia',             code: 'RU', score: 68.9, delta: -1 },
  { name: 'Kazakhstan',         code: 'KZ', score: 68.7, delta:  1 },
  { name: 'Algeria',            code: 'DZ', score: 68.5, delta:  0 },
  { name: 'Bangladesh',         code: 'BD', score: 67.9, delta: -1 },
  { name: 'Ghana',              code: 'GH', score: 67.6, delta:  1 },
  { name: 'Kenya',              code: 'KE', score: 67.2, delta:  0 },
  { name: 'Myanmar',            code: 'MM', score: 66.8, delta: -1 },
  { name: 'Cambodia',           code: 'KH', score: 66.5, delta:  1 },
  { name: 'Nepal',              code: 'NP', score: 66.2, delta:  0 },
  { name: 'Pakistan',           code: 'PK', score: 65.8, delta: -1 },
  { name: 'Senegal',            code: 'SN', score: 65.4, delta:  1 },
  { name: 'Rwanda',             code: 'RW', score: 65.0, delta:  0 },
  { name: 'Tanzania',           code: 'TZ', score: 64.6, delta: -1 },
  { name: 'Ethiopia',           code: 'ET', score: 64.2, delta:  1 },
  { name: 'Uganda',             code: 'UG', score: 63.7, delta:  0 },
  { name: 'Nigeria',            code: 'NG', score: 63.1, delta: -1 },
  { name: 'Haiti',              code: 'HT', score: 62.5, delta:  1 },
  { name: 'Mozambique',         code: 'MZ', score: 61.8, delta:  0 },
  { name: 'Afghanistan',        code: 'AF', score: 61.2, delta: -1 },
  { name: 'South Africa',       code: 'ZA', score: 60.7, delta:  1 },
  { name: 'Chad',               code: 'TD', score: 58.9, delta:  0 },
  { name: 'Niger',              code: 'NE', score: 57.3, delta: -1 },
  { name: 'Mali',               code: 'ML', score: 56.8, delta:  0 },
];

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'circles',   icon: 'people',  color: '#5856D6', label: 'Circles' },
  { key: 'leagues',   icon: 'trophy',  color: '#FF9F0A', label: 'Leagues' },
  { key: 'countries', icon: 'globe',   color: '#30D158', label: 'World' },
] as const;
type TabKey = typeof TABS[number]['key'];

// ─── Delta chip ───────────────────────────────────────────────────────────────
const DeltaChip = ({ delta }: { delta: number }) => {
  if (delta === 0) return <View style={{ width: 18 }} />;
  return (
    <View style={[styles.deltaChip, delta > 0 ? styles.deltaUp : styles.deltaDown]}>
      <Ionicons name={delta > 0 ? 'arrow-up' : 'arrow-down'} size={9} color={delta > 0 ? '#34C759' : '#FF453A'} />
    </View>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
const CommunityLeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<TabKey>('circles');
  const [joinedCircles, setJoinedCircles] = useState<Record<string, boolean>>({ c1: true, c2: true });
  const [joinedLeagues, setJoinedLeagues] = useState<Record<string, boolean>>({});
  const [leagueCategory, setLeagueCategory] = useState('All');

  const [circles, setCircles] = useState<Circle[]>(ALL_CIRCLES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const myCircles = circles.filter((c) => joinedCircles[c.id]);
  const categories = ['All', 'Regional', 'Sport', 'Health', 'Lifestyle'];
  const filteredLeagues = leagueCategory === 'All' ? ALL_LEAGUES : ALL_LEAGUES.filter((l) => l.category === leagueCategory);

  const handleCreateCircle = () => {
    if (!newCircleName.trim()) {
      Alert.alert('Name required', 'Please enter a name for your circle.');
      return;
    }
    const newId = `c${Date.now()}`;
    const newCircle: Circle = {
      id: newId,
      name: newCircleName.trim(),
      members: 1,
      icon: 'people',
      color: '#5856D6',
    };
    setCircles((prev) => [...prev, newCircle]);
    setJoinedCircles((prev) => ({ ...prev, [newId]: true }));
    setNewCircleName('');
    setShowCreateModal(false);
  };

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) {
      Alert.alert('Code required', 'Please enter an invite code.');
      return;
    }
    // Find matching circle by code pattern (CIRCLENAME-JOIN)
    const matched = circles.find(
      (c) => `${c.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-JOIN` === joinCode.trim().toUpperCase()
    );
    if (matched) {
      setJoinedCircles((prev) => ({ ...prev, [matched.id]: true }));
      setJoinCode('');
      setShowJoinModal(false);
      Alert.alert('Joined!', `You joined "${matched.name}".`);
    } else {
      Alert.alert('Invalid code', 'No circle found with that invite code. Ask your friend to share theirs from the Circle Detail screen.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tab pill */}
      <View style={styles.tabPill}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.tabCircle,
                { backgroundColor: active ? tab.color + '55' : tab.color + '22' },
                active && { borderColor: tab.color + '99', borderWidth: 1.5 },
              ]}>
                <Ionicons name={tab.icon as any} size={36} color={tab.color} />
              </View>
              <Text style={[styles.tabLabel, { color: active ? tab.color : '#8E8E93' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* ── CIRCLES TAB ── */}
        {activeTab === 'circles' && (
          <>
            {/* My Circles */}
            <Text style={styles.sectionLabel}>MY CIRCLES</Text>
            <View style={styles.card}>
              {myCircles.length === 0 ? (
                <View style={styles.emptyRow}><Text style={styles.emptyText}>No circles yet — create or join one below</Text></View>
              ) : myCircles.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.row, i === myCircles.length - 1 && styles.lastRow]}
                  onPress={() => navigation.navigate('CircleDetail', { name: c.name, members: c.members })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#5856D620' }]}>
                    <Ionicons name={c.icon as any} size={20} color="#5856D6" />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{c.name}</Text>
                    <Text style={styles.rowSubtitle}>{c.members} members</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#3A3A3C" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Create / Join buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPurple]} activeOpacity={0.8} onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add-circle" size={17} color="#FFFFFF" />
                <Text style={styles.actionBtnPrimaryText}>Create Circle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={() => setShowJoinModal(true)}>
                <Ionicons name="enter-outline" size={17} color="#5856D6" />
                <Text style={[styles.actionBtnText, { color: '#5856D6' }]}>Join with Code</Text>
              </TouchableOpacity>
            </View>

          </>
        )}

        {/* ── LEAGUES TAB ── */}
        {activeTab === 'leagues' && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, leagueCategory === cat && styles.filterChipGold]}
                  onPress={() => setLeagueCategory(cat)}
                >
                  <Text style={[styles.filterText, leagueCategory === cat && styles.filterTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.card}>
              {filteredLeagues.map((l, i) => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.row, i === filteredLeagues.length - 1 && styles.lastRow]}
                  onPress={() => navigation.navigate('PublicLeagueDetail', { id: l.id, name: l.name })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: joinedLeagues[l.id] ? '#FF9F0A30' : '#FF9F0A15' }]}>
                    <Ionicons name="trophy" size={20} color="#FF9F0A" />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{l.name}</Text>
                    <Text style={styles.rowSubtitle}>{l.members} members · {l.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.joinBtn, joinedLeagues[l.id] ? styles.joinedBtn : { backgroundColor: '#FF9F0A' }]}
                    onPress={() => setJoinedLeagues((p) => ({ ...p, [l.id]: !p[l.id] }))}
                  >
                    <Text style={[styles.joinBtnText, joinedLeagues[l.id] && styles.joinedBtnText]}>
                      {joinedLeagues[l.id] ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ── COUNTRIES TAB ── */}
        {activeTab === 'countries' && (
          <>
          <Text style={styles.sectionLabel}>RANKINGS</Text>
          <View style={[styles.card, styles.cardWide]}>
            {COUNTRIES.map((c, i) => (
              <TouchableOpacity
                key={c.name}
                style={[styles.row, i === COUNTRIES.length - 1 && styles.lastRow]}
                onPress={() => navigation.navigate('CountryDetail', { name: c.name, code: c.code, score: c.score, delta: c.delta, rank: i + 1 })}
                activeOpacity={0.7}
              >
                <Text style={styles.rank}>#{i + 1}</Text>
                <Text style={styles.flag}>{flagFromCode(c.code)}</Text>
                <Text style={styles.countryName}>{c.name}</Text>
                <View style={styles.scoreRow}>
                  <DeltaChip delta={c.delta} />
                  <Text style={styles.score}>{c.score.toFixed(1)}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#3A3A3C" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          </>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Create Circle Modal ── */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Circle</Text>
            <Text style={styles.modalSubtitle}>Give your circle a name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Morning Runners"
              placeholderTextColor="#636366"
              value={newCircleName}
              onChangeText={setNewCircleName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateCircle}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowCreateModal(false); setNewCircleName(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateCircle}>
                <Text style={styles.modalConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Join with Code Modal ── */}
      <Modal visible={showJoinModal} transparent animationType="fade" onRequestClose={() => setShowJoinModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join with Code</Text>
            <Text style={styles.modalSubtitle}>Enter the invite code shared by a friend</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. FAMILY-JOIN"
              placeholderTextColor="#636366"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="characters"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleJoinWithCode}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowJoinModal(false); setJoinCode(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleJoinWithCode}>
                <Text style={styles.modalConfirmText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CommunityLeaderboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
  },
  backButton: { width: 36, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },

  // Tab pill
  tabPill: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  tabItem: { alignItems: 'center', gap: 8, flex: 1 },
  tabCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },

  scroll: { flex: 1 },

  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 20 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E',
  },
  actionBtnPurple: { backgroundColor: '#5856D6', borderColor: '#5856D6' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5,
    marginTop: 24, marginBottom: 8, paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20, backgroundColor: '#1C1C1E',
    borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', overflow: 'hidden',
    marginTop: 8,
  },
  cardWide: { marginHorizontal: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E',
  },
  lastRow: { borderBottomWidth: 0 },
  iconContainer: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginRight: 13,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  rowSubtitle: { fontSize: 12, color: '#8E8E93' },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  joinBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  joinedBtn: { backgroundColor: '#2C2C2E' },
  joinedBtnText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  emptyRow: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 14 },

  filterRow: { paddingHorizontal: 20, gap: 8, paddingTop: 16, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E',
  },
  filterChipGold: { backgroundColor: '#FF9F0A', borderColor: '#FF9F0A' },
  filterText: { color: '#8E8E93', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Country
  rank: { width: 34, fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  flag: { fontSize: 19, marginRight: 10 },
  countryName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  score: { fontSize: 14, color: '#FFD60A', fontWeight: '700', minWidth: 36, textAlign: 'right' },
  deltaChip: {
    width: 16, height: 16, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  deltaUp: { backgroundColor: 'rgba(52,199,89,0.15)' },
  deltaDown: { backgroundColor: 'rgba(255,69,58,0.15)' },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%', backgroundColor: '#1C1C1E',
    borderRadius: 18, padding: 24, borderWidth: 1, borderColor: '#2C2C2E',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#8E8E93', marginBottom: 18 },
  modalInput: {
    backgroundColor: '#2C2C2E', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#FFFFFF', marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#2C2C2E', alignItems: 'center',
  },
  modalCancelText: { color: '#8E8E93', fontSize: 15, fontWeight: '600' },
  modalConfirm: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#5856D6', alignItems: 'center',
  },
  modalConfirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
