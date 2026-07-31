import React from "react";
import { View, Text, Animated, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../TravelScreen.styles";
import TreadmillCard from "./TreadmillCard";
import PressPop from "./PressPop";

const openMapsAlert = (destination: string) => {
  Alert.alert("Open Maps", `Navigate to ${destination}?`, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Apple Maps",
      onPress: () =>
        Linking.openURL(
          `http://maps.apple.com/?daddr=${encodeURIComponent(destination)}`,
        ),
    },
    {
      text: "Google Maps",
      onPress: () =>
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
        ),
    },
  ]);
};

interface NearbyHospitalsSectionProps {
  selectedLocation: string;
  getRowAnim: (key: string) => {
    opacity: Animated.Value;
    translate: Animated.Value;
  };
  onEmergencyContactPress: () => void;
  scrollY: Animated.Value;
  scrollContentRef: React.RefObject<any>;
}

const NearbyHospitalsSection: React.FC<NearbyHospitalsSectionProps> = ({
  selectedLocation,
  getRowAnim,
  onEmergencyContactPress,
  scrollY,
  scrollContentRef,
}) => (
  <Animated.View
    style={[
      styles.hospitalsSection,
      {
        opacity: getRowAnim("hospitals").opacity,
        transform: [{ translateY: getRowAnim("hospitals").translate }],
      },
    ]}
  >
    <View style={styles.sectionGroupCard}>
      <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
      <TreadmillCard scrollY={scrollY} scrollContentRef={scrollContentRef}>
        <PressPop
          style={styles.hospitalCard}
          onPress={() => openMapsAlert("Central Hospital")}
        >
          <View style={styles.hospitalHeader}>
            <Ionicons name="medical" size={20} color="#FF3B30" />
            <Text style={styles.hospitalTitle}>Central Hospital</Text>
            {selectedLocation === "Current Location" && (
              <Text style={styles.hospitalDistance}>2.1km</Text>
            )}
          </View>
          <Text style={styles.hospitalInfo}>
            24/7 Emergency Services • ICU Available
          </Text>
        </PressPop>
      </TreadmillCard>

      <TreadmillCard scrollY={scrollY} scrollContentRef={scrollContentRef}>
        <PressPop
          style={styles.hospitalCard}
          onPress={() => openMapsAlert("City Medical Center")}
        >
          <View style={styles.hospitalHeader}>
            <Ionicons name="medical" size={20} color="#FF3B30" />
            <Text style={styles.hospitalTitle}>City Medical Center</Text>
            {selectedLocation === "Current Location" && (
              <Text style={styles.hospitalDistance}>3.8km</Text>
            )}
          </View>
          <Text style={styles.hospitalInfo}>
            General Practice • Emergency Care
          </Text>
        </PressPop>
      </TreadmillCard>

      <TreadmillCard scrollY={scrollY} scrollContentRef={scrollContentRef}>
        <PressPop
          style={styles.hospitalCard}
          onPress={() => openMapsAlert("Emergency Clinic")}
        >
          <View style={styles.hospitalHeader}>
            <Ionicons name="medical" size={20} color="#FF3B30" />
            <Text style={styles.hospitalTitle}>Emergency Clinic</Text>
            {selectedLocation === "Current Location" && (
              <Text style={styles.hospitalDistance}>4.2km</Text>
            )}
          </View>
          <Text style={styles.hospitalInfo}>
            Urgent Care • Walk-in Available
          </Text>
        </PressPop>
      </TreadmillCard>

      <TreadmillCard scrollY={scrollY} scrollContentRef={scrollContentRef}>
        <PressPop style={styles.hospitalCard} onPress={onEmergencyContactPress}>
          <View style={styles.hospitalHeader}>
            <Ionicons name="call" size={20} color="#FF3B30" />
            <Text style={styles.hospitalTitle}>Emergency Contact</Text>
            <Text style={styles.hospitalDistance}>112</Text>
          </View>
          <Text style={styles.hospitalInfo}>
            Tap to call emergency services
          </Text>
        </PressPop>
      </TreadmillCard>
    </View>
  </Animated.View>
);

export default NearbyHospitalsSection;
