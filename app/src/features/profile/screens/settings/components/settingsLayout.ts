import { StyleSheet } from 'react-native';

// Layout constants for settings screens
export const SETTINGS_HEADER_PT = 56;
export const SETTINGS_HEADER_PB = 12;
export const SETTINGS_SCROLL_PT = 95; // header height + spacing

export const SETTINGS_SUB_HEADER_PT = 56;
export const SETTINGS_SUB_HEADER_PB = 12;
export const SETTINGS_SUB_SCROLL_PT = 95;

// Shared styles used across settings screens
export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
});
