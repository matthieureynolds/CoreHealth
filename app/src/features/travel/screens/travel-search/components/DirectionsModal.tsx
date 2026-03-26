import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../TravelScreen.styles';

interface DirectionsModalProps {
  destination: string | null;
  onClose: () => void;
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({ destination, onClose }) => {
  if (!destination) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContentDirections}>
        <View style={styles.modalHeaderDirections}>
          <View style={styles.modalIconCircleDirections}>
            <Ionicons name="navigate" size={22} color="#30D158" />
          </View>
          <Text style={styles.modalTitleDirections}>Open Maps</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Ionicons name="close" size={22} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={{ color: '#EBEBF5', fontSize: 15, marginBottom: 12 }}>
            How would you like to navigate to {destination}?
          </Text>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => {
              const dest = encodeURIComponent(String(destination));
              Linking.openURL(`http://maps.apple.com/?daddr=${dest}`);
              onClose();
            }}
          >
            <Ionicons name="map" size={20} color="#3AABF0" />
            <Text style={styles.directionsButtonText}>Apple Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => {
              const dest = encodeURIComponent(String(destination));
              Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
              onClose();
            }}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={styles.directionsButtonText}>Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DirectionsModal;
