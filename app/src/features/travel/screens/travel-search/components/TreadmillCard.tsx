import React, { useRef, useState, useCallback, useEffect } from "react";
import { Animated, View, ViewStyle, LayoutChangeEvent } from "react-native";

/**
 * Treadmill / stair-stepper effect.
 * As the user scrolls, each card folds flat on its X-axis and fades out
 * as it reaches the top of the viewport — like a step folding back on a
 * stair-stepper machine.
 *
 * Uses measureInWindow on both the card and the scroll content container
 * to reliably compute offset regardless of Animated.View ancestors.
 */

/**
 * `transformOrigin` is a valid RN style but is missing from ViewStyle in this
 * RN version, so it is declared once here rather than cast at the use site.
 */
const TRANSFORM_ORIGIN_TOP = {
  transformOrigin: "center top",
} as unknown as ViewStyle;

const FOLD_START_OFFSET = 0; // start folding when card reaches this Y in scroll viewport
const FOLD_DISTANCE = 90; // px to go from fully visible → fully folded

interface TreadmillCardProps {
  scrollY: Animated.Value;
  scrollContentRef: React.RefObject<View | null>;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const TreadmillCard: React.FC<TreadmillCardProps> = ({
  scrollY,
  scrollContentRef,
  children,
  style,
}) => {
  const cardRef = useRef<View>(null);
  const [cardOffsetY, setCardOffsetY] = useState<number | null>(null);
  // Keep a JS-side mirror of the current scroll value for measurement
  const scrollYValue = useRef(0);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      scrollYValue.current = value;
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const handleLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      // Use measureInWindow on both views — works reliably through Animated.View ancestors
      requestAnimationFrame(() => {
        // Captured before the async measure callbacks: the guard above cannot
        // narrow `.current` inside them, and either ref may be torn down while
        // the measurement is in flight.
        const card = cardRef.current;
        const content = scrollContentRef.current;
        if (!card || !content) return;
        card.measureInWindow((_cx: number, cardWindowY: number) => {
          if (cardWindowY === undefined) return;
          content.measureInWindow((_sx: number, contentWindowY: number) => {
            if (contentWindowY === undefined) return;
            // Card's Y in scroll content = window-relative difference + current scroll offset
            const offset = cardWindowY - contentWindowY + scrollYValue.current;
            setCardOffsetY(offset);
          });
        });
      });
    },
    [scrollContentRef],
  );

  // Build animated style only once we know the card's position
  let animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {};
  if (cardOffsetY !== null) {
    // Card enters fold zone when: scrollY > cardOffsetY - FOLD_START_OFFSET
    // Card is fully folded when:  scrollY > cardOffsetY - FOLD_START_OFFSET + FOLD_DISTANCE
    const foldBegin = cardOffsetY - FOLD_START_OFFSET;
    const foldEnd = foldBegin + FOLD_DISTANCE;

    animatedStyle = {
      opacity: scrollY.interpolate({
        inputRange: [foldBegin, foldEnd],
        outputRange: [1, 0],
        extrapolate: "clamp",
      }),
      transform: [
        { perspective: 800 },
        {
          rotateX: scrollY.interpolate({
            inputRange: [foldBegin, foldEnd],
            outputRange: ["0deg", "90deg"],
            extrapolate: "clamp",
          }),
        },
        {
          scaleY: scrollY.interpolate({
            inputRange: [foldBegin, foldEnd],
            outputRange: [1, 0.7],
            extrapolate: "clamp",
          }),
        },
      ],
    };
  }

  return (
    <Animated.View
      ref={cardRef}
      onLayout={handleLayout}
      style={[TRANSFORM_ORIGIN_TOP, style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};

export default TreadmillCard;
