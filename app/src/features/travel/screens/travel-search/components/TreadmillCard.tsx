import React, { useRef, useState, useCallback } from 'react';
import { Animated, ViewStyle, LayoutChangeEvent } from 'react-native';

/**
 * Treadmill / stair-stepper effect.
 * As the user scrolls, each card folds flat on its X-axis and fades out
 * as it reaches the top of the viewport — like a step folding back on a
 * stair-stepper machine.
 *
 * Uses the scroll content container ref to measure each card's Y offset
 * within the scrollable area, then builds Animated interpolations from
 * the shared scrollY value.
 */

const FOLD_START_OFFSET = 0;   // start folding when card reaches this Y in scroll viewport
const FOLD_DISTANCE = 90;      // px to go from fully visible → fully folded

interface TreadmillCardProps {
  scrollY: Animated.Value;
  scrollContentRef: React.RefObject<any>;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const TreadmillCard: React.FC<TreadmillCardProps> = ({
  scrollY,
  scrollContentRef,
  children,
  style,
}) => {
  const cardRef = useRef<any>(null);
  const [cardOffsetY, setCardOffsetY] = useState<number | null>(null);

  const handleLayout = useCallback((_e: LayoutChangeEvent) => {
    // Measure this card's position relative to the scroll content container
    if (cardRef.current && scrollContentRef.current) {
      try {
        cardRef.current.measureLayout(
          scrollContentRef.current,
          (_x: number, y: number) => {
            setCardOffsetY(y);
          },
          () => {
            // measureLayout failed — fall back silently (no effect applied)
          },
        );
      } catch {
        // measureLayout not supported — no effect
      }
    }
  }, [scrollContentRef]);

  // Build animated style only once we know the card's position
  let animatedStyle: any = {};
  if (cardOffsetY !== null) {
    // Card enters fold zone when: scrollY > cardOffsetY - FOLD_START_OFFSET
    // Card is fully folded when:  scrollY > cardOffsetY - FOLD_START_OFFSET + FOLD_DISTANCE
    const foldBegin = cardOffsetY - FOLD_START_OFFSET;
    const foldEnd = foldBegin + FOLD_DISTANCE;

    animatedStyle = {
      opacity: scrollY.interpolate({
        inputRange: [foldBegin, foldEnd],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      }),
      transform: [
        { perspective: 800 },
        {
          rotateX: scrollY.interpolate({
            inputRange: [foldBegin, foldEnd],
            outputRange: ['0deg', '90deg'],
            extrapolate: 'clamp',
          }),
        },
        {
          scaleY: scrollY.interpolate({
            inputRange: [foldBegin, foldEnd],
            outputRange: [1, 0.7],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  }

  return (
    <Animated.View
      ref={cardRef}
      onLayout={handleLayout}
      style={[{ transformOrigin: 'center top' } as any, style, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};

export default TreadmillCard;
