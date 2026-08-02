import { useRef, useCallback } from "react";
import { Animated } from "react-native";
import type PagerView from "react-native-pager-view";

/**
 * Animated values and refs for the travel screen.
 *
 * All stable for the life of the screen, which is the point: they are passed
 * into memoised children, so any of them changing identity would defeat the
 * memoisation the render-performance work put in.
 */
export function useTravelAnimations() {
  const pagerRef = useRef<PagerView>(null);
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslateY = useRef(new Animated.Value(0)).current;
  const tripModalTranslateY = useRef(new Animated.Value(1000)).current;
  const rowAnimsRef = useRef<
    Record<string, { opacity: Animated.Value; translate: Animated.Value }>
  >({});

  // Stable identity: it only touches a ref, and it is passed as a prop into
  // memoised children, which would re-render on every parent render otherwise.
  const getRowAnim = useCallback((key: string) => {
    if (!rowAnimsRef.current[key]) {
      rowAnimsRef.current[key] = {
        opacity: new Animated.Value(0),
        translate: new Animated.Value(12),
      };
    }
    return rowAnimsRef.current[key];
  }, []);

  return {
    pagerRef,
    resultsOpacity,
    resultsTranslateY,
    tripModalTranslateY,
    getRowAnim,
  };
}
