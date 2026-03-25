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
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">{title}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.card}>
          <Text style={styles.cardHeader}>{title.toUpperCase()}</Text>
          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            {content.map((p, idx) => (
              <Text key={idx} style={styles.paragraph}>{p}</Text>
            ))}
          </View>
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
    paddingTop: 72, 
    paddingBottom: 5, 
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 17.7,
    paddingBottom: 8,
  },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  paragraph: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, marginBottom: 12, textAlign: 'justify' },
  bottomSpacing: { height: 20 },
});

export default LegalDocTemplate;
