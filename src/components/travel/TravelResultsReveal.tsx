import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
  useAnimatedStyle,
  interpolate,
  runOnUI,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type Item = { title: string; subtitle?: string; rightScore?: string };
export type TravelResultsRevealHandle = { start: () => void };
type Props = { items: Item[]; onDone?: () => void };

const PLANE_SIZE = 26;

const Card: React.FC<{
  item: Item;
  index: number;
  planeY: Animated.SharedValue<number>;
  containerTop: Animated.SharedValue<number>;
}> = ({ item, planeY, containerTop }) => {
  const [y, setY] = useState(0);
  const onLayout = (e: any) => setY(e.nativeEvent.layout.y);

  const rStyle = useAnimatedStyle(() => {
    const triggerY = containerTop.value + y + 24;
    const opacity = interpolate(planeY.value, [triggerY - 40, triggerY + 10], [0, 1]);
    const translateY = interpolate(planeY.value, [triggerY - 40, triggerY + 10], [8, 0]);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View onLayout={onLayout} style={[styles.card, rStyle]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.cardSub}>{item.subtitle}</Text> : null}
      </View>
      {item.rightScore ? (
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{item.rightScore}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
};

const TravelResultsReveal = React.forwardRef<TravelResultsRevealHandle, Props>(
  ({ items, onDone }, ref) => {
    const planeY = useSharedValue<number>(-60);
    const containerTop = useSharedValue<number>(0);
    const containerH = useSharedValue<number>(0);
    const containerW = useSharedValue<number>(0);

    const containerRef = useRef<View>(null);

    const onContainerLayout = (e: any) => {
      containerTop.value = e.nativeEvent.layout.y;
      containerH.value = e.nativeEvent.layout.height;
      containerW.value = e.nativeEvent.layout.width;
    };

    React.useImperativeHandle(ref, () => ({
      start: () => {
        // start from vertical center of the container
        planeY.value = containerTop.value + containerH.value / 2;
        planeY.value = withDelay(
          100,
          withTiming(containerTop.value + containerH.value + 40, {
            duration: 800,
            easing: Easing.bezier(0.2, 0.7, 0.2, 1),
          }, (finished) => {
            if (finished && onDone) {
              runOnUI(() => {})();
              onDone();
            }
          }),
        );
      },
    }));

    const planeStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: containerW.value / 2 - PLANE_SIZE / 2 }, // center horizontally
        { translateY: planeY.value },
        { rotate: '180deg' }, // point south
      ],
      opacity: 1,
    }));

    return (
      <View ref={containerRef} onLayout={onContainerLayout} style={styles.container}>
        <Animated.View style={[styles.plane, planeStyle]}>
          <Ionicons name="airplane" size={PLANE_SIZE} color="#FFFFFF" />
        </Animated.View>

        <View style={{ paddingTop: 24 }}>
          {items.map((it, idx) => (
            <Card key={idx} item={it} index={idx} planeY={planeY} containerTop={containerTop} />
          ))}
        </View>
      </View>
    );
  }
);

export default TravelResultsReveal;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  plane: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cardSub: { color: '#9AA0A6', marginTop: 4, fontSize: 13 },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0f172a',
    borderRadius: 999,
  },
  scoreText: { color: '#FFFFFF', fontWeight: '700' },
});


