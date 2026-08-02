import { useState, useEffect } from "react";
import {
  searchAllLocations,
  getPopularCities,
  CitySearchResult,
} from "@shared/services/travel/citySearchService";

export const popularCities = getPopularCities();

/**
 * The destination search field: what has been typed, what is suggested, and
 * the debounced lookup behind it.
 *
 * Owns its own debounce so the cancellation logic sits next to the state it
 * guards — a stale response overwriting a newer query is the bug this shape
 * prevents.
 */
export function useCitySearch() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [citySearchResults, setCitySearchResults] = useState<
    CitySearchResult[]
  >([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showInlineSuggestions, setShowInlineSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search cities
  useEffect(() => {
    if (searchLocation.trim() && searchLocation.length >= 2) {
      // Show popular city matches immediately while API loads
      const filtered = popularCities.filter((city) =>
        city.toLowerCase().includes(searchLocation.toLowerCase()),
      );
      setFilteredCities(filtered);
    } else {
      setCitySearchResults([]);
      setFilteredCities([]);
    }

    // See useCitySuggestions: the timer can be cancelled but an already-started
    // request cannot, so results are dropped unless they belong to the latest query.
    let cancelled = false;
    const searchCitiesAsync = async () => {
      if (searchLocation.trim() && searchLocation.length >= 2) {
        setIsSearchingCities(true);
        try {
          const results = await searchAllLocations(searchLocation, 15);
          if (!cancelled) setCitySearchResults(results);
        } catch {
          // Popular cities are already shown as fallback
        } finally {
          if (!cancelled) setIsSearchingCities(false);
        }
      }
    };
    const timeoutId = setTimeout(searchCitiesAsync, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchLocation]);

  return {
    searchLocation,
    setSearchLocation,
    selectedLocation,
    setSelectedLocation,
    inputText,
    setInputText,
    filteredCities,
    setFilteredCities,
    citySearchResults,
    setCitySearchResults,
    isSearchingCities,
    setIsSearchingCities,
    showInlineSuggestions,
    setShowInlineSuggestions,
    isLoading,
    setIsLoading,
  };
}
