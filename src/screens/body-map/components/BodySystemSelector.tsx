import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type BodySystemType = 'organs' | 'skeleton' | 'circulation';

interface BodySystemSelectorProps {
  selectedSystem: BodySystemType;
  onSystemChange: (system: BodySystemType) => void;
}

const BodySystemSelector: React.FC<BodySystemSelectorProps> = ({
  selectedSystem,
  onSystemChange,
}) => {
  const systems = [
    {
      id: 'organs' as BodySystemType,
      name: 'Organs',
      icon: 'body' as const,
      description: 'Internal organs & biomarkers',
      color: '#FF6B35',
    },
    {
      id: 'skeleton' as BodySystemType,
      name: 'Skeleton',
      icon: 'skull' as const,
      description: 'Bones, joints & mobility',
      color: '#E8E8E8',
    },
    {
      id: 'circulation' as BodySystemType,
      name: 'Circulation',
      icon: 'heart' as const,
      description: 'Heart, blood vessels & flow',
      color: '#FF3B30',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Body Systems</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {systems.map(system => (
          <TouchableOpacity
            key={system.id}
            style={[
              styles.systemCard,
              selectedSystem === system.id && styles.selectedCard,
              { borderColor: system.color },
            ]}
            onPress={() => onSystemChange(system.id)}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: system.color }]}
            >
              <Ionicons name={system.icon} size={24} color="#fff" />
            </View>
            <Text
              style={[
                styles.systemName,
                selectedSystem === system.id && styles.selectedText,
              ]}
            >
              {system.name}
            </Text>
            <Text style={styles.systemDescription}>{system.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  systemCard: {
    width: 120,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectedText: {
    color: '#007AFF',
  },
  systemDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default BodySystemSelector;
