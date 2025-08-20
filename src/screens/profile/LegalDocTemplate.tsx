import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Props {
  title: string;
  content: string[];
}

const LegalDocTemplate: React.FC<Props> = ({ title, content }) => {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>{title.toUpperCase()}</Text>
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          {content.map((p, idx) => (
            <Text key={idx} style={styles.paragraph}>{p}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#000000' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  paragraph: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, marginBottom: 12 },
});

export default LegalDocTemplate;
