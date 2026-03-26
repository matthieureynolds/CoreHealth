import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { AccessibilityInfo } from 'react-native';

// Constants
const HEADER_EXPANDED = 220;
const HEADER_COLLAPSED = 96;
const AVATAR_MAX = 88;
const AVATAR_MIN = 36;
const TITLE_SIZE_MAX = 28;
const TITLE_SIZE_MIN = 22;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface HeaderProfileProps {
  scrollY: SharedValue<number>;
  onExpandChange?: (expanded: boolean) => void;
  name: string;
  phoneMasked?: string;
  avatarUri?: string;
  showQuickActions?: boolean;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({
  scrollY,
  onExpandChange,
  name,
  phoneMasked,
  avatarUri,
  showQuickActions = true,
}) => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotionEnabled);
    return () => subscription?.remove();
  }, []);
  const dragY = useSharedValue(0);
  const target = useSharedValue(HEADER_COLLAPSED);
  const isExpanded = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Only allow pull-down when at the top
      // No-op here; gating occurs in onUpdate using scrollY
    })
    .onUpdate((event) => {
      if (scrollY.value <= 0) {
        dragY.value = Math.max(0, event.translationY);
      }
    })
    .onEnd((event) => {
      const expandThreshold = 40;
      const velocityThreshold = 500;

      const shouldExpand =
        dragY.value > expandThreshold || event.velocityY > velocityThreshold;

      target.value = shouldExpand ? HEADER_EXPANDED : HEADER_COLLAPSED;
      isExpanded.value = shouldExpand;

      // Spring animation for dragY
      dragY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.9,
      });

      // Notify parent of expansion change
      if (onExpandChange) {
        runOnJS(onExpandChange)(shouldExpand);
      }
    });

  // Calculate header height with scroll and drag
  const headerHeight = useAnimatedStyle(() => {
    const scrollProgress = Math.max(0, -scrollY.value / 100);
    const dragProgress = dragY.value / 50;
    const totalProgress = Math.min(1, scrollProgress + dragProgress);
    
    const height = interpolate(
      totalProgress,
      [0, 1],
      [HEADER_COLLAPSED, HEADER_EXPANDED],
      Extrapolate.CLAMP
    );

    return {
      height: reduceMotionEnabled ? HEADER_COLLAPSED : height,
    };
  });

  // Avatar animation
  const avatarStyle = useAnimatedStyle(() => {
    const scrollProgress = Math.max(0, -scrollY.value / 100);
    const dragProgress = dragY.value / 50;
    const totalProgress = Math.min(1, scrollProgress + dragProgress);

    const size = interpolate(
      totalProgress,
      [0, 1],
      [AVATAR_MIN, AVATAR_MAX],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      totalProgress,
      [0, 1],
      [0, -10],
      Extrapolate.CLAMP
    );

    return {
      width: reduceMotionEnabled ? AVATAR_MIN : size,
      height: reduceMotionEnabled ? AVATAR_MIN : size,
      borderRadius: reduceMotionEnabled ? AVATAR_MIN / 2 : size / 2,
      transform: reduceMotionEnabled ? [] : [{ translateY }],
    };
  });

  // Title animation
  const titleStyle = useAnimatedStyle(() => {
    const scrollProgress = Math.max(0, -scrollY.value / 100);
    const dragProgress = dragY.value / 50;
    const totalProgress = Math.min(1, scrollProgress + dragProgress);

    const fontSize = interpolate(
      totalProgress,
      [0, 1],
      [TITLE_SIZE_MIN, TITLE_SIZE_MAX],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      totalProgress,
      [0, 1],
      [0, -5],
      Extrapolate.CLAMP
    );

    return {
      fontSize: reduceMotionEnabled ? TITLE_SIZE_MIN : fontSize,
      transform: reduceMotionEnabled ? [] : [{ translateY }],
    };
  });

  // Quick actions animation
  const quickActionsStyle = useAnimatedStyle(() => {
    const scrollProgress = Math.max(0, -scrollY.value / 100);
    const dragProgress = dragY.value / 50;
    const totalProgress = Math.min(1, scrollProgress + dragProgress);

    const opacity = interpolate(
      totalProgress,
      [0.3, 1],
      [0, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      totalProgress,
      [0.3, 1],
      [20, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: reduceMotionEnabled ? 0 : opacity,
      transform: reduceMotionEnabled ? [] : [{ translateY }],
    };
  });

  // Blur background animation
  const blurStyle = useAnimatedStyle(() => {
    const scrollProgress = Math.max(0, -scrollY.value / 100);
    const dragProgress = dragY.value / 50;
    const totalProgress = Math.min(1, scrollProgress + dragProgress);

    const opacity = interpolate(
      totalProgress,
      [0, 1],
      [0, 0.8],
      Extrapolate.CLAMP
    );

    return {
      opacity: reduceMotionEnabled ? 0 : opacity,
    };
  });

  // Phone number animation
  const phoneStyle = useAnimatedStyle(() => {
    const scrollProgress = Math.max(0, -scrollY.value / 100);
    const dragProgress = dragY.value / 50;
    const totalProgress = Math.min(1, scrollProgress + dragProgress);

    const opacity = interpolate(
      totalProgress,
      [0.2, 1],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: reduceMotionEnabled ? 0 : opacity,
    };
  });

  const handleSetPhoto = () => {};

  const handleSetUsername = () => {};

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.header, headerHeight]}>
        {/* Blur Background */}
        <Animated.View style={[styles.blurContainer, blurStyle]}>
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Avatar */}
          <Animated.View style={[styles.avatarContainer, avatarStyle]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={AVATAR_MIN / 2} color="#8E8E93" />
              </View>
            )}
          </Animated.View>

          {/* Name */}
          <Animated.Text style={[styles.name, titleStyle]} numberOfLines={1}>
            {name}
          </Animated.Text>

          {/* Phone Number */}
          {phoneMasked && (
            <Animated.Text style={[styles.phone, phoneStyle]}>
              {phoneMasked}
            </Animated.Text>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <Animated.View style={[styles.quickActions, quickActionsStyle]}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handleSetPhoto}
                accessibilityLabel="Set Profile Photo"
                accessibilityRole="button"
              >
                <Ionicons name="camera" size={16} color="#3AABF0" />
                <Text style={styles.quickActionText}>Set Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handleSetUsername}
                accessibilityLabel="Set Username"
                accessibilityRole="button"
              >
                <Ionicons name="create" size={16} color="#3AABF0" />
                <Text style={styles.quickActionText}>Set Username</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
    overflow: 'hidden',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // Account for status bar
  },
  avatarContainer: {
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_MAX / 2,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_MAX / 2,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  phone: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 24,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  quickActionText: {
    color: '#3AABF0',
    fontSize: 14,
    fontWeight: '500',
  },
});
