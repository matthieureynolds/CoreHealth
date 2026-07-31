import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  View,
} from "react-native";

type TortoState = "idle" | "thinking" | "talking";

interface Props {
  state: TortoState;
  size?: number; // avatar size in px
}

export const TortoAvatar: React.FC<Props> = ({ state, size = 28 }) => {
  const bob = useRef(new Animated.Value(0)).current; // -1..1
  const rotate = useRef(new Animated.Value(0)).current; // -1..1
  const mouth = useRef(new Animated.Value(0)).current; // 0 closed, 1 open

  // Looping thinking animation (gentle bob + subtle tilt)
  useEffect(() => {
    let bobAnim: Animated.CompositeAnimation | null = null;
    let rotAnim: Animated.CompositeAnimation | null = null;
    let talkAnim: Animated.CompositeAnimation | null = null;

    if (state === "thinking") {
      bob.setValue(0);
      rotate.setValue(0);
      bobAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bob, {
            toValue: -1,
            duration: 700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      rotAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: -1,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      bobAnim.start();
      rotAnim.start();
      Animated.timing(mouth, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    } else if (state === "talking") {
      // Subtle mouth flapping
      talkAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(mouth, {
            toValue: 1,
            duration: 120,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(mouth, {
            toValue: 0.2,
            duration: 120,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      talkAnim.start();
      // Reset bob/rotate to neutral
      bob.stopAnimation();
      rotate.stopAnimation();
      bob.setValue(0);
      rotate.setValue(0);
    } else {
      // idle
      bob.stopAnimation?.();
      rotate.stopAnimation?.();
      Animated.timing(mouth, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
      bob.setValue(0);
      rotate.setValue(0);
    }

    return () => {
      bobAnim?.stop();
      rotAnim?.stop();
      talkAnim?.stop();
    };
  }, [state]);

  const translateY = bob.interpolate({
    inputRange: [-1, 1],
    outputRange: [-2, 2],
  });
  const rotateDeg = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-2deg", "2deg"],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        transform: [{ translateY }, { rotate: rotateDeg }],
      }}
    >
      <Animated.Image
        source={
          require("../../../../assets/images/brand/turtle.png") as ImageSourcePropType
        }
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
      />

      {/* Very small animated mouth overlay near bottom-center */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.mouth,
          {
            left: size * 0.36,
            top: size * 0.62,
            width: size * 0.22,
            height: size * 0.08,
            transform: [
              {
                scaleY: mouth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1.2],
                }),
              },
            ],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mouth: {
    position: "absolute",
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
});
