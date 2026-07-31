import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { AIR_QUALITY_CONFIG } from "../metricScreens.config";

const AirQualityScreen: React.FC = () => (
  <MetricDetailScreen config={AIR_QUALITY_CONFIG} />
);

export default AirQualityScreen;
