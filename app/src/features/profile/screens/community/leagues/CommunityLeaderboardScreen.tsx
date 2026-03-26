import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../shared/types';
import { ALL_CIRCLES, TABS, Circle, TabKey } from './components/leaderboardData';
import LeaguesTab from './components/LeaguesTab';
import CountriesTab from './components/CountriesTab';
import { CreateCircleModal, JoinCircleModal } from './components/CircleModals';

type Nav = StackNavigationProp<ProfileTabParamList, 'CommunityLeaderboard'>;

const CommunityLeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab]         = useState<TabKey>('circles');
  const [joinedCircles, setJoinedCircles] = useState<Record<string, boolean>>({ c1: true, c2: true });
  const [joinedLeagues, setJoinedLeagues] = useState<Record<string, boolean>>({});
  const [leagueCategory, setLeagueCategory] = useState('All');
  const [circles, setCircles]             = useState<Circle[]>(ALL_CIRCLES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal]     = useState(false);
  const [newCircleName, setNewCircleName]     = useState('');
  const [joinCode, setJoinCode]               = useState('');

  const myCircles = circles.filter(c => joinedCircles[c.id]);

  const handleCreateCircle = () => {
    if (!newCircleName.trim()) { Alert.alert('Name required', 'Please enter a name for your circle.'); return; }
    const newId = `c${Date.now()}`;
    setCircles(prev => [...prev, { id: newId, name: newCircleName.trim(), members: 1, icon: 'people', color: '#5856D6' }]);
    setJoinedCircles(prev => ({ ...prev, [newId]: true }));
    setNewCircleName('');
    setShowCreateModal(false);
  };

  const handleJoinWithCode = () => {
    if (!joinCode.trim()) { Alert.alert('Code required', 'Please enter an invite code.'); return; }
    const matched = circles.find(c =>
      `${c.name.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-JOIN` === joinCode.trim().toUpperCase()
    );
    if (matched) {
      setJoinedCircles(prev => ({ ...prev, [matched.id]: true }));
      setJoinCode(''); setShowJoinModal(false);
      Alert.alert('Joined!', `You joined "${matched.name}".`);
    } else {
      Alert.alert('Invalid code', 'No circle found with that invite code. Ask your friend to share theirs from the Circle Detail screen.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.tabPill}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => setActiveTab(tab.key)} activeOpacity={0.8}>
              <View style={[styles.tabCircle, { backgroundColor: active ? tab.color + '55' : tab.color + '22' }, active && { borderColor: tab.color + '99', borderWidth: 1.5 }]}>
                <Ionicons name={tab.icon as any} size={36} color={tab.color} />
              </View>
              <Text style={[styles.tabLabel, { color: active ? tab.color : '#8E8E93' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {activeTab === 'circles' && (
          <>
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

        {activeTab === 'leagues' && (
          <LeaguesTab
            leagueCategory={leagueCategory}
            joinedLeagues={joinedLeagues}
            onCategoryChange={setLeagueCategory}
            onToggleJoin={id => setJoinedLeagues(p => ({ ...p, [id]: !p[id] }))}
          />
        )}

        {activeTab === 'countries' && <CountriesTab />}

        <View style={{ height: 48 }} />
      </ScrollView>

      <CreateCircleModal
        visible={showCreateModal}
        value={newCircleName}
        onChange={setNewCircleName}
        onConfirm={handleCreateCircle}
        onCancel={() => { setShowCreateModal(false); setNewCircleName(''); }}
      />
      <JoinCircleModal
        visible={showJoinModal}
        value={joinCode}
        onChange={setJoinCode}
        onConfirm={handleJoinWithCode}
        onCancel={() => { setShowJoinModal(false); setJoinCode(''); }}
      />
    </View>
  );
};

export default CommunityLeaderboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16 },
  backButton: { width: 36, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  tabPill: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 16, marginHorizontal: 20, marginBottom: 8 },
  tabItem: { alignItems: 'center', gap: 8, flex: 1 },
  tabCircle: { width: 86, height: 86, borderRadius: 43, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  scroll: { flex: 1 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5, marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  card: { marginHorizontal: 20, backgroundColor: '#1C1C1E', borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', overflow: 'hidden', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  iconContainer: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 13 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  rowSubtitle: { fontSize: 12, color: '#8E8E93' },
  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 20 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E' },
  actionBtnPurple: { backgroundColor: '#5856D6', borderColor: '#5856D6' },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  emptyRow: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 14 },
});
