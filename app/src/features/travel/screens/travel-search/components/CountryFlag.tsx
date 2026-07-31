import React, { useState } from "react";
import { Image, Text, StyleSheet, View } from "react-native";
import { getCountryCode } from "../travelMetricHelpers";
import { palette } from "@shared/theme/colors";

interface CountryFlagProps {
  country: string;
  /** Rendered flag width in px. Height follows the 4:3 flag ratio. */
  width?: number;
  style?: any;
}

/**
 * Renders a real flag image (flag emoji can't render on the iOS Simulator,
 * where regional-indicator pairs show as two tofu boxes). Falls back to a
 * globe glyph for unknown / non-country values.
 */
const CountryFlag: React.FC<CountryFlagProps> = React.memo(
  ({ country, width = 26, style }) => {
    const code = getCountryCode(country);
    const [failed, setFailed] = useState(false);
    const height = Math.round((width * 3) / 4);

    if (!code || failed) {
      return (
        <View
          style={[
            { width, height, alignItems: "center", justifyContent: "center" },
            style,
          ]}
        >
          <Text style={{ fontSize: width * 0.8 }}>🌍</Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: `https://flagcdn.com/w160/${code}.png` }}
        onError={() => setFailed(true)}
        style={[{ width, height, borderRadius: 4 }, styles.flag, style]}
        resizeMode="cover"
      />
    );
  },
);

const styles = StyleSheet.create({
  flag: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: palette.surfaceElevated,
  },
});

CountryFlag.displayName = "CountryFlag";

export default CountryFlag;
