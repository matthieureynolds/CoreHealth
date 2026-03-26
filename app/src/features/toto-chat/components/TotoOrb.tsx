import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export type OrbState = 'idle' | 'thinking' | 'streaming';

interface Props {
  state: OrbState;
  size?: number;
}

export const TotoOrb: React.FC<Props> = ({ state, size = 40 }) => {
  const breathe = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    breathe.stopAnimation();
    pulse1.stopAnimation();
    pulse2.stopAnimation();
    ringRotate.stopAnimation();
    ringOpacity.stopAnimation();

    if (state === 'idle') {
      ringOpacity.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    } else if (state === 'thinking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(ringOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.loop(
        Animated.timing(ringRotate, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else if (state === 'streaming') {
      ringOpacity.setValue(0);
      const rippleLoop = (anim: Animated.Value, delay: number) => {
        anim.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 1300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        ).start();
      };
      rippleLoop(pulse1, 0);
      rippleLoop(pulse2, 650);
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0.35, duration: 380, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [state]);

  const coreScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const rotateDeg = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r1Scale = pulse1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const r1Opacity = pulse1.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.55, 0.25, 0] });
  const r2Scale = pulse2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const r2Opacity = pulse2.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.55, 0.25, 0] });

  const containerSize = size * 2.6;

  return (
    <View style={{ width: containerSize, height: containerSize, alignItems: 'center', justifyContent: 'center' }}>
      {/* Ripple rings — streaming */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size, height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: '#3AABF0',
          transform: [{ scale: r1Scale }],
          opacity: r1Opacity,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: size, height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: '#3AABF0',
          transform: [{ scale: r2Scale }],
          opacity: r2Opacity,
        }}
      />

      {/* Rotating outer ring — thinking */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size + 10,
          height: size + 10,
          borderRadius: (size + 10) / 2,
          borderWidth: 1.5,
          borderColor: 'rgba(0, 122, 255, 0.45)',
          borderTopColor: 'rgba(0, 122, 255, 0)',
          borderRightColor: 'rgba(0, 122, 255, 0)',
          transform: [{ rotate: rotateDeg }],
          opacity: ringOpacity,
        }}
      />

      {/* Core orb */}
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#3AABF0',
          transform: [{ scale: coreScale }],
          shadowColor: '#3AABF0',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.75,
          shadowRadius: 14,
          elevation: 10,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Specular highlight */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.1,
            left: size * 0.14,
            width: size * 0.38,
            height: size * 0.22,
            borderRadius: size * 0.12,
            backgroundColor: 'rgba(255, 255, 255, 0.38)',
            transform: [{ rotate: '-20deg' }],
          }}
        />
        {/* Lower subtle tint */}
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.08,
            right: size * 0.1,
            width: size * 0.25,
            height: size * 0.15,
            borderRadius: size * 0.08,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
        />
      </Animated.View>
    </View>
  );
};
