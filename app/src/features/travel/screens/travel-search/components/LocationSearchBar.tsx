import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { CitySearchResult } from '../../../../../shared/services/travel/citySearchService';
import { styles } from '../TravelScreen.styles';
import { GLASS_AVAILABLE, GLASS_TINT } from './glass';

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
}) => {
  // Popular cities that aren't already covered by API results
  const apiCityNames = new Set(citySearchResults.map(c => `${c.name}, ${c.country}`.toLowerCase()));
  const extraPopularCities = filteredCities.filter(city => !apiCityNames.has(city.toLowerCase())).slice(0, 4);

  const hasSuggestionContent = showInlineSuggestions && (
    !searchLocation.trim() || citySearchResults.length > 0 || extraPopularCities.length > 0
  );

  // --- Collapse-into-the-bar animation -------------------------------------
  // The dropdown stays mounted through its exit so it can animate: on dismiss
  // its height collapses to 0 (the bottom edge rises up to meet the bar), it
  // fades, and the input's bottom corners round back. `progress` 1 = open.
  const progress = useRef(new Animated.Value(hasSuggestionContent ? 1 : 0)).current;
  const [rendered, setRendered] = useState(hasSuggestionContent);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    if (hasSuggestionContent) {
      setRendered(true);
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: false,
        friction: 11,
        tension: 90,
      }).start();
    } else if (rendered) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [hasSuggestionContent]); // eslint-disable-line react-hooks/exhaustive-deps

  const cornerRadius = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  // No border on the search pill (the outline is removed); only the bottom
  // corners square off as the dropdown opens so it reads as one piece.
  const inputBorderStyle = {
    borderBottomLeftRadius: cornerRadius,
    borderBottomRightRadius: cornerRadius,
  };

  // --- Press "pop" microinteraction ---------------------------------------
  // Mirrors the iOS lock-screen keypad: on tap the bar briefly scales up, then
  // springs back to rest — a quick scale-up, then a slightly bouncy settle.
  // Kept on the JS driver to match the border/corner animations already on
  // this node (mixing native + JS drivers on one view triggers RN warnings).
  const pressScale = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    pressScale.stopAnimation();
    pressScale.setValue(1);
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 1.04,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      // friction 7 = a single soft overshoot, then settle (no second bounce).
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 7,
        tension: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleFocus = () => {
    onFocusSearch();
  };

  const handleBlur = () => {};

  return (
  <View style={styles.locationSearchContainer}>
    <View>
      <Animated.View
        onTouchStart={pulse}
        style={[styles.locationSearchButton, inputBorderStyle, { transform: [{ scale: pressScale }] }]}
      >
        <TextInput
          style={styles.locationSearchInput}
          value={inputText}
          onChangeText={onInputChange}
          placeholder={typedCityText ? `Search ${typedCityText}` : 'Search'}
          placeholderTextColor="#8E8E93"
          returnKeyType="search"
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      </Animated.View>
    </View>

    {rendered && (
      <Animated.View
        style={[
          styles.suggestionsContainer,
          GLASS_AVAILABLE && local.suggestionsGlass,
          {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            overflow: 'hidden',
            // NOTE: no `opacity` here. Animating opacity on the container that
            // holds the GlassView makes iOS render the glass dark/broken. The
            // height animation reveals it instead, and the content (below) fades
            // on its own — leaving the glass layer at full opacity (frosted).
            height: contentH > 0
              ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentH] })
              : undefined,
          },
        ]}
      >
        {GLASS_AVAILABLE && (
          <GlassView
            glassEffectStyle="regular"
            colorScheme="dark"
            tintColor={GLASS_TINT}
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
            ]}
          />
        )}
        <Animated.ScrollView showsVerticalScrollIndicator={false} style={{ opacity: progress }}>
          <View
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && Math.abs(h - contentH) > 1) setContentH(h);
            }}
          >
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

          {(citySearchResults.length > 0 || extraPopularCities.length > 0) && (
            <View>
              {isSearchingCities && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3AABF0" />
                  <Text style={styles.loadingText}>Searching cities...</Text>
                </View>
              )}

              {citySearchResults.length > 0 && citySearchResults.map((city, index) => {
                const isLast = index === citySearchResults.length - 1 && extraPopularCities.length === 0;
                return (
                <TouchableOpacity
                  key={`api-${city.placeId}`}
                  style={[styles.suggestionItem, !isLast ? styles.suggestionItemDivider : null]}
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
                );
              })}

              {extraPopularCities.map((city, index) => (
                <TouchableOpacity
                  key={`popular-${index}`}
                  style={[styles.suggestionItem, index < extraPopularCities.length - 1 ? styles.suggestionItemDivider : null]}
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
          </View>
        </Animated.ScrollView>
      </Animated.View>
    )}
  </View>
  );
};

const local = StyleSheet.create({
  // Liquid Glass: drop the opaque fill so the glass shows through, and trade
  // the hard grey edge for a soft translucent rim that reads as glass.
  suggestionsGlass: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.18)',
  },
});

export default LocationSearchBar;
