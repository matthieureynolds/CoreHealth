import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../shared/types';

type Nav = StackNavigationProp<ProfileTabParamList, 'PrivateCircles'>;

type CircleSummary = { id: string; name: string; members: number; icon: string; color: string };

const PrivateCirclesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [joined, setJoined] = useState<Record<string, boolean>>({ c1: true, c2: true });

  const circles = useMemo<CircleSummary[]>(() => [
    { id: 'c1', name: 'Family', members: 5, icon: 'home', color: '#5856D6' },
    { id: 'c2', name: 'Friends', members: 8, icon: 'people', color: '#007AFF' },
    { id: 'c3', name: 'Hikes and Parties', members: 42, icon: 'trail-sign', color: '#30D158' },
    { id: 'c4', name: 'Football Paris', members: 18, icon: 'football', color: '#FF9F0A' },
    { id: 'c5', name: 'Wellness Warriors', members: 12, icon: 'fitness', color: '#FF375F' },
    { id: 'c6', name: 'Weekend Runners', members: 9, icon: 'walk', color: '#64D2FF' },
    { id: 'c7', name: 'Strength Club', members: 15, icon: 'barbell', color: '#FF6B35' },
    { id: 'c8', name: 'Yoga Crew', members: 11, icon: 'leaf', color: '#30D158' },
    { id: 'c9', name: 'Recovery Lab', members: 7, icon: 'pulse', color: '#BF5AF2' },
  ], []);

  const myCircles = circles.filter((c) => joined[c.id]);
  const discoverCircles = circles.filter((c) => !joined[c.id]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Private Circles</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnPrimaryText}>Create Circle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Ionicons name="enter-outline" size={18} color="#007AFF" />
            <Text style={styles.actionBtnText}>Join with Code</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>MY CIRCLES</Text>
        <View style={styles.card}>
          {myCircles.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No circles yet. Create or join one below.</Text>
            </View>
          ) : (
            myCircles.map((circle, index) => (
              <TouchableOpacity
                key={circle.id}
                style={[styles.row, index === myCircles.length - 1 && styles.lastRow]}
                onPress={() => navigation.navigate('CircleDetail', { name: circle.name, members: circle.members })}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: circle.color + '20' }]}>
                  <Ionicons name={circle.icon as any} size={20} color={circle.color} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{circle.name}</Text>
                  <Text style={styles.rowSubtitle}>{circle.members} members · Private</Text>
                </View>
                <TouchableOpacity style={styles.joinedBtn} onPress={() => setJoined((prev) => ({ ...prev, [circle.id]: false }))}>
                  <Text style={styles.joinedBtnText}>Joined</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {discoverCircles.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>DISCOVER</Text>
            <View style={styles.card}>
              {discoverCircles.map((circle, index) => (
                <View key={circle.id} style={[styles.row, index === discoverCircles.length - 1 && styles.lastRow]}>
                  <View style={[styles.iconContainer, { backgroundColor: circle.color + '20' }]}>
                    <Ionicons name={circle.icon as any} size={20} color={circle.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{circle.name}</Text>
                    <Text style={styles.rowSubtitle}>{circle.members} members · Private</Text>
                  </View>
                  <TouchableOpacity style={styles.joinBtn} onPress={() => setJoined((prev) => ({ ...prev, [circle.id]: true }))}>
                    <Text style={styles.joinBtnText}>Join</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1C1C1E',
  },
  backButton: { padding: 8, width: 40 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' },
  scroll: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 24 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#2C2C2E',
  },
  actionBtnPrimary: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  actionBtnText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  actionBtnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5,
    marginTop: 28, marginBottom: 8, paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 20, backgroundColor: '#1C1C1E',
    borderRadius: 12, borderWidth: 1, borderColor: '#2C2C2E', overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#2C2C2E',
  },
  lastRow: { borderBottomWidth: 0 },
  iconContainer: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  rowSubtitle: { fontSize: 13, color: '#8E8E93' },
  joinBtn: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  joinBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  joinedBtn: { backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  joinedBtnText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  emptyRow: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 14, textAlign: 'center' },
});

export default PrivateCirclesScreen;
