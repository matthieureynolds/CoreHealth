import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Keyboard,
  Platform,
  UIManager,
  StyleSheet,
  Dimensions,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
import { Ionicons } from "@expo/vector-icons";
import { CitySearchResult } from "../../../../../shared/services/travel/citySearchService";
import { TravelHealth, TravelApiErrors } from "../../../../../shared/types";

// Friendly labels for the data sources that can fail to load, shown in the banner.
const API_ERROR_LABELS: Record<string, string> = {
  airQuality: "air quality",
  pollen: "pollen",
  waterQuality: "water safety",
  weather: "weather",
  healthcare: "nearby facilities",
  general: "health data",
};
import { styles } from "../TravelScreen.styles";
import { getCountryFromCity } from "../travelMetricHelpers";
import LocationSearchBar from "./LocationSearchBar";
import CountryFlag from "./CountryFlag";
import HealthMetricsSection from "./HealthMetricsSection";
import NearbyHospitalsSection from "./NearbyHospitalsSection";
import VaccinationsMedicationsSection from "./VaccinationsMedicationsSection";
import TreadmillCard from "./TreadmillCard";
import AnalyzingState from "./AnalyzingState";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SearchTabProps {
  inputText: string;
  searchLocation: string;
  selectedLocation: string;
  showInlineSuggestions: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isGettingLocation: boolean;
  isSearchingCities: boolean;
  filteredCities: string[];
  citySearchResults: CitySearchResult[];
  popularCities: string[];
  travelHealth: TravelHealth | null;
  apiErrors: TravelApiErrors;
  resultsOpacity: Animated.Value;
  resultsTranslateY: Animated.Value;
  getRowAnim: (key: string) => {
    opacity: Animated.Value;
    translate: Animated.Value;
  };
  onInputChange: (text: string) => void;
  onLocationSelect: (city: string) => void;
  onGetCurrentLocation: () => void;
  onRefresh: () => void;
  onEmergencyContactPress: () => void;
  onDismissSuggestions: () => void;
  onInputEndEditing: () => void;
  onInputSubmit: () => void;
  onClearSearch: () => void;
  onFocusSearch: () => void;
  onScrollOffset?: (offsetY: number) => void;
}

const SUMMARY_TEXT =
  "Overall health risk is low for this destination. All major health metrics are within safe ranges.";

