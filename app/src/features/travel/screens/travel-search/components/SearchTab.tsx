import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Keyboard,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList } from '../../../../../shared/types';
import { CitySearchResult } from '../../../../../shared/services/travel/citySearchService';
import { styles } from '../TravelScreen.styles';
import {
  getStatusColor,
  getMetricFixedIconColor,
  getScoreColor,
  getMetricScore,
  getCountryFromCity,
  getCountryFlag,
  GENERAL_MEDS,
  HEALTH_METRIC_ROWS,
} from '../travelMetricHelpers';

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, 'TravelList'>,
  StackNavigationProp<RootStackParamList>
>;

interface SearchTabProps {
  // Search state
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
  typedCityText: string;
  popularCities: string[];
  travelHealth: any;

  // Animation refs
  resultsOpacity: Animated.Value;
  resultsTranslateY: Animated.Value;
  contentMeasuredHeight: number;
  curtainAnimationComplete: boolean;
  coverTranslate: Animated.Value;
  getRowAnim: (key: string) => { opacity: Animated.Value; translate: Animated.Value };
  USE_CURTAIN_REVEAL: boolean;

  // Handlers
  onInputChange: (text: string) => void;
  onLocationSelect: (city: string) => void;
  onGetCurrentLocation: () => void;
  onRefresh: () => void;
  onContentLayout: (height: number) => void;
  onOpenMaps: (destination: string) => void;
  onEmergencyContactPress: () => void;
  onDismissSuggestions: () => void;
  onInputEndEditing: () => void;
  onInputSubmit: () => void;
  onClearSearch: () => void;
  onFocusSearch: () => void;
}

