import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const healthFacts = [
  "💧 Drinking water first thing in the morning kickstarts your metabolism",
  "🏃‍♂️ Just 30 minutes of daily exercise can reduce heart disease risk by 30%",
  "😴 Getting 7-9 hours of sleep helps your body repair and regenerate cells",
  "🥗 Eating a rainbow of fruits and vegetables provides diverse nutrients",
  "🧘‍♀️ Meditation for just 10 minutes daily can reduce stress and anxiety",
  "🌞 Sunlight exposure helps regulate your circadian rhythm and mood",
  "💚 Laughing releases endorphins and strengthens your immune system",
  "🚶‍♂️ Walking 10,000 steps daily can improve cardiovascular health",
  "🧠 Regular mental exercises keep your brain sharp and healthy",
  "🍎 An apple a day provides fiber, vitamin C, and antioxidants",
  "💪 Strength training twice a week builds muscle and bone density",
  "🌿 Spending time in nature reduces cortisol and boosts mood",
  "🥤 Staying hydrated improves cognitive function and energy levels",
  "🧘‍♂️ Deep breathing exercises can lower blood pressure naturally",
  "🥑 Healthy fats from avocados and nuts support brain function",
];

interface LoadingScreenProps {
  visible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Start fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation for logo
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      // Cycle through health facts
      const factInterval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % healthFacts.length);
      }, 3000);

      return () => {
        clearInterval(factInterval);
        pulseAnimation.stop();
      };
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* TOTO Logo with Animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={require("../../../../assets/images/brand/logo-loading.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Heart Loading Animation - Removed */}
        </Animated.View>

        {/* App Name - Removed */}

        {/* Health Fact */}
        <Animated.View style={[styles.factContainer, { opacity: fadeAnim }]}>
          <Text style={styles.factText}>{healthFacts[currentFactIndex]}</Text>
        </Animated.View>

        {/* Loading Dots */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    zIndex: 9999,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 30,
  },
  logo: {
    width: 200, // Made even bigger
    height: 200, // Made even bigger
  },
  factContainer: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    minHeight: 80,
    justifyContent: "center",
  },
  factText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3AABF0",
    marginHorizontal: 4,
  },
});

export default LoadingScreen;
