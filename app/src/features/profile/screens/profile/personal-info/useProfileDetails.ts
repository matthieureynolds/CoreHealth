import { useState, useEffect, useRef } from 'react';
import { Animated, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../../../../shared/context/AuthContext';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import { calculateProfileCompletion } from '../../../../../shared/utils/profileCompletion';
import { ProfileTabParamList } from '../../../../../shared/types';

type ProfileDetailsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

export const COLLAPSE_DISTANCE = 120;
export const AVATAR_LARGE = 110;
export const AVATAR_SMALL = 32;
export const NAME_LARGE = 24;
export const NAME_SMALL = 18;
export const USERNAME_LARGE = 15;
export const USERNAME_SMALL = 12;
export const HEADER_BG_START = 20;
export const HEADER_BG_END = 100;

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
    setShowGenderPicker(false);
  };

  // Animated interpolations
  const headerTopPadding = Platform.OS === 'ios' ? 44 : 20;
  const headerContentPadding = 8;
  const stickyHeaderY = headerTopPadding + headerContentPadding + AVATAR_SMALL / 2;
  const initialAvatarY = 66 + AVATAR_LARGE / 2;

  const avatarScale = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, AVATAR_SMALL / AVATAR_LARGE],
    extrapolate: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, stickyHeaderY - initialAvatarY],
    extrapolate: 'clamp',
  });

  const largeNameOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const largeNameTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const largeUsernameOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const largeUsernameTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const nameSize = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [NAME_LARGE, NAME_SMALL],
    extrapolate: 'clamp',
  });

  const usernameSize = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [USERNAME_LARGE, USERNAME_SMALL],
    extrapolate: 'clamp',
  });

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [HEADER_BG_START, HEADER_BG_END],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [-20, 0],
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
    avatarTranslateY,
    largeNameOpacity,
    largeNameTranslateY,
    largeUsernameOpacity,
    largeUsernameTranslateY,
    nameSize,
    usernameSize,
    headerBgOpacity,
    stickyHeaderOpacity,
    stickyHeaderTranslateY,
    // Derived values
    userName,
    userUsername,
    profileCompletion,
  };
}
