import React from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { BlurView } from "expo-blur";

interface StickyHeaderProps {
  stickyHeaderOpacity: Animated.AnimatedInterpolation<number>;
  stickyHeaderTranslateY: Animated.AnimatedInterpolation<number>;
  headerBgOpacity: Animated.AnimatedInterpolation<number>;
  isHeaderVisible: boolean;
  userName: string;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
  stickyHeaderOpacity,
  stickyHeaderTranslateY,
  headerBgOpacity,
  isHeaderVisible,
  userName,
}) => (
  <View
    style={styles.stickyHeader}
    pointerEvents={isHeaderVisible ? "auto" : "none"}
  >
    <Animated.View
      style={[styles.stickyHeaderBackground, { opacity: headerBgOpacity }]}
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
    </Animated.View>
    <Animated.View
      style={[
        styles.stickyHeaderContent,
        {
          opacity: stickyHeaderOpacity,
          transform: [{ translateY: stickyHeaderTranslateY }],
        },
      ]}
    >
      <Text style={styles.stickyHeaderName} numberOfLines={1}>
        {userName}
      </Text>
    </Animated.View>
  </View>
);

const styles = StyleSheet.create({
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingBottom: 16,
    minHeight: Platform.OS === "ios" ? 96 : 72,
  },
  stickyHeaderBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  stickyHeaderContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 18,
  },
  stickyHeaderName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default StickyHeader;
