import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { useHealthData } from "@shared/context/HealthDataContext";
import { enrichOrganPanel } from "../utils/organBiomarkers";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import BodyMap from "../organs/components/BodyMap";
import BodySystemSelector, {
  BodySystemType,
} from "../organs/components/BodySystemSelector";
import SkeletonBodyMap from "../skeleton/components/SkeletonBodyMap";
import CirculationBodyMap from "../circulatory/components/CirculationBodyMap";
import NutritionBodyMap from "../nutrition/components/NutritionBodyMap";
import { PanelPayload } from "../types";
import BiomarkerDetailPanel from "./components/BiomarkerDetailPanel";
import styles from "./components/BodyMapStyles";

const SWIPE_THRESHOLD = 50;
const SLIDE_TRANSITION_DURATION = 300;

const BodyMapScreen: React.FC = () => {
  const { biomarkers } = useHealthData();
  const [selectedOrganData, setSelectedOrganData] =
    useState<PanelPayload | null>(null);
  const [panelAnim] = useState(new Animated.Value(0));
  const [selectedSystem, setSelectedSystem] =
    useState<BodySystemType>("organs");
  const [slideAnim] = useState(new Animated.Value(0));
  const scrollRef = useRef<ScrollView>(null);
  const [isHeadZoomed, setIsHeadZoomed] = useState(false);

  const systems: BodySystemType[] = [
    "organs",
    "skeleton",
    "circulation",
    "nutrition",
  ];

  const handleOrganSelect = (organ: PanelPayload) => {
    const enriched = enrichOrganPanel(organ, biomarkers);
    setSelectedOrganData(enriched);
    Animated.spring(panelAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleClosePanel = () => {
    Animated.spring(panelAnim, { toValue: 0, useNativeDriver: true }).start(
      () => {
        setSelectedOrganData(null);
      },
    );
  };

  const handleSystemChange = (system: BodySystemType) => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: SLIDE_TRANSITION_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setSelectedSystem(system);
      panelAnim.setValue(0);
    });
  };

  const handleSwipeGesture = (event: {
    nativeEvent: { state: number; translationX: number };
  }) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const currentIndex = systems.indexOf(selectedSystem);
      if (translationX > SWIPE_THRESHOLD && currentIndex > 0) {
        handleSystemChange(systems[currentIndex - 1]);
      } else if (
        translationX < -SWIPE_THRESHOLD &&
        currentIndex < systems.length - 1
      ) {
        handleSystemChange(systems[currentIndex + 1]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Body Map</Text>
        </View>
      </View>

      <BodySystemSelector
        selectedSystem={selectedSystem}
        onSystemChange={handleSystemChange}
      />

      <PanGestureHandler onHandlerStateChange={handleSwipeGesture} minDist={10}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isHeadZoomed}
        >
          <View style={styles.bodyMapContainer}>
            <Animated.View
              style={[
                styles.bodyMapWrapper,
                {
                  opacity: slideAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.3, 1],
                  }),
                },
              ]}
            >
              {selectedSystem === "organs" && (
                <BodyMap
                  onOrganSelect={handleOrganSelect}
                  onZoomChange={(zoomed) => {
                    setIsHeadZoomed(zoomed);
                    if (zoomed) {
                      scrollRef.current?.scrollTo({ y: 0, animated: true });
                    }
                  }}
                />
              )}
              {selectedSystem === "skeleton" && (
                <SkeletonBodyMap onZoneSelect={handleOrganSelect} />
              )}
              {selectedSystem === "circulation" && (
                <CirculationBodyMap onZoneSelect={handleOrganSelect} />
              )}
              {selectedSystem === "nutrition" && <NutritionBodyMap />}
            </Animated.View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </PanGestureHandler>

      {selectedOrganData && (
        <TouchableWithoutFeedback onPress={handleClosePanel}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: 999,
                opacity: panelAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      <BiomarkerDetailPanel
        selectedOrganData={selectedOrganData}
        panelAnim={panelAnim}
        onClose={handleClosePanel}
      />
    </View>
  );
};

export default BodyMapScreen;
