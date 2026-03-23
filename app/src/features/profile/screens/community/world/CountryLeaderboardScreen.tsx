import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../shared/types';
import { colors } from '../../../../../shared/theme/colors';

type Nav = StackNavigationProp<ProfileTabParamList, 'CountryLeaderboard'>;

const SF_FONT = Platform.select({ ios: 'SF Pro Text', android: 'System' }) ?? 'System';

const CountryLeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [joinedCountry, setJoinedCountry] = useState(false);

  const countryAverages = useMemo(() => {
    const countries = [
      { name: 'Afghanistan', code: 'AF' },
      { name: 'Albania', code: 'AL' },
      { name: 'Algeria', code: 'DZ' },
      { name: 'Andorra', code: 'AD' },
      { name: 'Angola', code: 'AO' },
      { name: 'Antigua and Barbuda', code: 'AG' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Armenia', code: 'AM' },
      { name: 'Australia', code: 'AU' },
      { name: 'Austria', code: 'AT' },
      { name: 'Azerbaijan', code: 'AZ' },
      { name: 'Bahamas', code: 'BS' },
      { name: 'Bahrain', code: 'BH' },
      { name: 'Bangladesh', code: 'BD' },
      { name: 'Barbados', code: 'BB' },
      { name: 'Belarus', code: 'BY' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Belize', code: 'BZ' },
      { name: 'Benin', code: 'BJ' },
      { name: 'Bhutan', code: 'BT' },
      { name: 'Bolivia', code: 'BO' },
      { name: 'Bosnia and Herzegovina', code: 'BA' },
      { name: 'Botswana', code: 'BW' },
      { name: 'Brazil', code: 'BR' },
      { name: 'Brunei', code: 'BN' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Burundi', code: 'BI' },
      { name: 'Cabo Verde', code: 'CV' },
      { name: 'Cambodia', code: 'KH' },
      { name: 'Cameroon', code: 'CM' },
      { name: 'Canada', code: 'CA' },
      { name: 'Central African Republic', code: 'CF' },
      { name: 'Chad', code: 'TD' },
      { name: 'Chile', code: 'CL' },
      { name: 'China', code: 'CN' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Comoros', code: 'KM' },
      { name: 'Congo (Congo-Brazzaville)', code: 'CG' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cuba', code: 'CU' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czechia', code: 'CZ' },
      { name: 'Democratic Republic of the Congo', code: 'CD' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Djibouti', code: 'DJ' },
      { name: 'Dominica', code: 'DM' },
      { name: 'Dominican Republic', code: 'DO' },
      { name: 'Ecuador', code: 'EC' },
      { name: 'Egypt', code: 'EG' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Equatorial Guinea', code: 'GQ' },
      { name: 'Eritrea', code: 'ER' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Eswatini', code: 'SZ' },
      { name: 'Ethiopia', code: 'ET' },
      { name: 'Fiji', code: 'FJ' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'Gabon', code: 'GA' },
      { name: 'Gambia', code: 'GM' },
      { name: 'Georgia', code: 'GE' },
      { name: 'Germany', code: 'DE' },
      { name: 'Ghana', code: 'GH' },
      { name: 'Greece', code: 'GR' },
      { name: 'Grenada', code: 'GD' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'Guinea', code: 'GN' },
      { name: 'Guinea-Bissau', code: 'GW' },
      { name: 'Guyana', code: 'GY' },
      { name: 'Haiti', code: 'HT' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Iceland', code: 'IS' },
      { name: 'India', code: 'IN' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Iran', code: 'IR' },
      { name: 'Iraq', code: 'IQ' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Israel', code: 'IL' },
      { name: 'Italy', code: 'IT' },
      { name: 'Jamaica', code: 'JM' },
      { name: 'Japan', code: 'JP' },
      { name: 'Jordan', code: 'JO' },
      { name: 'Kazakhstan', code: 'KZ' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Kuwait', code: 'KW' },
      { name: 'Kyrgyzstan', code: 'KG' },
      { name: 'Laos', code: 'LA' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Lebanon', code: 'LB' },
      { name: 'Lesotho', code: 'LS' },
      { name: 'Liberia', code: 'LR' },
      { name: 'Libya', code: 'LY' },
      { name: 'Liechtenstein', code: 'LI' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Malawi', code: 'MW' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Maldives', code: 'MV' },
      { name: 'Mali', code: 'ML' },
      { name: 'Malta', code: 'MT' },
      { name: 'Mauritania', code: 'MR' },
      { name: 'Mauritius', code: 'MU' },
      { name: 'Mexico', code: 'MX' },
      { name: 'Moldova', code: 'MD' },
      { name: 'Monaco', code: 'MC' },
      { name: 'Mongolia', code: 'MN' },
      { name: 'Montenegro', code: 'ME' },
      { name: 'Morocco', code: 'MA' },
      { name: 'Mozambique', code: 'MZ' },
      { name: 'Myanmar', code: 'MM' },
      { name: 'Namibia', code: 'NA' },
      { name: 'Nepal', code: 'NP' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Nicaragua', code: 'NI' },
      { name: 'Niger', code: 'NE' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'North Korea', code: 'KP' },
      { name: 'North Macedonia', code: 'MK' },
      { name: 'Norway', code: 'NO' },
      { name: 'Oman', code: 'OM' },
      { name: 'Pakistan', code: 'PK' },
      { name: 'Panama', code: 'PA' },
      { name: 'Papua New Guinea', code: 'PG' },
      { name: 'Paraguay', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Philippines', code: 'PH' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Romania', code: 'RO' },
      { name: 'Russia', code: 'RU' },
      { name: 'Rwanda', code: 'RW' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Senegal', code: 'SN' },
      { name: 'Serbia', code: 'RS' },
      { name: 'Seychelles', code: 'SC' },
      { name: 'Sierra Leone', code: 'SL' },
      { name: 'Singapore', code: 'SG' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Somalia', code: 'SO' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'South Korea', code: 'KR' },
      { name: 'South Sudan', code: 'SS' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sri Lanka', code: 'LK' },
      { name: 'Sudan', code: 'SD' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Syria', code: 'SY' },
      { name: 'Taiwan', code: 'TW' },
      { name: 'Tajikistan', code: 'TJ' },
      { name: 'Tanzania', code: 'TZ' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Togo', code: 'TG' },
      { name: 'Tunisia', code: 'TN' },
      { name: 'Turkey', code: 'TR' },
      { name: 'Uganda', code: 'UG' },
      { name: 'Ukraine', code: 'UA' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'United States', code: 'US' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Uzbekistan', code: 'UZ' },
      { name: 'Venezuela', code: 'VE' },
      { name: 'Vietnam', code: 'VN' },
      { name: 'Yemen', code: 'YE' },
      { name: 'Zambia', code: 'ZM' },
      { name: 'Zimbabwe', code: 'ZW' },
      { name: 'Palestine', code: 'PS' },
      { name: 'Hong Kong SAR, China', code: 'HK' },
      { name: 'Macao SAR, China', code: 'MO' },
    ];

    const byName = new Map(countries.map((c) => [c.name, c.code]));

    const ranked = [
      { name: 'Hong Kong SAR, China', score: 85.1 },
      { name: 'Japan', score: 84.4 },
      { name: 'Macao SAR, China', score: 84.2 },
      { name: 'Switzerland', score: 83.7 },
      { name: 'Singapore', score: 83.5 },
      { name: 'Spain', score: 83.5 },
      { name: 'South Korea', score: 83.2 },
      { name: 'Italy', score: 83.2 },
      { name: 'Liechtenstein', score: 83.0 },
      { name: 'Sweden', score: 83.0 },
      { name: 'Norway', score: 82.9 },
      { name: 'Australia', score: 82.9 },
      { name: 'Israel', score: 82.8 },
      { name: 'Malta', score: 82.6 },
      { name: 'France', score: 82.6 },
      { name: 'Iceland', score: 82.6 },
      { name: 'Luxembourg', score: 82.4 },
      { name: 'Ireland', score: 82.3 },
      { name: 'Canada', score: 82.0 },
      { name: 'Netherlands', score: 82.0 },
      { name: 'Greece', score: 81.9 },
      { name: 'Austria', score: 81.8 },
      { name: 'Finland', score: 81.8 },
      { name: 'Belgium', score: 81.7 },
      { name: 'New Zealand', score: 81.7 },
      { name: 'Slovenia', score: 81.3 },
      { name: 'United Kingdom', score: 81.2 },
      { name: 'Denmark', score: 81.2 },
      { name: 'Cyprus', score: 81.0 },
      { name: 'Germany', score: 81.0 },
      { name: 'Portugal', score: 80.9 },
      { name: 'Costa Rica', score: 80.2 },
      { name: 'Qatar', score: 80.1 },
      { name: 'Chile', score: 80.0 },
      { name: 'United States', score: 78.5 },
      { name: 'Czech Republic', score: 78.4 },
      { name: 'Cuba', score: 78.0 },
      { name: 'Albania', score: 77.8 },
      { name: 'Panama', score: 77.5 },
      { name: 'Estonia', score: 77.3 },
      { name: 'Croatia', score: 77.2 },
      { name: 'Uruguay', score: 77.1 },
      { name: 'Oman', score: 76.9 },
      { name: 'Poland', score: 76.7 },
      { name: 'Turkey', score: 76.5 },
      { name: 'Colombia', score: 76.3 },
      { name: 'Thailand', score: 76.0 },
      { name: 'China', score: 77.1 },
      { name: 'Brazil', score: 75.9 },
      { name: 'India', score: 70.4 },
      { name: 'Nigeria', score: 54.7 },
      { name: 'Chad', score: 52.1 },
    ];

    const flagFromCode = (code: string) => {
      const upper = code.toUpperCase();
      const base = 0x1f1e6;
      const first = upper.charCodeAt(0) - 65 + base;
      const second = upper.charCodeAt(1) - 65 + base;
      return String.fromCodePoint(first, second);
    };

    return ranked.map((entry, idx) => {
      const code = byName.get(entry.name);
      return {
        name: entry.name,
        flag: code ? flagFromCode(code) : '🌐',
        score: entry.score,
        delta: idx % 3 === 0 ? 1 : idx % 3 === 1 ? 0 : -1,
      };
    });
  }, []);

  const RankDelta = ({ delta }: { delta: number }) => {
    if (delta === 0) return <View style={styles.deltaFlat} />;
    return (
      <View style={[styles.deltaChip, delta > 0 ? styles.deltaUp : styles.deltaDown]}>
        <Ionicons
          name={delta > 0 ? 'arrow-up' : 'arrow-down'}
          size={9}
          color={delta > 0 ? '#34C759' : '#FF453A'}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Country Leaderboard</Text>
        <TouchableOpacity
          style={[styles.joinBtn, joinedCountry && styles.joinedBtn]}
          onPress={() => setJoinedCountry((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.joinBtnText, joinedCountry && styles.joinedBtnText]}>
            {joinedCountry ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.leaderboardCard]}>
          {countryAverages.map((c, idx) => (
            <View key={c.name} style={styles.lbRow}>
              <Text style={styles.lbRank}>#{idx + 1}</Text>
              <Text style={styles.lbFlag}>{c.flag}</Text>
              <Text style={styles.lbName}>{c.name}</Text>
              <View style={styles.lbScoreRow}>
                <RankDelta delta={c.delta} />
                <Text style={styles.lbScore}>{typeof c.score === 'number' ? c.score.toFixed(1) : '—'}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

export default CountryLeaderboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, paddingBottom: 4, backgroundColor: colors.bg },
  scrollContent: { flex: 1 },
  headerBackBtn: { padding: 4 },
  headerTitle: { flex: 1, color: colors.textPrimary, fontSize: 20, fontWeight: '600', textAlign: 'center', fontFamily: SF_FONT },
  joinBtn: {
    backgroundColor: colors.cta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  joinBtnText: {
    color: colors.ctaText,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: SF_FONT,
  },
  joinedBtn: { backgroundColor: colors.surfaceMuted },
  joinedBtnText: { color: colors.textSecondary },
  card: { backgroundColor: 'transparent', marginHorizontal: 20, marginBottom: 10 },
  leaderboardCard: { paddingTop: 0, paddingBottom: 0 },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  lbRank: { color: colors.textSecondary, width: 40, fontSize: 13, fontFamily: SF_FONT },
  lbFlag: { width: 24, textAlign: 'center' },
  lbName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, fontFamily: SF_FONT },
  lbScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 70, justifyContent: 'flex-end' },
  lbScore: { color: '#FFD60A', fontWeight: '700', textAlign: 'right', fontSize: 14, fontFamily: SF_FONT },
  deltaChip: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaUp: { backgroundColor: 'rgba(52, 199, 89, 0.15)' },
  deltaDown: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  deltaFlat: { width: 16, height: 16 },
});
