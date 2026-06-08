import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AnimatedProgressCircle from './components/AnimatedProgressCircle';
import { AnimatedScoreText, AnimatedScoreLabel } from './components/AnimatedScoreDisplay';

const { width } = Dimensions.get('window');

interface HeroHealthScoreProps {
  score: number;
  onPress?: () => void;
}

const HeroHealthScore: React.FC<HeroHealthScoreProps> = ({ score, onPress }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const animatedScore = useRef(new Animated.Value(0)).current;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const circleSize = Math.min(width * 0.45, 180);
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

  const easeOutTick = (t: number): number => {
    if (t < 0.7) {
      return easeOutCubic(t / 0.7) * 0.7;
    } else {
      const remaining = (t - 0.7) / 0.3;
      return 0.7 + remaining * remaining * remaining * 0.3;
    }
  };

  const displayScore = Math.max(1, Math.min(100, Number(score) || 82));

  useEffect(() => {
    const safe = displayScore;
    if (!hasAnimated) {
      let frameId: number;
      let mounted = true;

      const timer = setTimeout(() => {
        animatedScore.setValue(1);
        animatedProgress.setValue(1 / 100);

        const duration = 3000;
        const startTime = Date.now();

        const animate = () => {
          if (!mounted) return;
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutTick(progress);

          const currentScore = Math.max(1, Math.floor(1 + easedProgress * (safe - 1)));
          animatedScore.setValue(currentScore);

          const currentProgress = (1 + easedProgress * (safe - 1)) / 100;
          animatedProgress.setValue(Math.max(0.01, Math.min(currentProgress, 1)));

          if (progress < 1) {
            frameId = requestAnimationFrame(animate);
          } else {
            animatedScore.setValue(safe);
            animatedProgress.setValue(Math.max(0, Math.min(safe, 100)) / 100);
            setHasAnimated(true);
          }
        };

        frameId = requestAnimationFrame(animate);
      }, 1300);

      return () => {
        mounted = false;
        clearTimeout(timer);
        cancelAnimationFrame(frameId);
      };
    } else {
      animatedScore.setValue(safe);
      animatedProgress.setValue(Math.max(0, Math.min(safe, 100)) / 100);
    }
  }, [displayScore, hasAnimated]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.scoreContainer}>
        <View style={[styles.circleWrapper, { width: circleSize, height: circleSize }]}>
          <Svg width={circleSize} height={circleSize} style={styles.svg}>
            <Circle
              stroke="#2C2C2E"
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <AnimatedProgressCircle
              animatedProgress={animatedProgress}
              animatedScore={animatedScore}
              circumference={circumference}
              circleSize={circleSize}
              radius={radius}
              strokeWidth={strokeWidth}
            />
          </Svg>

          <View style={styles.scoreContent}>
            <Text style={styles.brandText}>COREHEALTH</Text>
            <AnimatedScoreText animatedScore={animatedScore} />
            <AnimatedScoreLabel animatedScore={animatedScore} />
            <Text style={styles.scoreSubtitle}>HEALTH SCORE</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scoreContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  scoreSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
});

export default HeroHealthScore;
