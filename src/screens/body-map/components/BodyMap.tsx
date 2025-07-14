import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ImageBackground,
} from 'react-native';
import { organsList } from '../organs';

interface BodyMapProps {
  onOrganPress: (organId: string) => void;
}

const BODY_IMAGE = require('../../../../assets/bodymaptransparent.png');

const BodyMap: React.FC<BodyMapProps> = ({ onOrganPress }) => {
  const { width } = Dimensions.get('window');
  const imageWidth = width * 0.95;
  const imageHeight = imageWidth * 1.5;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={BODY_IMAGE}
        style={[
          styles.imageBackground,
          { width: imageWidth, height: imageHeight },
        ]}
        imageStyle={styles.image}
      >
        {organsList.map(organ => (
          <TouchableOpacity
            key={organ.id}
            style={[
              styles.organPill,
              {
                left: organ.position.x * imageWidth - 40,
                top: organ.position.y * imageHeight - 15,
              },
            ]}
            onPress={() => onOrganPress(organ.id)}
          >
            <Text style={styles.organPillText}>{organ.label}</Text>
          </TouchableOpacity>
        ))}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#000000',
  },
  imageBackground: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'contain',
  },
  organPill: {
    position: 'absolute',
    backgroundColor: '#2196F3', // Modern blue
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#7FDBFF', // Lighter blue border
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  organPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BodyMap;
