import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onComplete: () => void;
}

const { width, height } = Dimensions.get("window");

const FinishOnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start celebration animation
    Animated.sequence([
      // Confetti animation
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Checkmark animation
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Text animation
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFinish = () => {
    onComplete();
  };

  const ConfettiPiece = ({
    delay,
    left,
    color,
  }: {
    delay: number;
    left: number;
    color: string;
  }) => {
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 2000,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.confettiPiece,
          {
            left,
            backgroundColor: color,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, height + 50],
                }),
              },
              {
                rotate: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
            opacity: confettiAnim,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Confetti Animation */}
      <View style={styles.confettiContainer}>
        {[...Array(20)].map((_, index) => (
          <ConfettiPiece
            key={index}
            delay={index * 100}
            left={Math.random() * width}
            color={
              ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][index % 5]
            }
          />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [
                {
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1],
                  }),
                },
              ],
              opacity: checkmarkAnim,
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={120} color="#34C759" />
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            TOTO is now monitoring your health—stay in control.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Go to Dashboard</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confettiPiece: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 2,
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: "#3AABF0",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 200,
    justifyContent: "center",
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default FinishOnboardingScreen;
