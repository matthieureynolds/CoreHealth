import React, { useRef } from "react";
import {
  Animated,
  Easing,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from "react-native";

interface PressPopProps extends TouchableOpacityProps {
  /** Style applied to the touchable (the card). */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * A touchable that briefly "pops" — scales up then settles with one soft
 * bounce — every time it's pressed, mirroring the iOS lock-screen keypad feel.
 * Fires on press-in, so it pops on every tap (even rapid repeats).
 */
const PressPop: React.FC<PressPopProps> = ({
  style,
  children,
  onPressIn,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    scale.stopAnimation();
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.04,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // friction 7 = a single soft overshoot, then settle (no second bounce).
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        {...rest}
        style={style}
        onPressIn={(e) => {
          pulse();
          onPressIn?.(e);
        }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default PressPop;
