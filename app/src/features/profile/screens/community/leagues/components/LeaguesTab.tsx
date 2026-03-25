import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../../shared/types';
import { ALL_LEAGUES, LEAGUE_CATEGORIES, League } from './leaderboardData';

type Nav = StackNavigationProp<ProfileTabParamList, 'CommunityLeaderboard'>;

interface LeaguesTabProps {
  leagueCategory: string;
  joinedLeagues: Record<string, boolean>;
  onCategoryChange: (cat: string) => void;
  onToggleJoin: (id: string) => void;
}

const LeaguesTab: React.FC<LeaguesTabProps> = ({
  leagueCategory, joinedLeagues, onCategoryChange, onToggleJoin,
}) => {
  const navigation = useNavigation<Nav>();
  const filteredLeagues: League[] = leagueCategory === 'All'
    ? ALL_LEAGUES
    : ALL_LEAGUES.filter(l => l.category === leagueCategory);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {LEAGUE_CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.filterChip, leagueCategory === cat && styles.filterChipGold]} onPress={() => onCategoryChange(cat)}>
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
              onPress={() => onToggleJoin(l.id)}
            >
              <Text style={[styles.joinBtnText, joinedLeagues[l.id] && styles.joinedBtnText]}>
                {joinedLeagues[l.id] ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 20, gap: 8, paddingTop: 16, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E' },
  filterChipGold: { backgroundColor: '#FF9F0A', borderColor: '#FF9F0A' },
  filterText: { color: '#8E8E93', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  card: { marginHorizontal: 20, backgroundColor: '#1C1C1E', borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', overflow: 'hidden', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  iconContainer: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 13 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  rowSubtitle: { fontSize: 12, color: '#8E8E93' },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  joinBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  joinedBtn: { backgroundColor: '#2C2C2E' },
  joinedBtnText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
});

export default LeaguesTab;
