import React from "react";
import MetricDetailScreen from "../MetricDetailScreen";
import { UV_INDEX_CONFIG } from "../metricScreens.config";

const UVIndexScreen: React.FC = () => (
  <MetricDetailScreen config={UV_INDEX_CONFIG} />
);

export default UVIndexScreen;
