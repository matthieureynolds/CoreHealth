import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { WATER_SAFETY_CONFIG } from "../metricScreens.config";

const WaterSafetyScreen: React.FC = () => (
  <MetricDetailScreen config={WATER_SAFETY_CONFIG} />
);

export default WaterSafetyScreen;
