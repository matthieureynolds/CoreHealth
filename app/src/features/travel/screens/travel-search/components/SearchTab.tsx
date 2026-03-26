import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, RefreshControl, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CitySearchResult } from '../../../../../shared/services/travel/citySearchService';
import { styles } from '../TravelScreen.styles';
import { getCountryFromCity, getCountryFlag } from '../travelMetricHelpers';
import LocationSearchBar from './components/LocationSearchBar';
import HealthMetricsSection from './components/HealthMetricsSection';
import NearbyHospitalsSection from './components/NearbyHospitalsSection';
import VaccinationsMedicationsSection from './components/VaccinationsMedicationsSection';

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
  onContentLayout: (height: number) => void; onOpenMaps: (destination: string) => void;
  onEmergencyContactPress: () => void; onDismissSuggestions: () => void;
  onInputEndEditing: () => void; onInputSubmit: () => void;
  onClearSearch: () => void; onFocusSearch: () => void;
}

const SearchTab: React.FC<SearchTabProps> = (props) => {
  const {
    inputText, searchLocation, selectedLocation, showInlineSuggestions,
    isLoading, isRefreshing, isGettingLocation, isSearchingCities,
    filteredCities, citySearchResults, typedCityText, travelHealth,
    resultsOpacity, resultsTranslateY, contentMeasuredHeight,
    curtainAnimationComplete, coverTranslate, getRowAnim, USE_CURTAIN_REVEAL,
    onInputChange, onLocationSelect, onGetCurrentLocation, onRefresh,
    onContentLayout, onOpenMaps, onEmergencyContactPress, onDismissSuggestions,
    onInputEndEditing, onInputSubmit, onClearSearch, onFocusSearch,
  } = props;

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      <View style={styles.content}>
        {/* Location Search */}
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
        {showInlineSuggestions && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { onDismissSuggestions(); Keyboard.dismiss(); }}
            style={styles.tapDismissOverlay}
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
                    const nameFromData = (travelHealth as any)?.name || selectedLocation;
                    const countryFromData = (travelHealth as any)?.country || getCountryFromCity(selectedLocation);
                    if (nameFromData && countryFromData) {
                      return `${nameFromData}, ${countryFromData}`;
                    }
                    const country = getCountryFromCity(selectedLocation);
                    const hasCountry = selectedLocation.toLowerCase().includes(country.toLowerCase());
                    return `${hasCountry ? selectedLocation : `${selectedLocation}, ${country}`}`;
                  })()} {getCountryFlag((travelHealth as any)?.country || getCountryFromCity(selectedLocation))}
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
                  Overall health risk is low for this destination. All major health metrics are within safe ranges.
                </Text>
              </Animated.View>

              <HealthMetricsSection getRowAnim={getRowAnim} />

              <NearbyHospitalsSection
                selectedLocation={selectedLocation}
                getRowAnim={getRowAnim}
                onOpenMaps={onOpenMaps}
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
