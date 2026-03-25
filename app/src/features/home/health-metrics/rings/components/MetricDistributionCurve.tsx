import React from 'react';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { RingMetric } from './AnimatedRing';

interface MetricDistributionCurveProps {
  metric: RingMetric;
}

const MetricDistributionCurve: React.FC<MetricDistributionCurveProps> = ({ metric }) => {
  const chartWidth = 380;
  const chartHeight = 74;
  const padding = 20;
  const curveWidth = chartWidth - padding * 2;
  const curveHeight = chartHeight - padding * 2;

  const mean = 50;
  const stdDev = 28;
  const amplitude = 0.245;

  const points: { x: number; y: number }[] = [];
  for (let x = 0; x <= curveWidth; x += 2) {
    const normalizedX = (x / curveWidth) * 100;
    const yVal = Math.exp(-0.5 * Math.pow((normalizedX - mean) / stdDev, 2));
    const chartY = curveHeight - yVal * curveHeight * amplitude - 10;
    points.push({ x: x + padding, y: chartY });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const userPosition = (Math.max(0, Math.min(metric.value, 100)) / 100) * curveWidth;
  const userNormalizedX = (userPosition / curveWidth) * 100;
  const userYVal = Math.exp(-0.5 * Math.pow((userNormalizedX - mean) / stdDev, 2));
  const userChartY = curveHeight - userYVal * curveHeight * amplitude - 10;

  const tailPoints = points.filter(p => p.x >= userPosition + padding);
  const tailPathData = tailPoints.length > 0
    ? `M ${[{ x: userPosition + padding, y: userChartY }, ...tailPoints].map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Path d={pathData} stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <Path
        d={`M ${padding + curveWidth / 2},${padding} L ${padding + curveWidth / 2},${curveHeight - 10}`}
        stroke="#8E8E93"
        strokeWidth="1"
        strokeDasharray="4,6"
        opacity="0.6"
      />
      {tailPathData !== '' && (
        <Path d={tailPathData} stroke={metric.color} strokeWidth="2" fill="none" />
      )}
      <Circle cx={userPosition + padding} cy={userChartY} r="5" fill="#FFFFFF" stroke={metric.color} strokeWidth="2" />
      <SvgText x={padding} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="start">0</SvgText>
      <SvgText x={padding + curveWidth / 2} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="middle">50</SvgText>
      <SvgText x={padding + curveWidth} y={chartHeight - 5} fontSize="10" fill="#8E8E93" textAnchor="end">100</SvgText>
    </Svg>
  );
};

export default MetricDistributionCurve;
