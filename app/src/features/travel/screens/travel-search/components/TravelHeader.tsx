import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../TravelScreen.styles';

const TravelHeader: React.FC = () => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Travel Health</Text>
      <Text style={styles.headerSubtitle}>Destination health insights and safety information</Text>
    </View>
  </View>
);

export default TravelHeader;
