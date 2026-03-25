import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { Circle } from 'react-native-svg';

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#30D158';
  if (score >= 65) return '#32D74B';
  if (score >= 50) return '#FF9F0A';
  if (score >= 35) return '#FF6B35';
  return '#FF3B30';
};

interface AnimatedProgressCircleProps {
  animatedProgress: Animated.Value;
  animatedScore: Animated.Value;
  circumference: number;
  circleSize: number;
  radius: number;
  strokeWidth: number;
}

const AnimatedProgressCircle: React.FC<AnimatedProgressCircleProps> = ({
  animatedProgress,
  animatedScore,
  circumference,
  circleSize,
  radius,
  strokeWidth,
}) => {
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);
  const [currentColor, setCurrentColor] = useState('#FF3B30');

  useEffect(() => {
    const listener = animatedProgress.addListener(({ value }) => {
      setStrokeDashoffset(circumference * (1 - value));
    });
    return () => { animatedProgress.removeListener(listener); };
  }, [animatedProgress, circumference]);

  useEffect(() => {
    const listener = animatedScore.addListener(({ value }) => {
      setCurrentColor(getScoreColor(Math.round(value)));
    });
    return () => { animatedScore.removeListener(listener); };
  }, [animatedScore]);

  return (
    <Circle
      stroke={currentColor}
      fill="none"
      cx={circleSize / 2}
      cy={circleSize / 2}
      r={radius}
      strokeWidth={strokeWidth}
      strokeDasharray={circumference}
      strokeDashoffset={strokeDashoffset}
      strokeLinecap="round"
      transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
    />
  );
};

export default AnimatedProgressCircle;
