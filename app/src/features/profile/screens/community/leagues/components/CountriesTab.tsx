import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../../shared/types';
import { COUNTRIES, flagFromCode } from './leaderboardData';
import DeltaChip from './DeltaChip';

type Nav = StackNavigationProp<ProfileTabParamList, 'CommunityLeaderboard'>;

const CountriesTab: React.FC = () => {
  const navigation = useNavigation<Nav>();
  return (
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
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5,
    marginTop: 24, marginBottom: 8, paddingHorizontal: 20,
  },
  card: { marginHorizontal: 20, backgroundColor: '#1C1C1E', borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', overflow: 'hidden', marginTop: 8 },
  cardWide: { marginHorizontal: 10 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2C2C2E' },
  lastRow: { borderBottomWidth: 0 },
  rank: { width: 34, fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  flag: { fontSize: 19, marginRight: 10 },
  countryName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  score: { fontSize: 14, color: '#FFD60A', fontWeight: '700', minWidth: 36, textAlign: 'right' },
});

export default CountriesTab;
