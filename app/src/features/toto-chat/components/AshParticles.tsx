import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

interface AshParticlesProps {
  visible: boolean;
  onComplete: () => void;
}

export const AshParticles: React.FC<AshParticlesProps> = ({ visible, onComplete }) => {
  const particlesRef = useRef<Animated.Value[]>([]);
  const [particles, setParticles] = useState<Array<{
    id: number;
    startX: number;
    startY: number;
    randomX: number;
    randomY: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (visible) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        startX: Math.random() * 180 - 90,
        startY: Math.random() * 30 - 15,
        randomX: (Math.random() - 0.5) * 180,
        randomY: -140 - Math.random() * 100,
        delay: Math.random() * 200,
      }));
      setParticles(newParticles);
      particlesRef.current = newParticles.map(() => new Animated.Value(0));

      const animations = newParticles.map((particle, index) =>
        Animated.timing(particlesRef.current[index], {
          toValue: 1,
          duration: 1400 + particle.delay,
          delay: particle.delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );

      Animated.parallel(animations).start(() => {
        onComplete();
      });
    } else {
      particlesRef.current = [];
      setParticles([]);
    }
  }, [visible]);

  if (!visible || particles.length === 0) return null;

  return (
    <View style={styles.ashContainer} pointerEvents="none">
      {particles.map((particle, index) => {
        const opacity = particlesRef.current[index]?.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [1, 0.8, 0],
        });
        const translateX = particlesRef.current[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [particle.startX, particle.startX + particle.randomX],
        });
        const translateY = particlesRef.current[index]?.interpolate({
          inputRange: [0, 1],
          outputRange: [particle.startY, particle.startY + particle.randomY],
        });
        const scale = particlesRef.current[index]?.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.8, 0.3],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.ashParticle,
              { opacity, transform: [{ translateX }, { translateY }, { scale }] },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  ashContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ashParticle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#6E6E73',
    shadowColor: '#6E6E73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
});