const SearchTab: React.FC<SearchTabProps> = ({
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
  typedCityText,
  popularCities,
  travelHealth,
  resultsOpacity,
  resultsTranslateY,
  contentMeasuredHeight,
  curtainAnimationComplete,
  coverTranslate,
  getRowAnim,
  USE_CURTAIN_REVEAL,
  onInputChange,
  onLocationSelect,
  onGetCurrentLocation,
  onRefresh,
  onContentLayout,
  onOpenMaps,
  onEmergencyContactPress,
  onDismissSuggestions,
  onInputEndEditing,
  onInputSubmit,
  onClearSearch,
  onFocusSearch,
}) => {
  const navigation = useNavigation<Nav>();

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
        <>
          {true ? (
            <View style={styles.locationSearchContainer}>
              <View style={styles.locationSearchButton}>
                <TextInput
                  style={styles.locationSearchInput}
                  value={inputText}
                  onChangeText={onInputChange}
                  placeholder={typedCityText ? `Search ${typedCityText}` : 'Search'}
                  placeholderTextColor="#8E8E93"
                  returnKeyType="search"
                  onFocus={onFocusSearch}
                  onEndEditing={onInputEndEditing}
                  onSubmitEditing={onInputSubmit}
                />
                {searchLocation ? (
                  <TouchableOpacity onPress={onClearSearch}>
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => onFocusSearch()}>
                    <Ionicons name="search" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>

              {showInlineSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {!searchLocation.trim() && (
                      <TouchableOpacity
                        style={[styles.suggestionItem, styles.suggestionItemDivider]}
                        onPress={onGetCurrentLocation}
                        disabled={isGettingLocation}
                      >
                        <Ionicons name="navigate" size={16} color={isGettingLocation ? '#8E8E93' : '#007AFF'} />
                        <Text style={styles.suggestionText}>
                          {isGettingLocation ? 'Getting location…' : 'Use current location'}
                        </Text>
                        {isGettingLocation && (
                          <ActivityIndicator size="small" color="#8E8E93" style={{ marginLeft: 8 }} />
                        )}
                      </TouchableOpacity>
                    )}
                    {(citySearchResults.length > 0 || filteredCities.length > 0) && (
                      <View style={styles.suggestionsContainer}>
                        {isSearchingCities && (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.loadingText}>Searching cities...</Text>
                          </View>
                        )}

                        {citySearchResults.length > 0 && citySearchResults.map((city, index) => (
                          <TouchableOpacity
                            key={`api-${city.placeId}`}
                            style={[styles.suggestionItem, index < citySearchResults.length - 1 ? styles.suggestionItemDivider : null]}
                            onPress={() => {
                              onDismissSuggestions();
                              const cityName = `${city.name}, ${city.country}`;
                              onLocationSelect(cityName);
                              Keyboard.dismiss();
                            }}
                          >
                            <Ionicons name="location" size={16} color="#007AFF" />
                            <View style={styles.suggestionContent}>
                              <Text style={styles.suggestionText}>{city.name}</Text>
                              <Text style={styles.suggestionSubtext}>{city.country}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}

                        {citySearchResults.length === 0 && filteredCities.length > 0 && filteredCities.map((city, index) => (
                          <TouchableOpacity
                            key={`popular-${index}`}
                            style={[styles.suggestionItem, index < filteredCities.length - 1 ? styles.suggestionItemDivider : null]}
                            onPress={() => {
                              onDismissSuggestions();
                              onLocationSelect(city);
                              Keyboard.dismiss();
                            }}
                          >
                            <Ionicons name="location" size={16} color="#8E8E93" />
                            <Text style={styles.suggestionText}>{city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          ) : null}

          {showInlineSuggestions && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => { onDismissSuggestions(); Keyboard.dismiss(); }}
              style={styles.tapDismissOverlay}
            />
          )}
        </>

        {/* Loading State */}
        {selectedLocation && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
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

              {/* Health Metrics Section */}
              <View style={styles.metricsSection}>
                <View style={styles.sectionGroupCard}>
                  <Text style={styles.sectionTitle}>Health Metrics</Text>

                  {HEALTH_METRIC_ROWS.map(({ animKey, metricId, label, value, status, icon, scoreLabel }) => (
                    <Animated.View
                      key={animKey}
                      style={{
                        opacity: getRowAnim(animKey).opacity,
                        transform: [{ translateY: getRowAnim(animKey).translate }],
                      }}
                    >
                      <TouchableOpacity
                        style={styles.metricRowCard}
                        onPress={() =>
                          navigation.navigate('EnvironmentalMetric', {
                            metricId,
                            label,
                            value,
                            status,
                            score: getMetricScore(scoreLabel),
                            icon,
                          })
                        }
                      >
                        <View style={[styles.metricIconCircle, { backgroundColor: `${getMetricFixedIconColor(metricId, status)}20` }]}>
                          <Ionicons name={icon as any} size={20} color={getMetricFixedIconColor(metricId, status)} />
                        </View>
                        <View style={styles.metricContent}>
                          <Text style={styles.metricName}>{label}</Text>
                          <Text style={[styles.metricValueText, { color: getStatusColor(status) }]}>{value}</Text>
                        </View>
                        <View style={styles.metricRightCol}>
                          <Text style={[styles.metricScoreText, { color: getScoreColor(metricId, status, getMetricScore(scoreLabel)) }]}>
                            {getMetricScore(scoreLabel)}
                          </Text>
                          <Text style={styles.metricScoreLabelText}>Score</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>

              {/* Nearby Hospitals */}
              <Animated.View
                style={[
                  styles.hospitalsSection,
                  {
                    opacity: getRowAnim('hospitals').opacity,
                    transform: [{ translateY: getRowAnim('hospitals').translate }],
                  },
                ]}
              >
                <View style={styles.sectionGroupCard}>
                  <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
                  <TouchableOpacity style={styles.hospitalCard} onPress={() => onOpenMaps('Central Hospital')}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Central Hospital</Text>
                      {selectedLocation === 'Current Location' ? (
                        <Text style={styles.hospitalDistance}>2.1km</Text>
                      ) : null}
                    </View>
                    <Text style={styles.hospitalInfo}>24/7 Emergency Services • ICU Available</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.hospitalCard} onPress={() => onOpenMaps('City Medical Center')}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>City Medical Center</Text>
                      {selectedLocation === 'Current Location' ? (
                        <Text style={styles.hospitalDistance}>3.8km</Text>
                      ) : null}
                    </View>
                    <Text style={styles.hospitalInfo}>General Practice • Emergency Care</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.hospitalCard} onPress={() => onOpenMaps('Emergency Clinic')}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="medical" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Emergency Clinic</Text>
                      {selectedLocation === 'Current Location' ? (
                        <Text style={styles.hospitalDistance}>4.2km</Text>
                      ) : null}
                    </View>
                    <Text style={styles.hospitalInfo}>Urgent Care • Walk-in Available</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.hospitalCard} onPress={onEmergencyContactPress}>
                    <View style={styles.hospitalHeader}>
                      <Ionicons name="call" size={20} color="#FF3B30" />
                      <Text style={styles.hospitalTitle}>Emergency Contact</Text>
                      <Text style={styles.hospitalDistance}>112</Text>
                    </View>
                    <Text style={styles.hospitalInfo}>Tap to call emergency services</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Vaccinations */}
              <Animated.View
                style={[
                  styles.vaccinationSection,
                  {
                    opacity: getRowAnim('vaccinations').opacity,
                    transform: [{ translateY: getRowAnim('vaccinations').translate }],
                  },
                ]}
              >
                <View style={styles.sectionGroupCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                    <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Vaccinations</Text>
                  </View>
                  <View style={styles.vaccineRow}>
                    <View style={styles.vaccineLeft}>
                      <Ionicons name="medkit" size={18} color="#FF3B30" />
                      <Text style={styles.vaccineName}>COVID-19</Text>
                    </View>
                    <View style={styles.vaccineRight}>
                      <Text style={[styles.vaccineBadge, { color: '#FF3B30' }]}>Required</Text>
                    </View>
                  </View>
                  <View style={styles.vaccineRow}>
                    <View style={styles.vaccineLeft}>
                      <Ionicons name="medkit" size={18} color="#FF9F0A" />
                      <Text style={styles.vaccineName}>Hepatitis A</Text>
                    </View>
                    <View style={styles.vaccineRight}>
                      <Text style={[styles.vaccineBadge, { color: '#FF9F0A' }]}>Recommended</Text>
                    </View>
                  </View>
                  <View style={styles.vaccineRow}>
                    <View style={styles.vaccineLeft}>
                      <Ionicons name="medkit" size={18} color="#FF9F0A" />
                      <Text style={styles.vaccineName}>Typhoid</Text>
                    </View>
                    <View style={styles.vaccineRight}>
                      <Text style={[styles.vaccineBadge, { color: '#FF9F0A' }]}>Recommended</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Medications */}
              <View style={styles.medicationSection}>
                <View style={styles.sectionGroupCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="medkit" size={20} color="#0A84FF" />
                    <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Medications</Text>
                  </View>
                  {GENERAL_MEDS.map((m: { name: string; purpose: string; dosage: string }, idx: number) => (
                    <View key={`gen-${m.name}-${idx}`} style={styles.vaccineRow}>
                      <View style={styles.vaccineLeft}>
                        <Text style={styles.vaccineName}>{m.name}</Text>
                      </View>
                      <View style={styles.vaccineRight}>
                        <Text style={styles.vaccineBadge}>{(m as any).note}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

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
