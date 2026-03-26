import { useState, useEffect, useRef } from 'react';
import { Animated, Alert, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../../../../shared/context/AuthContext';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import { calculateProfileCompletion } from '../../../../../shared/utils/profileCompletion';
import { ProfileTabParamList } from '../../../../../shared/types';

type ProfileDetailsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

export const COLLAPSE_DISTANCE = 140;
export const AVATAR_LARGE = 110;
export const AVATAR_SMALL = 34;
export const AVATAR_SCALE_END = AVATAR_SMALL / AVATAR_LARGE; // ~0.309

// Layout constants
const SAFE_AREA_TOP = Platform.OS === 'ios' ? 44 : 20;
const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;
const AVATAR_START_TOP = 66; // paddingTop of profile header
const AVATAR_START_CENTER_Y = AVATAR_START_TOP + AVATAR_LARGE / 2; // 121
const NAVBAR_CENTER_Y = SAFE_AREA_TOP + (NAVBAR_HEIGHT - SAFE_AREA_TOP) / 2; // ~66 iOS

export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export function useProfileDetails() {
  const navigation = useNavigation<ProfileDetailsScreenNavigationProp>();
  const { user, updateUserPhoto } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      setIsHeaderVisible(value > COLLAPSE_DISTANCE / 2);
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY]);

  const handlePhotoSelected = (photoURI: string) => {
    if (updateUserPhoto) {
      updateUserPhoto(photoURI);
    }
  };

  const handleDateConfirm = (date: Date, age: number) => {
    try {
      updateProfile({ ...profile, age, birthDate: date.toISOString() });
      setShowDatePicker(false);
    } catch {
      Alert.alert('Error', 'Failed to save date of birth. Please try again.');
    }
  };

  const handleGenderSelect = (gender: 'male' | 'female' | 'other') => {
    try {
      updateProfile({ ...profile, gender });
    } catch {
      Alert.alert('Error', 'Failed to update gender. Please try again.');
    }
  };

  // --- Telegram-style collapsing avatar ---

  const screenWidth = Dimensions.get('window').width;

  // Avatar shrinks as user scrolls
  const avatarScale = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0.01],
    extrapolate: 'clamp',
  });

  // Avatar squeezes upward and out of view
  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -AVATAR_START_TOP - AVATAR_LARGE / 2], // moves fully above screen
    extrapolate: 'clamp',
  });

  // No horizontal movement
  const avatarTranslateX = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, 0],
    extrapolate: 'clamp',
  });

  // Avatar fades out in the last 30% of scroll
  const avatarOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_DISTANCE * 0.70, COLLAPSE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Large name: fades out and drifts up in the first 35%
  const largeNameOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.35],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const largeNameTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.45],
    outputRange: [0, -16],
    extrapolate: 'clamp',
  });

  // Blur background fades in from 20% to 70%
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_DISTANCE * 0.20, COLLAPSE_DISTANCE * 0.70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Sticky name: fades in from 50% to 80%
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_DISTANCE * 0.50, COLLAPSE_DISTANCE * 0.80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_DISTANCE * 0.50, COLLAPSE_DISTANCE * 0.80],
    outputRange: [-8, 0],
    extrapolate: 'clamp',
  });

  const userName = user?.firstName && user?.surname
    ? `${user.firstName} ${user.surname}`
    : user?.displayName || 'User';

  const userUsername = `@${(user?.username || user?.preferredName || user?.firstName || 'user')
    .toString()
    .replace(/\s+/g, '.')
    .toLowerCase()}`;

  const profileCompletion = calculateProfileCompletion(user, profile);

  return {
    navigation,
    user,
    profile,
    showDatePicker,
    setShowDatePicker,
    showGenderPicker,
    setShowGenderPicker,
    isHeaderVisible,
    scrollY,
    handlePhotoSelected,
    handleDateConfirm,
    handleGenderSelect,
    // Animated values
    avatarScale,
    avatarOpacity,
    avatarTranslateY,
    avatarTranslateX,
    largeNameOpacity,
    largeNameTranslateY,
    headerBgOpacity,
    stickyHeaderOpacity,
    stickyHeaderTranslateY,
    // Derived values
    userName,
    userUsername,
    profileCompletion,
  };
}
