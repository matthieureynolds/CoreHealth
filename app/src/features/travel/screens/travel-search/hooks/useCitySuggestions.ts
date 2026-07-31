import { useEffect } from "react";
import {
  searchAllLocations,
  getPopularCities,
} from "@shared/services/travel/citySearchService";

const POPULAR_CITIES = getPopularCities();

/**
 * Debounced city-suggestion search shared by the trip/edit location fields.
 * Shows local popular-city matches instantly, then replaces them with API
 * results once they land (falling back to the local matches on error).
 */
export function useCitySuggestions(
  query: string,
  setSuggestions: (v: string[]) => void,
) {
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const localMatches = POPULAR_CITIES.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase()),
    );
    if (localMatches.length > 0) setSuggestions(localMatches);

    // `cancelled` guards the in-flight request, not just the timer: clearTimeout
    // alone cannot stop a fetch that already started, so a slower response for an
    // earlier query could otherwise land last and overwrite newer suggestions.
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const results = await searchAllLocations(query, 12);
        if (cancelled) return;
        if (results.length > 0) {
          setSuggestions(
            results.map((city) => `${city.name}, ${city.country}`),
          );
        }
      } catch {
        if (!cancelled) setSuggestions(localMatches);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
}
