import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AVATAR_LARGE } from "../useProfileDetails";

interface ScrollableProfileHeaderProps {
  largeNameOpacity: Animated.AnimatedInterpolation<number>;
  largeNameTranslateY: Animated.AnimatedInterpolation<number>;
  userName: string;
  profileCompletion: number;
}

const ScrollableProfileHeader: React.FC<ScrollableProfileHeaderProps> = ({
  largeNameOpacity,
  largeNameTranslateY,
  userName,
  profileCompletion,
}) => (
  <View style={styles.profileHeader}>
    {/* Spacer where the floating avatar visually sits */}
    <View style={styles.avatarSpacer} />

    <Animated.View
      style={[
        styles.nameContainer,
        {
          opacity: largeNameOpacity,
          transform: [{ translateY: largeNameTranslateY }],
        },
      ]}
    >
      <Text style={styles.profileName}>{userName}</Text>
      {profileCompletion >= 100 && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color="#34C759"
          style={{ marginLeft: 6 }}
        />
      )}
    </Animated.View>
  </View>
);

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    backgroundColor: "#000000",
    paddingTop: 66,
    paddingBottom: 8,
  },
  avatarSpacer: {
    width: AVATAR_LARGE,
    height: AVATAR_LARGE,
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  profileName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
});

export default ScrollableProfileHeader;
