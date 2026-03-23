import { Platform, Vibration } from 'react-native';

export function useHaptics() {
  const light = () => {
    if (Platform.OS === 'ios') {
      // iOS haptics not available without expo-haptics
      console.log('Haptics not available - expo-haptics not installed');
    } else {
      Vibration.vibrate(10);
    }
  };

  const medium = () => {
    if (Platform.OS === 'ios') {
      console.log('Haptics not available - expo-haptics not installed');
    } else {
      Vibration.vibrate(20);
    }
  };

  const heavy = () => {
    if (Platform.OS === 'ios') {
      console.log('Haptics not available - expo-haptics not installed');
    } else {
      Vibration.vibrate(30);
    }
  };

  return { light, medium, heavy };
}