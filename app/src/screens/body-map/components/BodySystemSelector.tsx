import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type BodySystemType = 'organs' | 'skeleton' | 'circulation' | 'nutrition';

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
    },
    {
      id: 'skeleton' as BodySystemType,
      name: 'Skeleton',
      icon: 'skull' as const,
    },
    {
      id: 'circulation' as BodySystemType,
      name: 'Circulatory',
      icon: 'heart' as const,
    },
    {
      id: 'nutrition' as BodySystemType,
      name: 'Nutrition',
      icon: 'nutrition' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContainer}
      >
        {systems.map(system => (
          <TouchableOpacity
            key={system.id}
            style={[
              styles.tab,
              selectedSystem === system.id && styles.selectedTab,
            ]}
            onPress={() => onSystemChange(system.id)}
            activeOpacity={0.7}
            >
            <Ionicons 
              name={system.icon} 
              size={18} 
              color={selectedSystem === system.id ? '#007AFF' : '#8E8E93'} 
            />
            <Text
              style={[
                styles.tabText,
                selectedSystem === system.id && styles.selectedTabText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {system.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  tabScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minWidth: 110,
    borderRadius: 8,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    maxWidth: 100,
  },
  selectedTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default BodySystemSelector;
