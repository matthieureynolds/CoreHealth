import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { calculateProfileCompletion } from '../../../../shared/utils/profileCompletion';
import { useHealthData } from '../../../../shared/context/HealthDataContext';

import { PROFILE_ROUTES } from '../routeNames';
import { HeaderProfile } from '../../../../shared/components/HeaderProfile';

const HEADER_COLLAPSED = 96;

const SettingsHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const { profile, user } = useHealthData();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleExpandChange = (expanded: boolean) => {
    console.log('Header expanded:', expanded);
  };

  const profileCompletion = calculateProfileCompletion(user, profile);

  const settingsCategories = [
    {
      title: 'Account & Preferences',
      icon: 'person-circle-outline',
      onPress: () => navigation.navigate(PROFILE_ROUTES.ACCOUNT_PREFERENCES),
      description: 'Manage your account settings and preferences',
    },
    {
      title: 'Data & Privacy',
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate(PROFILE_ROUTES.DATA_PRIVACY),
      description: 'Control your data, privacy, and legal settings',
    },
    {
      title: 'Support & Help',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate(PROFILE_ROUTES.SUPPORT_HELP),
      description: 'Get help, report issues, and learn about the app',
    },
  ];

  const renderProfileCompletion = () => {
    const radius = 50;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const progress = profileCompletion / 100;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.completionContainer}>
        <View style={styles.completionCircle}>
          <Svg width={120} height={120} style={styles.completionSvg}>
            {/* Background circle */}
            <Circle
              cx={60}
              cy={60}
              r={radius}
              stroke="#E5E5E7"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={60}
              cy={60}
              r={radius}
              stroke="#007AFF"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 60 60)`}
            />
          </Svg>
          <View style={styles.completionTextContainer}>
            <Text style={styles.completionPercentage}>{profileCompletion}%</Text>
            <Text style={styles.completionLabel}>COMPLETE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileButton}>
          <Ionicons name="pencil" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSettingsItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.settingsItem}
      onPress={item.onPress}
    >
      <View style={styles.settingsItemContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingsTitle}>{item.title}</Text>
          <Text style={styles.settingsDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderProfile
        scrollY={scrollY}
        onExpandChange={handleExpandChange}
        name="Matthieu Reynolds"
        phoneMasked="+33 7 ••• •• •• ••"
        avatarUri="https://picsum.photos/200"
        showQuickActions
      />
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_COLLAPSED + 12 }
        ]}
      >
        <View style={styles.settingsSection}>
          {renderProfileCompletion()}
          {settingsCategories.map(renderSettingsItem)}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  settingsSection: {
    paddingHorizontal: 20,
  },
  settingsItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  completionCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionSvg: {
    position: 'absolute',
  },
  completionTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  completionPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  completionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SettingsHomeScreen;
