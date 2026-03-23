import { useState, useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

const CURTAIN_DURATION_MS = 17000;

interface UseCurtainRevealParams {
  selectedLocation: string;
  isLoading: boolean;
  reduceMotion: boolean;
  resultsOpacity: Animated.Value;
  getRowAnim: (key: string) => { opacity: Animated.Value; translate: Animated.Value };
}

export function useCurtainReveal({
  selectedLocation,
  isLoading,
  reduceMotion,
  resultsOpacity,
  getRowAnim,
}: UseCurtainRevealParams) {
  const [contentMeasuredHeight, setContentMeasuredHeight] = useState(0);
  const [curtainAnimationComplete, setCurtainAnimationComplete] = useState(false);
  const coverTranslate = useRef(new Animated.Value(0)).current;
  const curtainStartedRef = useRef(false);

  useEffect(() => {
    if (!selectedLocation || isLoading) return;
    const keys = ['summary','aq','water','uv','food','pollen','altitude','outbreaks','hospitals','vaccinations'];
    if (reduceMotion) {
      keys.forEach((k) => { const a = getRowAnim(k); a.opacity.setValue(1); a.translate.setValue(0); });
      return;
    }
    // Curtain reveal path
    keys.forEach((k) => { const a = getRowAnim(k); a.opacity.setValue(1); a.translate.setValue(0); });
    curtainStartedRef.current = false;
    coverTranslate.setValue(0);
    setCurtainAnimationComplete(false);
    resultsOpacity.setValue(0);
  }, [selectedLocation, isLoading, reduceMotion]);

  useEffect(() => {
    if (!selectedLocation || isLoading || reduceMotion || contentMeasuredHeight <= 0 || curtainStartedRef.current) return;
    curtainStartedRef.current = true;
    coverTranslate.setValue(0);
    Animated.timing(resultsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    Animated.timing(coverTranslate, { toValue: contentMeasuredHeight, duration: CURTAIN_DURATION_MS, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setCurtainAnimationComplete(true);
    });
  }, [contentMeasuredHeight, selectedLocation, isLoading, reduceMotion]);

  useEffect(() => {
    if (!selectedLocation || isLoading || reduceMotion || contentMeasuredHeight <= 0) return;
    const timer = setTimeout(() => {
      if (!curtainStartedRef.current) {
        curtainStartedRef.current = true;
        coverTranslate.setValue(0);
        Animated.timing(resultsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        Animated.timing(coverTranslate, { toValue: contentMeasuredHeight, duration: CURTAIN_DURATION_MS, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
          if (finished) setCurtainAnimationComplete(true);
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [contentMeasuredHeight, selectedLocation, isLoading, reduceMotion]);

  return {
    contentMeasuredHeight,
    setContentMeasuredHeight,
    curtainAnimationComplete,
    coverTranslate,
  };
}
