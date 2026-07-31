import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { Animated } from "react-native";

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#30D158";
  if (score >= 65) return "#32D74B";
  if (score >= 50) return "#FF9F0A";
  if (score >= 35) return "#FF6B35";
  return "#FF3B30";
};

interface AnimatedScoreTextProps {
  animatedScore: Animated.Value;
}

export const AnimatedScoreText: React.FC<AnimatedScoreTextProps> = ({
  animatedScore,
}) => {
  const [displayScore, setDisplayScore] = useState(1);
  const [currentColor, setCurrentColor] = useState("#FF3B30");

  useEffect(() => {
    const listener = animatedScore.addListener(({ value }) => {
      const roundedScore = Math.round(value);
      setDisplayScore((prev) =>
        roundedScore >= 1 ? Math.max(1, roundedScore) : prev,
      );
      setCurrentColor(getScoreColor(roundedScore >= 1 ? roundedScore : 1));
    });
    return () => {
      animatedScore.removeListener(listener);
    };
  }, [animatedScore]);

  return (
    <Text style={[styles.scoreValue, { color: currentColor }]}>
      {displayScore}
    </Text>
  );
};

interface AnimatedScoreLabelProps {
  animatedScore: Animated.Value;
}

export const AnimatedScoreLabel: React.FC<AnimatedScoreLabelProps> = ({
  animatedScore,
}) => {
  const [currentColor, setCurrentColor] = useState("#FF3B30");

  useEffect(() => {
    const listener = animatedScore.addListener(({ value }) => {
      setCurrentColor(getScoreColor(Math.round(value)));
    });
    return () => {
      animatedScore.removeListener(listener);
    };
  }, [animatedScore]);

  return (
    <Text style={[styles.scoreLabel, { color: currentColor }]}>
      Sleep & HRV
    </Text>
  );
};

const styles = StyleSheet.create({
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    lineHeight: 48,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 2,
  },
});
