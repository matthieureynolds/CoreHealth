import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TwitterLoadingIndicatorProps {
  visible: boolean;
  text?: string;
}

const TwitterLoadingIndicator: React.FC<TwitterLoadingIndicatorProps> = ({ 
  visible, 
  text = "Loading..." 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Scale up animation
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Continuous rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        rotateAnimation.stop();
      };
    } else {
      // Fade out animation
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, spinValue, scaleValue, opacityValue]);

  if (!visible) return null;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        }
      ]}
    >
      <View style={styles.loadingContainer}>
        <Animated.View 
          style={[
            styles.spinner,
            {
              transform: [{ rotate: spin }],
            }
          ]}
        >
          <View style={styles.spinnerInner} />
        </Animated.View>
        <Text style={styles.loadingText}>{text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    marginBottom: 16,
  },
  spinnerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#1DA1F2', // Twitter blue
    borderRightColor: '#1DA1F2',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TwitterLoadingIndicator;
