import React from "react";
import { AccessibilityInfo } from "react-native";

export async function shouldReduceMotion(): Promise<boolean> {
  try {
    const enabled = await AccessibilityInfo.isReduceMotionEnabled();
    return !!enabled;
  } catch {
    return false;
  }
}

export function useReduceMotion() {
  const [shouldReduce, setShouldReduce] = React.useState(false);

  React.useEffect(() => {
    shouldReduceMotion().then(setShouldReduce);
  }, []);

  return shouldReduce;
}
