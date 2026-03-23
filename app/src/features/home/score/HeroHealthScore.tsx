import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface HeroHealthScoreProps {
  score: number;
  onPress?: () => void;
}

const HeroHealthScore: React.FC<HeroHealthScoreProps> = ({ 
  score, 
  onPress 
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const animatedScore = useRef(new Animated.Value(0)).current;
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  // Use consistent, responsive sizing
  const circleSize = Math.min(width * 0.45, 180); // Max 180px, responsive to screen
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Custom easing function for faster start, much slower finish
  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // More dramatic easing that really slows down at the end
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Custom easing that creates a ticking effect near the end
  const easeOutTick = (t: number): number => {
    if (t < 0.7) {
      // Fast progress for first 70%
      return easeOutCubic(t / 0.7) * 0.7;
    } else {
      // Very slow ticking for last 30%
      const remaining = (t - 0.7) / 0.3;
      return 0.7 + (remaining * remaining * remaining) * 0.3;
    }
  };

  // Never show 0: use a safe number so we never set animated value to 0 or NaN (which can show as 0)
  const displayScore = Math.max(1, Math.min(100, Number(score) || 82));

  // Animation effect - only run once when component mounts, with delay for supporting rings
  useEffect(() => {
    const safe = displayScore; // always 1–100, never NaN
    if (!hasAnimated) {
      // Wait for supporting rings to finish (1200ms) then start main score animation
      const timer = setTimeout(() => {
        // Start from 1 so we never show 0 at the start
        animatedScore.setValue(1);
        animatedProgress.setValue(1 / 100);

        // Custom animation with dramatic slowing effect
        const duration = 3000;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Apply custom easing that slows down dramatically near the end
          const easedProgress = easeOutTick(progress);
          
          // Update score (never show 0: interpolate from 1 to safe)
          const currentScore = Math.max(1, Math.floor(1 + easedProgress * (safe - 1)));
          animatedScore.setValue(currentScore);
          
          // Update progress ring
          const currentProgress = (1 + easedProgress * (safe - 1)) / 100;
          animatedProgress.setValue(Math.max(0.01, Math.min(currentProgress, 1)));
          
          if (progress < 1) {
            // Continue animation
            requestAnimationFrame(animate);
          } else {
            // Animation complete – always set to safe value so we never show 0
            animatedScore.setValue(safe);
            animatedProgress.setValue(Math.max(0, Math.min(safe, 100)) / 100);
            setHasAnimated(true);
          }
        };
        
        // Start the custom animation
        requestAnimationFrame(animate);
      }, 1300); // Start 100ms after supporting rings finish

      return () => clearTimeout(timer);
    } else {
      // If already animated, only update if we have a valid score – never set to 0 or NaN
      animatedScore.setValue(safe);
      animatedProgress.setValue(Math.max(0, Math.min(safe, 100)) / 100);
    }
  }, [displayScore, hasAnimated]);


  const strokeDasharray = circumference;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#30D158'; // Green - Excellent
    if (score >= 65) return '#32D74B'; // Light Green - Good  
    if (score >= 50) return '#FF9F0A'; // Orange - Fair
    if (score >= 35) return '#FF6B35'; // Red Orange - Poor
    return '#FF3B30'; // Red - Critical
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Sleep & HRV';
    if (score >= 65) return 'Sleep & HRV';
    if (score >= 50) return 'Sleep & HRV';
    if (score >= 35) return 'Sleep & HRV';
    return 'Sleep & HRV';
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 80) return 'You\'re in the top 15% of users. Your health metrics are exceptional and you\'re maintaining excellent habits.';
    if (score >= 65) return 'You\'re in the top 35% of users. Your health is good with room for improvement in specific areas.';
    if (score >= 50) return 'You\'re in the middle 50% of users. Focus on improving sleep, activity, and stress management.';
    if (score >= 35) return 'You\'re in the bottom 25% of users. Consider consulting with healthcare professionals for guidance.';
    return 'You\'re in the bottom 10% of users. Immediate attention to health habits is recommended.';
  };

  const getComparisonText = (score: number): string => {
    if (score >= 80) return 'Top 15%';
    if (score >= 65) return 'Top 35%';
    if (score >= 50) return 'Top 50%';
    if (score >= 35) return 'Top 75%';
    return 'Top 90%';
  };

  const getPercentile = (score: number): number => {
    if (score >= 80) return 85; // Top 15%
    if (score >= 65) return 65; // Top 35%
    if (score >= 50) return 50; // Top 50%
    if (score >= 35) return 25; // Top 75%
    return 10; // Top 90%
  };

  const renderDistributionCurve = () => {
    const chartWidth = 280;
    const chartHeight = 120;
    const padding = 20;
    const curveWidth = chartWidth - (padding * 2);
    const curveHeight = chartHeight - (padding * 2);
    
    // Bell curve parameters
    const mean = 50; // Center of distribution
    const stdDev = 15; // Standard deviation
    const userPercentile = getPercentile(score);
    const userPosition = (userPercentile / 100) * curveWidth;
    
    // Generate bell curve points
    const points = [];
    for (let x = 0; x <= curveWidth; x += 2) {
      const normalizedX = (x / curveWidth) * 100; // Convert to 0-100 scale
      const y = Math.exp(-0.5 * Math.pow((normalizedX - mean) / stdDev, 2));
      const chartY = curveHeight - (y * curveHeight * 0.8) - 10; // Scale and position
      points.push(`${x + padding},${chartY}`);
    }
    
    const pathData = `M ${points.join(' L ')}`;

    // Full area under curve (green fill)
    const fullAreaPath = `M ${padding},${curveHeight - 10} L ${points.join(' L ')} L ${curveWidth + padding},${curveHeight - 10} Z`;

    // Compute user's y position for marker/label
    const userNormalizedX = (userPosition / curveWidth) * 100;
    const userYVal = Math.exp(-0.5 * Math.pow((userNormalizedX - mean) / stdDev, 2));
    const userChartY = curveHeight - (userYVal * curveHeight * 0.8) - 10;
    
    return (
      <View style={styles.distributionContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#0A7E33" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#0A7E33" stopOpacity="0.08" />
            </LinearGradient>
          </Defs>
          
          {/* Filled area under curve */}
          <Path
            d={fullAreaPath}
            fill="url(#areaGradient)"
          />

          {/* Bell curve line */}
          <Path
            d={pathData}
            stroke="#8E8E93"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Mean dashed line */}
          <Path
            d={`M ${padding + curveWidth/2},${padding} L ${padding + curveWidth/2},${curveHeight - 10}`}
            stroke="#8E8E93"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />

          {/* User percentile vertical dashed line */}
          <Path
            d={`M ${userPosition + padding},${padding} L ${userPosition + padding},${curveHeight - 10}`}
            stroke="#FF9500"
            strokeWidth="2"
            strokeDasharray="4,6"
            opacity="0.9"
          />

          {/* User position marker */}
          <Circle
            cx={userPosition + padding}
            cy={userChartY}
            r="4"
            fill="#FF9500"
            stroke="#FFFFFF"
            strokeWidth="2"
          />

          {/* Score label near marker */}
          <SvgText
            x={Math.min(userPosition + padding + 10, curveWidth + padding - 60)}
            y={Math.max(userChartY - 100, padding + 12)}
            fontSize="14"
            fill="#FFFFFF"
            fontWeight="bold"
          >
            {`Score: ${score}`}
          </SvgText>
          
          {/* X-axis labels */}
          <SvgText x={padding} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="start">0</SvgText>
          <SvgText x={padding + curveWidth/2} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="middle">50</SvgText>
          <SvgText x={padding + curveWidth} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="end">100</SvgText>
        </Svg>
        
        {/* Legend */}
        <View style={styles.distributionLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8E8E93' }]} />
            <Text style={styles.legendText}>Mean</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>{userPercentile}th percentile</Text>
          </View>
        </View>
      </View>
    );
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  const handlePress = () => {
    onPress?.();
  };

  // Create animated text component for the score with dynamic color
  const AnimatedScoreText = () => {
    // Start at 1 so we never show 0; listener will update as animation runs
    const [displayScore, setDisplayScore] = useState(1);
    const [currentColor, setCurrentColor] = useState('#FF3B30'); // Start with red
    
    useEffect(() => {
      const listener = animatedScore.addListener(({ value }) => {
        const roundedScore = Math.round(value);
        // Never show 0 – if value is 0 or negative, keep previous value so score doesn't "reset" to 0
        setDisplayScore((prev) => (roundedScore >= 1 ? Math.max(1, roundedScore) : prev));
        setCurrentColor(getScoreColor(roundedScore >= 1 ? roundedScore : 1));
      });
      
      return () => {
        animatedScore.removeListener(listener);
      };
    }, []);

    return (
      <Text style={[styles.scoreValue, { color: currentColor }]}>
        {displayScore}
      </Text>
    );
  };

  // Create animated score label with dynamic color
  const AnimatedScoreLabel = () => {
    const [currentLabel, setCurrentLabel] = useState('CRITICAL');
    const [currentColor, setCurrentColor] = useState('#FF3B30'); // Start with red
    
    useEffect(() => {
      const listener = animatedScore.addListener(({ value }) => {
        const roundedScore = Math.round(value);
        // Update label and color based on current animated score
        setCurrentLabel(getScoreLabel(roundedScore));
        setCurrentColor(getScoreColor(roundedScore));
      });
      
      return () => {
        animatedScore.removeListener(listener);
      };
    }, []);

    return (
      <Text style={[styles.scoreLabel, { color: currentColor }]}>
        {currentLabel}
      </Text>
    );
  };

  // Create animated progress circle with dynamic color
  const AnimatedProgressCircle = () => {
    const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);
    const [currentColor, setCurrentColor] = useState('#FF3B30'); // Start with red
    
    useEffect(() => {
      const listener = animatedProgress.addListener(({ value }) => {
        setStrokeDashoffset(circumference * (1 - value));
      });
      
      return () => {
        animatedProgress.removeListener(listener);
      };
    }, []);

    useEffect(() => {
      const listener = animatedScore.addListener(({ value }) => {
        const roundedScore = Math.round(value);
        // Update color based on current animated score
        setCurrentColor(getScoreColor(roundedScore));
      });
      
      return () => {
        animatedScore.removeListener(listener);
      };
    }, []);

    return (
      <Circle
        stroke={currentColor}
        fill="none"
        cx={circleSize / 2}
        cy={circleSize / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
      />
    );
  };

  return (
    <>
    <TouchableOpacity 
      style={styles.container} 
        onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.scoreContainer}>
        <View style={[styles.circleWrapper, { width: circleSize, height: circleSize }]}>
          <Svg 
            width={circleSize} 
            height={circleSize} 
            style={styles.svg}
          >
            {/* Background circle */}
            <Circle
              stroke="#2C2C2E"
              fill="none"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <AnimatedProgressCircle />
            </Svg>
            
            <View style={styles.scoreContent}>
              <Text style={styles.brandText}>COREHEALTH</Text>
              <AnimatedScoreText />
              <AnimatedScoreLabel />
              <Text style={styles.scoreSubtitle}>HEALTH SCORE</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
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
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 48,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  scoreSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
});

export default HeroHealthScore; 