import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  runOnJS 
} from 'react-native-reanimated';

type Props = { 
  clientId: string; 
  text: string; 
  onFinished: () => void;
  startRect: { x: number; y: number; w: number; h: number };
  endRect: { x: number; y: number; w: number; h: number };
};

export const AnimatedOutgoing: React.FC<Props> = ({ 
  text, 
  onFinished, 
  startRect, 
  endRect 
}) => {
  const x = useSharedValue(startRect.x);
  const y = useSharedValue(startRect.y);
  const scale = useSharedValue(0.98);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const duration = 240;
    const ease = Easing.bezier(0.22, 1, 0.36, 1);
    
    x.value = withTiming(endRect.x, { duration, easing: ease });
    y.value = withTiming(endRect.y, { duration, easing: ease }, () => runOnJS(onFinished)());
    scale.value = withTiming(1, { duration, easing: ease });
    opacity.value = withTiming(1, { duration, easing: ease });
  }, [endRect.x, endRect.y, onFinished]);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    zIndex: 1000, // Ensure it's above other elements
  }));

  return (
    <Animated.View style={[animatedStyle, styles.ghostBubble]}>
      <Text style={styles.ghostText}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ghostBubble: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ghostText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
  },
});
