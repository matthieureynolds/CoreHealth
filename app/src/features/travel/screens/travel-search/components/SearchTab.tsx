import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, RefreshControl, Keyboard, Image, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CitySearchResult } from '../../../../../shared/services/travel/citySearchService';
import { styles } from '../TravelScreen.styles';
import { getCountryFromCity, getCountryFlag } from '../travelMetricHelpers';
import { useStreamingText } from '../hooks/useStreamingText';
import LocationSearchBar from './components/LocationSearchBar';
import HealthMetricsSection from './components/HealthMetricsSection';
import NearbyHospitalsSection from './components/NearbyHospitalsSection';
import VaccinationsMedicationsSection from './components/VaccinationsMedicationsSection';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SearchTabProps {
  inputText: string; searchLocation: string; selectedLocation: string;
  showInlineSuggestions: boolean; isLoading: boolean; isRefreshing: boolean;
  isGettingLocation: boolean; isSearchingCities: boolean; filteredCities: string[];
  citySearchResults: CitySearchResult[]; typedCityText: string; popularCities: string[];
  travelHealth: any;
  resultsOpacity: Animated.Value; resultsTranslateY: Animated.Value;
  contentMeasuredHeight: number; curtainAnimationComplete: boolean;
  coverTranslate: Animated.Value;
  getRowAnim: (key: string) => { opacity: Animated.Value; translate: Animated.Value };
  USE_CURTAIN_REVEAL: boolean;
  onInputChange: (text: string) => void; onLocationSelect: (city: string) => void;
  onGetCurrentLocation: () => void; onRefresh: () => void;
  onContentLayout: (height: number) => void;
  onEmergencyContactPress: () => void; onDismissSuggestions: () => void;
  onInputEndEditing: () => void; onInputSubmit: () => void;
  onClearSearch: () => void; onFocusSearch: () => void;
}

const SUMMARY_TEXT = 'Overall health risk is low for this destination. All major health metrics are within safe ranges.';

