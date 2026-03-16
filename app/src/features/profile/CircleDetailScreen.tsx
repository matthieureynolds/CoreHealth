import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ProfileTabParamList } from '../../types';
import { colors } from '../../theme/colors';
// Removed top summary cards (HeroHealthScore, SupportingRings)

type Nav = StackNavigationProp<ProfileTabParamList, 'CircleDetail'>;
type Route = RouteProp<ProfileTabParamList, 'CircleDetail'>;

const CircleDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { name = 'Circle', members = 0, inviteCode: inviteCodeParam } = (route.params || {}) as any;

  const [period, setPeriod] = useState<'daily' | '7d' | '30d'>('7d');
  // Removed top summary scores; period remains for future filtering
  useMemo(() => period, [period]);

  const rows = [
    { name: 'Matthieu', avatar: 'person' as const, recovery: 86, biomarkers: 72, lifestyle: 81 },
    { name: 'Patrick', avatar: 'person' as const, recovery: 83, biomarkers: 67, lifestyle: 78 },
    { name: 'Dad', avatar: 'man' as const, recovery: 88, biomarkers: 70, lifestyle: 74 },
    { name: 'Mum', avatar: 'woman' as const, recovery: 79, biomarkers: 76, lifestyle: 80 },
    { name: 'Eleanor', avatar: 'person' as const, recovery: 82, biomarkers: 73, lifestyle: 77 },
  ];

  const inviteCode = useMemo(() => {
    if (inviteCodeParam) return String(inviteCodeParam);
    const base = String(name || 'CIRCLE').replace(/\s+/g, '-').toUpperCase();
    return `${base.slice(0, 10)}-JOIN`;
  }, [inviteCodeParam, name]);

  const MiniScore = ({ value, color }: { value: number; color: string }) => {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    return (
      <View style={styles.miniScore}>
        <Text style={[styles.miniScoreValue, { color }]}>{clamped}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.cta} />
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {(['daily', '7d', '30d'] as const).map(p => (
          <TouchableOpacity key={p} style={[styles.periodChip, period === p && styles.periodChipActive]} onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p === 'daily' ? 'DAILY' : p.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top summary removed as requested */}

      {/* Table header */}
      <View style={styles.tableHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerCol}>RECOVERY</Text>
        <Text style={styles.headerCol}>BIOMARKERS</Text>
        <Text style={styles.headerCol}>LIFESTYLE</Text>
      </View>

      {/* Members */}
      {rows.map((r, idx) => (
        <View key={idx} style={styles.row}>
          <View style={styles.memberLeft}>
            <View style={styles.avatar}><Ionicons name={r.avatar} size={14} color={colors.textPrimary} /></View>
            <Text style={styles.rowLabel}>{r.name}</Text>
          </View>
          <View style={styles.ringCell}><MiniScore value={r.recovery} color="#30D158" /></View>
          <View style={styles.ringCell}><MiniScore value={r.biomarkers} color={colors.cta} /></View>
          <View style={styles.ringCell}><MiniScore value={r.lifestyle} color="#FF9F0A" /></View>
        </View>
      ))}
      {/* Share Circle */}
      <View style={styles.shareCard}>
        <View style={styles.shareLeft}>
          <Text style={styles.shareTitle}>Share Circle</Text>
          <Text style={styles.shareSubtitle}>Invite others with code: <Text style={styles.shareCode}>{inviteCode}</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            Share.share({
              message: `Join my ${name} circle on CoreHealth. Invite code: ${inviteCode}`,
              title: 'Join my CoreHealth Circle',
            });
          }}
        >
          <Ionicons name="share-social" size={18} color={colors.cta} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 44, marginBottom: 6 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  periodRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: 6, alignSelf: 'flex-start', marginLeft: 20 },
  periodChip: { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  periodChipActive: { backgroundColor: 'rgba(25,118,210,0.2)' },
  periodText: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  periodTextActive: { color: colors.cta },
  kpiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  kpiCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.divider },
  kpiValue: { fontSize: 22, fontWeight: '900' },
  kpiUnit: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  kpiLabel: { color: '#C7C7CC', fontSize: 12, marginTop: 2 },
  kpiDiff: { color: '#34C759', fontWeight: '800', fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { color: colors.textPrimary, fontWeight: '600' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, marginBottom: 6, marginTop: 2 },
  headerSpacer: { flex: 1 },
  headerCol: { width: 78, textAlign: 'center', color: colors.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  ringCell: { width: 78, alignItems: 'center', justifyContent: 'center' },
  miniScore: { minWidth: 30, alignItems: 'center', justifyContent: 'center' },
  miniScoreValue: { fontSize: 13, fontWeight: '800' },
  shareCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 20, marginTop: 12, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  shareLeft: { flex: 1 },
  shareTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 14, marginBottom: 4 },
  shareSubtitle: { color: colors.textSecondary, fontSize: 12 },
  shareCode: { color: '#E5E5EA', fontWeight: '800' },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(25,118,210,0.15)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  shareButtonText: { color: colors.cta, fontWeight: '800' },
});

export default CircleDetailScreen;


