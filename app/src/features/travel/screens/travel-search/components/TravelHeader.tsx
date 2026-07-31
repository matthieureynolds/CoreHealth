import React from "react";
import { View, Text } from "react-native";
import { styles } from "../TravelScreen.styles";

// Static and prop-less, but it sits in TravelScreen which re-renders on every
// keystroke of the search field — memo keeps it out of that work entirely.
const TravelHeader: React.FC = React.memo(() => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Travel Health</Text>
    </View>
  </View>
));

TravelHeader.displayName = "TravelHeader";

export default TravelHeader;
