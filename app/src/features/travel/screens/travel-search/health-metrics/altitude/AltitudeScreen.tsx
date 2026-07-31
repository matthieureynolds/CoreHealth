import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { ALTITUDE_CONFIG } from "../metricScreens.config";

const AltitudeScreen: React.FC = () => (
  <MetricDetailScreen config={ALTITUDE_CONFIG} />
);

export default AltitudeScreen;
