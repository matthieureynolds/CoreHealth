import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../TravelScreen.styles";
import { FlightOption } from "@shared/types";
import { palette } from "@shared/theme/colors";

interface FlightDetailsCardProps {
  flightLookupResult: FlightOption | null;
  flightDetailsExpanded: boolean;
  onFlightDetailsExpand: (v: boolean) => void;
}

const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({
  flightLookupResult,
  flightDetailsExpanded,
  onFlightDetailsExpand,
}) => {
  if (!flightLookupResult) return null;

  return (
    <TouchableOpacity
      style={styles.flightDetailsCard}
      activeOpacity={0.7}
      onPress={() => onFlightDetailsExpand(!flightDetailsExpanded)}
    >
      <Text style={styles.flightNumberText}>
        {flightLookupResult.carrier} {flightLookupResult.number}
      </Text>
      <View style={styles.flightDetailsTable}>
        <View style={styles.flightDetailsRowsWrapper}>
          <View style={styles.flightConnectorLine} />
          <View style={styles.flightDetailsRow}>
            <View style={styles.flightDetailsCellCity}>
              <Ionicons
                name="airplane"
                size={18}
                color={palette.successDeep}
                style={{ transform: [{ rotate: "90deg" }] }}
              />
              <Text style={styles.flightCityText} numberOfLines={1}>
                {flightLookupResult.origin_city}
              </Text>
            </View>
            <View style={styles.flightDetailsCellDate}>
              <Text style={styles.flightDate}>
                {new Date(flightLookupResult.dep_local).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
              </Text>
            </View>
            <View style={styles.flightDetailsCellTime}>
              <Text style={styles.flightTime}>
                {new Date(flightLookupResult.dep_local).toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit", hour12: false },
                )}
              </Text>
            </View>
            <View style={styles.flightDetailsCellArrow} />
          </View>
          <View style={styles.flightDetailsRow}>
            <View style={styles.flightDetailsCellCity}>
              <Ionicons
                name="airplane"
                size={18}
                color={palette.successDeep}
                style={{ transform: [{ rotate: "90deg" }] }}
              />
              <Text style={styles.flightCityText} numberOfLines={1}>
                {flightLookupResult.dest_city}
              </Text>
            </View>
            <View style={styles.flightDetailsCellDate}>
              <Text style={styles.flightDate}>
                {new Date(flightLookupResult.arr_local).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
              </Text>
            </View>
            <View style={styles.flightDetailsCellTime}>
              <Text style={styles.flightTime}>
                {new Date(flightLookupResult.arr_local).toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit", hour12: false },
                )}
              </Text>
            </View>
            <View style={styles.flightDetailsCellArrow} />
          </View>
          {!flightDetailsExpanded && (
            <View style={styles.flightDetailsChevronWrap}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={palette.successDeep}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface FlightSegmentCardsProps {
  flightSegments: FlightOption[];
  onEditSegment?: (index: number) => void;
}

const FlightSegmentCards: React.FC<FlightSegmentCardsProps> = ({
  flightSegments,
  onEditSegment,
}) => {
  if (flightSegments.length === 0) return null;

  return (
    <View>
      {flightSegments.map((seg, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.flightDetailsCard, styles.flightSegmentCard]}
          activeOpacity={onEditSegment ? 0.7 : 1}
          disabled={!onEditSegment}
          onPress={() => onEditSegment?.(idx)}
        >
          <Text style={styles.flightNumberText}>
            {seg.carrier} {seg.number}
          </Text>
          <View style={styles.flightDetailsTable}>
            <View style={styles.flightDetailsRowsWrapper}>
              <View style={styles.flightConnectorLine} />
              <View style={styles.flightDetailsRow}>
                <View style={styles.flightDetailsCellCity}>
                  <Ionicons
                    name="airplane"
                    size={18}
                    color={palette.successDeep}
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                  <Text style={styles.flightCityText} numberOfLines={1}>
                    {seg.origin_city}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellDate}>
                  <Text style={styles.flightDate}>
                    {new Date(seg.dep_local).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellTime}>
                  <Text style={styles.flightTime}>
                    {new Date(seg.dep_local).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellArrow} />
              </View>
              <View style={styles.flightDetailsRow}>
                <View style={styles.flightDetailsCellCity}>
                  <Ionicons
                    name="airplane"
                    size={18}
                    color={palette.successDeep}
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                  <Text style={styles.flightCityText} numberOfLines={1}>
                    {seg.dest_city}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellDate}>
                  <Text style={styles.flightDate}>
                    {new Date(seg.arr_local).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellTime}>
                  <Text style={styles.flightTime}>
                    {new Date(seg.arr_local).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellArrow} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

interface FlightSuggestionsListProps {
  suggestions: FlightOption[];
  onSelect: (flight: FlightOption) => void;
}

const FlightSuggestionsList: React.FC<FlightSuggestionsListProps> = ({
  suggestions,
  onSelect,
}) => {
  if (suggestions.length === 0) return null;

  return (
    // marginTop offsets the inputContainer's 16px bottom margin so the gap
    // above the first card matches the 12px gap between cards (even spacing).
    <View style={{ marginTop: -4, gap: 12 }}>
      {suggestions.map((f, idx) => (
        <TouchableOpacity
          key={`${f.carrier}${f.number}-${idx}`}
          style={[styles.flightDetailsCard, { marginTop: 0 }]}
          activeOpacity={0.7}
          onPress={() => onSelect(f)}
        >
          <Text style={styles.flightNumberText}>
            {f.carrier} {f.number}
          </Text>
          <View style={styles.flightDetailsTable}>
            <View style={styles.flightDetailsRowsWrapper}>
              <View style={styles.flightConnectorLine} />
              <View style={styles.flightDetailsRow}>
                <View style={styles.flightDetailsCellCity}>
                  <Ionicons
                    name="airplane"
                    size={18}
                    color={palette.successDeep}
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                  <Text style={styles.flightCityText} numberOfLines={1}>
                    {f.origin_city}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellDate}>
                  <Text style={styles.flightDate}>
                    {new Date(f.dep_local).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellTime}>
                  <Text style={styles.flightTime}>
                    {new Date(f.dep_local).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellArrow} />
              </View>
              <View style={styles.flightDetailsRow}>
                <View style={styles.flightDetailsCellCity}>
                  <Ionicons
                    name="airplane"
                    size={18}
                    color={palette.successDeep}
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                  <Text style={styles.flightCityText} numberOfLines={1}>
                    {f.dest_city}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellDate}>
                  <Text style={styles.flightDate}>
                    {new Date(f.arr_local).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellTime}>
                  <Text style={styles.flightTime}>
                    {new Date(f.arr_local).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </View>
                <View style={styles.flightDetailsCellArrow} />
              </View>
              <View style={styles.flightDetailsChevronWrap}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={palette.successDeep}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/** Takes the same `flight` bag useFlightEntry produces, plus its handlers. */
interface FlightLookupStepProps {
  flight: FlightLookupState;
  handlers: FlightLookupHandlers;
}

interface FlightLookupState {
  flightCarrier: string;
  flightNumber: string;
  detectedAirline: string | null;
  isLookingUpFlight: boolean;
  flightNotFound: boolean;
  flightLookupResult: FlightOption | null;
  flightSuggestions: FlightOption[];
  flightSegments: FlightOption[];
  flightDetailsExpanded: boolean;
}

interface FlightLookupHandlers {
  onFlightCarrierChange: (v: string) => void;
  onFlightNumberChange: (v: string) => void;
  onSelectFlightSuggestion: (flight: FlightOption) => void;
  onFlightDetailsExpand: (v: boolean) => void;
  onAddAnotherFlight: () => void;
  onConfirmFlightTrip: () => void;
  onShowManualEntry: () => void;
  onEditSegment?: (index: number) => void;
}

const FlightLookupStep: React.FC<FlightLookupStepProps> = ({
  flight,
  handlers,
}) => {
  const {
    flightCarrier,
    flightNumber,
    detectedAirline,
    isLookingUpFlight,
    flightNotFound,
    flightLookupResult,
    flightSuggestions,
    flightSegments,
    flightDetailsExpanded,
  } = flight;
  const {
    onFlightCarrierChange,
    onFlightNumberChange,
    onSelectFlightSuggestion,
    onFlightDetailsExpand,
    onAddAnotherFlight,
    onConfirmFlightTrip,
    onShowManualEntry,
    onEditSegment,
  } = handlers;
  return (
    <>
      <FlightSegmentCards
        flightSegments={flightSegments}
        onEditSegment={onEditSegment}
      />

      {!flightDetailsExpanded && (
        <>
          {detectedAirline ? (
            <View style={styles.airlineHeader}>
              <Text style={styles.airlineName}>{detectedAirline}</Text>
            </View>
          ) : (
            <View style={styles.airlineHeader}>
              <Text style={styles.airlineName}>Flight Number</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.flightInputRow}>
              <View style={styles.flightCarrierInput}>
                <TextInput
                  style={styles.textInput}
                  value={flightCarrier}
                  onChangeText={onFlightCarrierChange}
                  placeholder="AA"
                  placeholderTextColor={palette.textSecondary}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
              <View style={styles.flightNumberInput}>
                <TextInput
                  style={styles.textInput}
                  value={flightNumber}
                  onChangeText={onFlightNumberChange}
                  placeholder="128"
                  placeholderTextColor={palette.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {!flightLookupResult && (
            <FlightSuggestionsList
              suggestions={flightSuggestions}
              onSelect={onSelectFlightSuggestion}
            />
          )}

          <FlightDetailsCard
            flightLookupResult={flightLookupResult}
            flightDetailsExpanded={flightDetailsExpanded}
            onFlightDetailsExpand={onFlightDetailsExpand}
          />
        </>
      )}

      {flightDetailsExpanded && (
        <FlightDetailsCard
          flightLookupResult={flightLookupResult}
          flightDetailsExpanded={flightDetailsExpanded}
          onFlightDetailsExpand={onFlightDetailsExpand}
        />
      )}

      {((flightDetailsExpanded && flightLookupResult) ||
        (flightSegments.length > 0 && !flightLookupResult)) && (
        <View style={styles.flightActionsContainer}>
          <TouchableOpacity
            style={styles.addAnotherFlightButton}
            onPress={onAddAnotherFlight}
          >
            <Ionicons name="add" size={18} color={palette.successDeep} />
            <Text style={styles.addAnotherFlightText}>Add another flight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onConfirmFlightTrip}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={palette.textPrimary}
            />
          </TouchableOpacity>
        </View>
      )}

      {isLookingUpFlight && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={palette.link} />
          <Text style={styles.loadingText}>Looking up flight...</Text>
        </View>
      )}

      {flightNotFound &&
        !isLookingUpFlight &&
        flightSuggestions.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Ionicons
              name="airplane-outline"
              size={32}
              color={palette.textSecondary}
            />
            <Text
              style={{
                color: palette.textPrimary,
                fontSize: 16,
                fontWeight: "600",
                marginTop: 10,
              }}
            >
              No flight found
            </Text>
            <Text
              style={{
                color: palette.textSecondary,
                fontSize: 14,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Try a different flight number or enter details manually
            </Text>
          </View>
        )}

      <TouchableOpacity
        style={[styles.manualEntryButton, { marginTop: 16 }]}
        onPress={onShowManualEntry}
      >
        <Text style={styles.manualEntryButtonText}>
          Enter details manually instead
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default FlightLookupStep;