const SearchTab: React.FC<SearchTabProps> = (props) => {
  const {
    inputText, searchLocation, selectedLocation, showInlineSuggestions,
    isLoading, isRefreshing, isGettingLocation, isSearchingCities,
    filteredCities, citySearchResults, typedCityText, travelHealth,
    resultsOpacity, resultsTranslateY, contentMeasuredHeight,
    curtainAnimationComplete, coverTranslate, getRowAnim, USE_CURTAIN_REVEAL,
    onInputChange, onLocationSelect, onGetCurrentLocation, onRefresh,
    onContentLayout, onEmergencyContactPress, onDismissSuggestions,
    onInputEndEditing, onInputSubmit, onClearSearch, onFocusSearch,
  } = props;

  const { displayed: streamedSummary, isStreaming } = useStreamingText(SUMMARY_TEXT, !!selectedLocation && !isLoading);

  // Search bar collapse animation
  const hasResults = !!selectedLocation && !isLoading;
  const initiallyCollapsed = hasResults;
  const searchBarHeight = useRef(new Animated.Value(initiallyCollapsed ? 0 : 1)).current;
  const scrollRef = useRef<ScrollView>(null);
  const prevHasResults = useRef(hasResults);
  const isSearchBarVisible = useRef(!initiallyCollapsed);

  // When results appear, collapse the search bar. When cleared, show it.
  useEffect(() => {
    if (hasResults && !prevHasResults.current) {
      // Results just appeared — collapse the search bar
      Animated.timing(searchBarHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        isSearchBarVisible.current = false;
      });
    } else if (!hasResults && prevHasResults.current) {
      // Results were cleared — show the search bar
      Animated.timing(searchBarHeight, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        isSearchBarVisible.current = true;
      });
    }
    prevHasResults.current = hasResults;
  }, [hasResults]);

  // Handle scroll to reveal search bar when user scrolls past the top
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (hasResults) {
      if (offsetY < -20 && !isSearchBarVisible.current) {
        // User is pulling down past the top — reveal search bar
        isSearchBarVisible.current = true;
        Animated.spring(searchBarHeight, {
          toValue: 1,
          useNativeDriver: false,
          tension: 65,
          friction: 11,
        }).start();
      } else if (offsetY > 10 && isSearchBarVisible.current) {
        // User scrolled down — hide search bar again
        isSearchBarVisible.current = false;
        Animated.timing(searchBarHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  // When results exist, the search bar floats on top (absolute) so it overlaps
  // the content instead of pushing it down. Otherwise it's in normal flow.
  const animatedSearchBarStyle = hasResults
    ? {
        position: 'absolute' as const,
        top: 20,
        left: 20,
        right: 20,
        zIndex: 100,
        opacity: searchBarHeight,
        transform: [{
          translateY: searchBarHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [-60, 0],
          }),
        }],
      }
    : {
        opacity: searchBarHeight,
        marginBottom: searchBarHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 20],
        }),
        maxHeight: searchBarHeight.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 80],
        }),
        overflow: 'hidden' as const,
      };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      <View style={styles.content}>
        {/* Location Search — overlaps results when revealed via pull-down */}
        <Animated.View style={animatedSearchBarStyle}>
          <LocationSearchBar
            inputText={inputText} searchLocation={searchLocation}
            typedCityText={typedCityText} showInlineSuggestions={showInlineSuggestions}
            isGettingLocation={isGettingLocation} isSearchingCities={isSearchingCities}
            filteredCities={filteredCities} citySearchResults={citySearchResults}
            onInputChange={onInputChange} onFocusSearch={onFocusSearch}
            onClearSearch={onClearSearch} onInputEndEditing={onInputEndEditing}
            onInputSubmit={onInputSubmit} onGetCurrentLocation={onGetCurrentLocation}
            onLocationSelect={onLocationSelect} onDismissSuggestions={onDismissSuggestions}
          />
        </Animated.View>
        {showInlineSuggestions && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { onDismissSuggestions(); Keyboard.dismiss(); }}
            style={[styles.tapDismissOverlay, hasResults && { zIndex: 99 }]}
          />
        )}

        {/* Loading State */}
        {selectedLocation && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3AABF0" />
            <Text style={styles.loadingText}>Loading health data...</Text>
          </View>
        )}

        {/* Health Metrics */}
        {selectedLocation && !isLoading ? (
          <View>
            <Animated.View
              onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                if (h > 0) onContentLayout(h);
              }}
              style={[
                styles.metricsContainer,
                {
                  opacity: resultsOpacity,
                  transform: [{ translateY: resultsTranslateY }],
                  position: 'relative',
                },
              ]}
            >
              {/* Result Title Row */}
              <View style={styles.resultTitleRow}>
                <Text style={styles.resultTitle}>
                  {(() => {
                    const nameFromData = travelHealth?.location || selectedLocation;
                    const countryFromData = travelHealth?.country && travelHealth.country !== 'Unknown' ? travelHealth.country : getCountryFromCity(selectedLocation);
                    if (nameFromData && countryFromData && countryFromData !== 'Unknown') {
                      const alreadyHasCountry = nameFromData.toLowerCase().includes(countryFromData.toLowerCase());
                      return alreadyHasCountry ? `${nameFromData}` : `${nameFromData}, ${countryFromData}`;
                    }
                    return nameFromData;
                  })()} {getCountryFlag(travelHealth?.country && travelHealth.country !== 'Unknown' ? travelHealth.country : getCountryFromCity(selectedLocation))}
                </Text>
              </View>

              {/* Health Summary */}
              <Animated.View
                style={[
                  styles.summaryCard,
                  {
                    opacity: getRowAnim('summary').opacity,
                    transform: [{ translateY: getRowAnim('summary').translate }],
                  },
                ]}
              >
                <View style={styles.summaryHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                  <Text style={styles.summaryTitle}>Health Summary</Text>
                </View>
                <Text style={styles.summaryText}>
                  {streamedSummary}{isStreaming ? '▍' : ''}
                </Text>
              </Animated.View>

              <HealthMetricsSection getRowAnim={getRowAnim} />

              <NearbyHospitalsSection
                selectedLocation={selectedLocation}
                getRowAnim={getRowAnim}
                onEmergencyContactPress={onEmergencyContactPress}
              />

              <VaccinationsMedicationsSection getRowAnim={getRowAnim} />

              {/* Curtain overlay */}
              {USE_CURTAIN_REVEAL && contentMeasuredHeight > 0 && (
                <>
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: contentMeasuredHeight,
                      zIndex: 999,
                      backgroundColor: '#000000',
                      transform: [
                        {
                          translateY: coverTranslate.interpolate({
                            inputRange: [0, contentMeasuredHeight || 1],
                            outputRange: [0, contentMeasuredHeight || 1],
                          }),
                        },
                      ],
                    }}
                  />
                  {!curtainAnimationComplete && (
                    <Animated.View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: -24,
                        top: 0,
                        zIndex: 1000,
                        transform: [
                          { translateY: coverTranslate },
                          { rotate: '180deg' },
                        ],
                      }}
                    >
                      <Image
                        source={require('../../../../../../assets/images/travel/airplane.png')}
                        style={{ width: 48, height: 48 }}
                        resizeMode="contain"
                      />
                    </Animated.View>
                  )}
                </>
              )}
            </Animated.View>
          </View>
        ) : !isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>Search for a destination</Text>
            <Text style={styles.emptyStateText}>
              Enter a city or country to get comprehensive health insights
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default SearchTab;
