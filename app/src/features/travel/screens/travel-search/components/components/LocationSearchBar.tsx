import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CitySearchResult } from '../../../../../../shared/services/travel/citySearchService';
import { styles } from '../../TravelScreen.styles';

interface LocationSearchBarProps {
  inputText: string;
  searchLocation: string;
  typedCityText: string;
  showInlineSuggestions: boolean;
  isGettingLocation: boolean;
  isSearchingCities: boolean;
  filteredCities: string[];
  citySearchResults: CitySearchResult[];
  onInputChange: (text: string) => void;
  onFocusSearch: () => void;
  onClearSearch: () => void;
  onInputEndEditing: () => void;
  onInputSubmit: () => void;
  onGetCurrentLocation: () => void;
  onLocationSelect: (city: string) => void;
  onDismissSuggestions: () => void;
}

const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  inputText,
  searchLocation,
  typedCityText,
  showInlineSuggestions,
  isGettingLocation,
  isSearchingCities,
  filteredCities,
  citySearchResults,
  onInputChange,
  onFocusSearch,
  onClearSearch,
  onInputEndEditing,
  onInputSubmit,
  onGetCurrentLocation,
  onLocationSelect,
  onDismissSuggestions,
}) => (
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
        <TouchableOpacity onPress={onFocusSearch}>
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
              <Ionicons name="navigate" size={16} color={isGettingLocation ? '#8E8E93' : '#3AABF0'} />
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
                  <ActivityIndicator size="small" color="#3AABF0" />
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
                  <Ionicons name="location" size={16} color="#3AABF0" />
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
);

export default LocationSearchBar;
