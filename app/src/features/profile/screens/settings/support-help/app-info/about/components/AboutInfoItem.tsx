import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoItemProps {
  icon: string;
  title: string;
  value: string;
  onPress?: () => void;
}

const AboutInfoItem: React.FC<InfoItemProps> = ({ icon, title, value, onPress }) => (
  <TouchableOpacity
    style={styles.infoItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.infoItemLeft}>
      <Ionicons name={icon as any} size={24} color="#3AABF0" />
      <Text style={styles.infoItemTitle}>{title}</Text>
    </View>
    <View style={styles.infoItemRight}>
      <Text style={[styles.infoItemValue, onPress && styles.linkText]}>{value}</Text>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  infoItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 17,
    color: '#000000',
    marginLeft: 12,
  },
  infoItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemValue: {
    fontSize: 17,
    color: '#8E8E93',
    marginRight: 8,
  },
  linkText: {
    color: '#3AABF0',
  },
});

export default AboutInfoItem;
