import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

const getPercentile = (score: number): number => {
  if (score >= 80) return 85;
  if (score >= 65) return 65;
  if (score >= 50) return 50;
  if (score >= 35) return 25;
  return 10;
};

interface DistributionCurveProps {
  score: number;
}

const DistributionCurve: React.FC<DistributionCurveProps> = ({ score }) => {
  const chartWidth = 280;
  const chartHeight = 120;
  const padding = 20;
  const curveWidth = chartWidth - padding * 2;
  const curveHeight = chartHeight - padding * 2;

  const mean = 50;
  const stdDev = 15;
  const userPercentile = getPercentile(score);
  const userPosition = (userPercentile / 100) * curveWidth;

  const points: string[] = [];
  for (let x = 0; x <= curveWidth; x += 2) {
    const normalizedX = (x / curveWidth) * 100;
    const y = Math.exp(-0.5 * Math.pow((normalizedX - mean) / stdDev, 2));
    const chartY = curveHeight - y * curveHeight * 0.8 - 10;
    points.push(`${x + padding},${chartY}`);
  }

  const pathData = `M ${points.join(" L ")}`;
  const fullAreaPath = `M ${padding},${curveHeight - 10} L ${points.join(" L ")} L ${curveWidth + padding},${curveHeight - 10} Z`;

  const userNormalizedX = (userPosition / curveWidth) * 100;
  const userYVal = Math.exp(
    -0.5 * Math.pow((userNormalizedX - mean) / stdDev, 2),
  );
  const userChartY = curveHeight - userYVal * curveHeight * 0.8 - 10;

  return (
    <View style={styles.distributionContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0A7E33" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#0A7E33" stopOpacity="0.08" />
          </LinearGradient>
        </Defs>

        <Path d={fullAreaPath} fill="url(#areaGradient)" />
        <Path d={pathData} stroke="#8E8E93" strokeWidth="2" fill="none" />
        <Path
          d={`M ${padding + curveWidth / 2},${padding} L ${padding + curveWidth / 2},${curveHeight - 10}`}
          stroke="#8E8E93"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.5"
        />
        <Path
          d={`M ${userPosition + padding},${padding} L ${userPosition + padding},${curveHeight - 10}`}
          stroke="#FF9500"
          strokeWidth="2"
          strokeDasharray="4,6"
          opacity="0.9"
        />
        <Circle
          cx={userPosition + padding}
          cy={userChartY}
          r="4"
          fill="#FF9500"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <SvgText
          x={Math.min(userPosition + padding + 10, curveWidth + padding - 60)}
          y={Math.max(userChartY - 100, padding + 12)}
          fontSize="14"
          fill="#FFFFFF"
          fontWeight="bold"
        >
          {`Score: ${score}`}
        </SvgText>
        <SvgText
          x={padding}
          y={chartHeight - 5}
          fontSize="10"
          fill="#8E8E93"
          textAnchor="start"
        >
          0
        </SvgText>
        <SvgText
          x={padding + curveWidth / 2}
          y={chartHeight - 5}
          fontSize="10"
          fill="#8E8E93"
          textAnchor="middle"
        >
          50
        </SvgText>
        <SvgText
          x={padding + curveWidth}
          y={chartHeight - 5}
          fontSize="10"
          fill="#8E8E93"
          textAnchor="end"
        >
          100
        </SvgText>
      </Svg>

      <View style={styles.distributionLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#8E8E93" }]} />
          <Text style={styles.legendText}>Mean</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
          <Text style={styles.legendText}>{userPercentile}th percentile</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  distributionContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  distributionLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#8E8E93",
  },
});

export default DistributionCurve;
