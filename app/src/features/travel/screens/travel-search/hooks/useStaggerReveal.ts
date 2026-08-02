import { useEffect } from "react";
import { Animated, Easing } from "react-native";

// Order in which result sections cascade in. Must match the animKeys the
// section components read via getRowAnim, or a section would stay hidden.
const REVEAL_KEYS = [
  "summary",
  "aq",
  "water",
  "uv",
  "food",
  "pollen",
  "altitude",
  "outbreaks",
  "hospitals",
  "vaccinations",
];

// Tuned for an elegant, one-card-at-a-time reveal: a clear gap between each card
// so they arrive in sequence top-to-bottom, with a longer, softer glide up.
const STAGGER_MS = 140; // gap between each section starting
const FADE_MS = 520; // opacity duration per section
const SLIDE_MS = 560; // translate duration per section
const SLIDE_FROM = 22; // px each card glides up from as it fades in

interface UseStaggerRevealParams {
  selectedLocation: string;
  isLoading: boolean;
  reduceMotion: boolean;
  resultsOpacity: Animated.Value;
  getRowAnim: (key: string) => {
    opacity: Animated.Value;
    translate: Animated.Value;
  };
}

/**
 * Reveals the result sections one after another (fade + slide up) once the
 * health data has loaded — a calm, Gemini-style cascade instead of an
 * all-at-once pop. Replaces the old airplane "curtain" reveal.
 */
export function useStaggerReveal({
  selectedLocation,
  isLoading,
  reduceMotion,
  resultsOpacity,
  getRowAnim,
}: UseStaggerRevealParams) {
  useEffect(() => {
    if (!selectedLocation || isLoading) return;

    // The container is always fully visible; the cascade happens per-section.
    resultsOpacity.setValue(1);

    if (reduceMotion) {
      REVEAL_KEYS.forEach((k) => {
        const a = getRowAnim(k);
        a.opacity.setValue(1);
        a.translate.setValue(0);
      });
      return;
    }

    // Reset every section to hidden, then cascade them in.
    REVEAL_KEYS.forEach((k) => {
      const a = getRowAnim(k);
      a.opacity.setValue(0);
      a.translate.setValue(SLIDE_FROM);
    });

    const anims = REVEAL_KEYS.map((k) => {
      const a = getRowAnim(k);
      return Animated.parallel([
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: FADE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(a.translate, {
          toValue: 0,
          duration: SLIDE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    });

    // Snap every section to fully visible — used on natural completion and on
    // cleanup so an interrupted cascade can never leave a row stuck at opacity 0
    // (which previously hid the first metric cards, e.g. Air Quality / Water).
    const revealAll = () => {
      REVEAL_KEYS.forEach((k) => {
        const a = getRowAnim(k);
        a.opacity.setValue(1);
        a.translate.setValue(0);
      });
    };

    const seq = Animated.stagger(STAGGER_MS, anims);
    seq.start(({ finished }) => {
      if (finished) revealAll();
    });
    return () => {
      seq.stop();
      revealAll();
    };
    // getRowAnim and resultsOpacity are a useCallback and an Animated.Value —
    // stable for the life of the screen. Listing them changes nothing but
    // invites a future edit to make one unstable and re-run the whole stagger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, isLoading, reduceMotion]);
}