// Memoised: TravelScreen now passes referentially stable callbacks, so this
// only re-renders when its data props genuinely change.
const SearchTab: React.FC<SearchTabProps> = React.memo((props) => {
  const {
    inputText,
    searchLocation,
    selectedLocation,
    showInlineSuggestions,
    isLoading,
    isRefreshing,
    isGettingLocation,
    isSearchingCities,
    filteredCities,
    citySearchResults,
    travelHealth,
    apiErrors,
    resultsOpacity,
    resultsTranslateY,
    getRowAnim,
    onInputChange,
    onLocationSelect,
    onGetCurrentLocation,
    onRefresh,
    onEmergencyContactPress,
    onDismissSuggestions,
    onInputEndEditing,
    onInputSubmit,
    onClearSearch,
    onFocusSearch,
    onScrollOffset,
  } = props;

  // Treadmill effect: track scroll position
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollContentRef = useRef<View>(null);

  // --- WhatsApp / iOS-style search bar ------------------------------------
  // The search bar is REAL content at the very top of the scroll view. When
  // results are showing we park the scroll offset at the bar's height so it
  // sits just out of view above the first row. Pulling down scrolls it back
  // into view 1:1 with the finger; the bar's contents fade with scroll
  // position; and on release it snaps fully open or closed. Before a city is
  // chosen the bar is the main UI and stays static & fully visible.
  const hasResults = !!selectedLocation && !isLoading;
  const scrollRef = useRef<ScrollView>(null);
  const [barH, setBarH] = React.useState(0);
  const parkOffset = barH > 0 ? barH + 4 : 0; // +4 for the bar's marginBottom

  // Park (hide) the bar when results appear, and re-park on a new destination.
  const lastParkedFor = useRef<string>("");
  useEffect(() => {
    if (!hasResults) {
      lastParkedFor.current = "";
      return;
    }
    if (parkOffset <= 0 || lastParkedFor.current === selectedLocation) return;
    lastParkedFor.current = selectedLocation;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: parkOffset, animated: false });
    });
  }, [hasResults, selectedLocation, parkOffset]);

  // Snap the bar fully open or closed when the drag/momentum ends in the band.
  const snapSearchBar = (offsetY: number) => {
    if (!hasResults || parkOffset <= 0) return;
    if (offsetY <= 0 || offsetY >= parkOffset) return;
    const target = offsetY < parkOffset / 2 ? 0 : parkOffset;
    scrollRef.current?.scrollTo({ y: target, animated: true });
  };

  // Forward the scroll offset to the parent's top-fade. Once results show, the
  // first `parkOffset` px are "the bar revealing", so the fade is measured from
  // the parked position — it should only appear when scrolling into content.
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    onScrollOffset?.(hasResults && parkOffset > 0 ? y - parkOffset : y);
  };

  // Accordion: the pill's HEIGHT is driven by scroll so it grows/shrinks in
  // place (WhatsApp-style) rather than sliding. At scrollY 0 it's full height;
  // parked (scrollY = parkOffset) it's fully collapsed.
  const barRevealHeight =
    parkOffset > 0
      ? scrollY.interpolate({
          inputRange: [0, parkOffset],
          outputRange: [parkOffset, 0],
          extrapolate: "clamp",
        })
      : 0;

  // Contents fade out a touch ahead of the height collapse (text/icon go first).
  const barOpacity = showInlineSuggestions
    ? 1
    : parkOffset > 0
      ? scrollY.interpolate({
          inputRange: [0, parkOffset * 0.6, parkOffset],
          outputRange: [1, 0, 0],
          extrapolate: "clamp",
        })
      : 1;

  // The search bar element, reused inline (no city yet) and in the pinned
  // accordion overlay (results showing).
  const locationBar = (
    <LocationSearchBar
      inputText={inputText}
      searchLocation={searchLocation}
      showInlineSuggestions={showInlineSuggestions}
      isGettingLocation={isGettingLocation}
      isSearchingCities={isSearchingCities}
      filteredCities={filteredCities}
      citySearchResults={citySearchResults}
      onInputChange={onInputChange}
      onFocusSearch={onFocusSearch}
      onClearSearch={onClearSearch}
      onInputEndEditing={onInputEndEditing}
      onInputSubmit={onInputSubmit}
      onGetCurrentLocation={onGetCurrentLocation}
      onLocationSelect={onLocationSelect}
      onDismissSuggestions={onDismissSuggestions}
    />
  );

  // Measures the bar's natural (collapsed) height. Ignored while the suggestions
  // dropdown is expanded so we only ever capture the pill height.
  const measureBar = (e: any) => {
    if (showInlineSuggestions) return;
    const h = e.nativeEvent.layout.height;
    if (h > 0 && Math.abs(h - barH) > 1) setBarH(h);
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: handleScroll },
        )}
        onScrollEndDrag={(e) => snapSearchBar(e.nativeEvent.contentOffset.y)}
        onMomentumScrollEnd={(e) =>
          snapSearchBar(e.nativeEvent.contentOffset.y)
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* paddingBottom clears the floating tab bar so the last cards (Medications)
          aren't hidden behind it. */}
        <View
          ref={scrollContentRef}
          style={[styles.content, { paddingBottom: 120 }]}
        >
          {hasResults ? (
            // Results showing: a fixed spacer reserves the scroll room the pinned
            // accordion pill (rendered as a viewport overlay below) collapses into.
            <View style={{ height: parkOffset }} />
          ) : (
            // No city yet: the bar is the main UI, inline and fully visible.
            <View
              style={{ marginBottom: 4, zIndex: 1002 }}
              onLayout={measureBar}
            >
              {locationBar}
            </View>
          )}
          {showInlineSuggestions && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                onDismissSuggestions();
                Keyboard.dismiss();
              }}
              // Span the full viewport so taps anywhere outside the dropdown
              // dismiss it — the dropdown is absolutely positioned and overflows
              // `content`'s laid-out height, so a bottom:0 overlay wouldn't reach
              // the area below (or beside) the list.
              style={[
                styles.tapDismissOverlay,
                { height: SCREEN_HEIGHT },
                hasResults && { zIndex: 99 },
              ]}
            />
          )}

          {/* Loading State — "reasoning checklist" thinking indicator */}
          {selectedLocation && isLoading && (
            <AnalyzingState location={selectedLocation} />
          )}

          {/* Health Metrics */}
          {selectedLocation && !isLoading ? (
            <View>
              <Animated.View
                style={[
                  styles.metricsContainer,
                  {
                    opacity: resultsOpacity,
                    transform: [{ translateY: resultsTranslateY }],
                    position: "relative",
                  },
                ]}
              >
                {/* Result Title Row */}
                {(() => {
                  const resolvedCountry =
                    travelHealth?.country && travelHealth.country !== "Unknown"
                      ? travelHealth.country
                      : getCountryFromCity(selectedLocation);
                  const nameFromData =
                    travelHealth?.location || selectedLocation;
                  const titleText = (() => {
                    if (
                      nameFromData &&
                      resolvedCountry &&
                      resolvedCountry !== "Unknown"
                    ) {
                      const alreadyHasCountry = nameFromData
                        .toLowerCase()
                        .includes(resolvedCountry.toLowerCase());
                      return alreadyHasCountry
                        ? nameFromData
                        : `${nameFromData}, ${resolvedCountry}`;
                    }
                    return nameFromData;
                  })();
                  return (
                    <View style={styles.resultTitleRow}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {titleText}
                      </Text>
                      <CountryFlag
                        country={resolvedCountry}
                        style={{ marginLeft: 10 }}
                      />
                    </View>
                  );
                })()}

                {/* Partial-data notice — calm, non-alarmist (CLAUDE.md) */}
                {Object.keys(apiErrors).length > 0 && (
                  <View style={bannerStyles.container}>
                    <Ionicons
                      name="cloud-offline-outline"
                      size={14}
                      color="#8E8E93"
                    />
                    <Text style={bannerStyles.text}>
                      Couldn't load{" "}
                      {Object.keys(apiErrors)
                        .map((k) => API_ERROR_LABELS[k] ?? k)
                        .join(", ")}
                      . Pull to refresh.
                    </Text>
                  </View>
                )}

                {/* Health Summary */}
                <TreadmillCard
                  scrollY={scrollY}
                  scrollContentRef={scrollContentRef}
                >
                  <Animated.View
                    style={[
                      styles.summaryCard,
                      {
                        opacity: getRowAnim("summary").opacity,
                        transform: [
                          { translateY: getRowAnim("summary").translate },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.summaryHeader}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#34C759"
                      />
                      <Text style={styles.summaryTitle}>Health Summary</Text>
                    </View>
                    <Text style={styles.summaryText}>{SUMMARY_TEXT}</Text>
                  </Animated.View>
                </TreadmillCard>

                <HealthMetricsSection
                  getRowAnim={getRowAnim}
                  scrollY={scrollY}
                  scrollContentRef={scrollContentRef}
                />

                <NearbyHospitalsSection
                  selectedLocation={selectedLocation}
                  getRowAnim={getRowAnim}
                  onEmergencyContactPress={onEmergencyContactPress}
                  scrollY={scrollY}
                  scrollContentRef={scrollContentRef}
                />

                <VaccinationsMedicationsSection
                  getRowAnim={getRowAnim}
                  scrollY={scrollY}
                  scrollContentRef={scrollContentRef}
                />
              </Animated.View>
            </View>
          ) : !isLoading ? (
            // Kept mounted while the suggestions dropdown is open so it reads
            // faintly through the translucent glass — the pill wrapper's
            // zIndex (1002) keeps the dropdown painted above it.
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateTitle}>Search a destination</Text>
              <Text style={[styles.emptyStateText, { fontSize: 17 }]}>
                for comprehensive health insights
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Pinned accordion pill — sits over the top of the list (aligned with the
        content's 20px padding) and grows/shrinks in HEIGHT with scroll, in
        place, instead of sliding. Only mounted once results are showing. */}
      {hasResults && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            { position: "absolute", top: 20, left: 20, right: 20 },
            showInlineSuggestions
              ? { zIndex: 1002 }
              : {
                  height: barRevealHeight,
                  overflow: "hidden",
                  zIndex: 100,
                  opacity: barOpacity,
                },
          ]}
        >
          <View onLayout={measureBar}>{locationBar}</View>
        </Animated.View>
      )}
    </View>
  );
});

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#1C1C1E",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2C2C2E",
  },
  text: {
    flex: 1,
    color: "#8E8E93",
    fontSize: 13,
  },
});

SearchTab.displayName = "SearchTab";

export default SearchTab;
