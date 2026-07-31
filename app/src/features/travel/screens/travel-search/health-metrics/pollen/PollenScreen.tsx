import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { POLLEN_CONFIG } from "../metricScreens.config";

const PollenScreen: React.FC = () => (
  <MetricDetailScreen config={POLLEN_CONFIG} />
);

export default PollenScreen;
