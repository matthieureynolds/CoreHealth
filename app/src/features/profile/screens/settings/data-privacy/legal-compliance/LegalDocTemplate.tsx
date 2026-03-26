import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  title: string;
  content: string[];
}

const LegalDocTemplate: React.FC<Props> = ({ title, content }) => {
  const navigation = useNavigation();
  // Persist effective dates for assistant/offline answers when available
  useEffect(() => {
    (async () => {
      try {
        const line = (content || []).find(p => /effective\s+date:/i.test(p));
        if (line) {
          const match = line.match(/effective\s+date:\s*(.+)/i);
          const date = match?.[1]?.trim();
          if (date) {
            if (/privacy/i.test(title)) {
              await AsyncStorage.setItem('@legal_privacy_effective_date', date);
            } else if (/terms/i.test(title)) {
              await AsyncStorage.setItem('@legal_tos_effective_date', date);
            }
          }
        }
      } catch (e) { console.error(e); }
    })();
  }, [title, content]);
  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        <View style={styles.section}>
          {content.map((p, idx) => (
            <Text key={idx} style={styles.paragraph}>{p}</Text>
          ))}
        </View>

        {/* Bottom spacing to match the gap between cards */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  section: { marginHorizontal: 20, marginTop: 24 },
  cardHeader: { fontSize: 16, fontWeight: '700', color: '#8E8E93', marginBottom: 16, letterSpacing: 0.8 },
  paragraph: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  bottomSpacing: { height: 20 },
});

export default LegalDocTemplate;
