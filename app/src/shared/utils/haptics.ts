import { Platform, Vibration } from 'react-native';

export function useHaptics() {
  const light = () => {
    if (Platform.OS !== 'ios') Vibration.vibrate(10);
  };

  const medium = () => {
    if (Platform.OS !== 'ios') Vibration.vibrate(20);
  };

  const heavy = () => {
    if (Platform.OS !== 'ios') Vibration.vibrate(30);
  };

  return { light, medium, heavy };
}
