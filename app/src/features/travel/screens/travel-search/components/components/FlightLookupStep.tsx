import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TravelScreen.styles';

interface FlightDetailsCardProps {
  flightLookupResult: any;
  flightDetailsExpanded: boolean;
  onFlightDetailsExpand: (v: boolean) => void;
}

export const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({
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
          <View style={styles.flightDetailsRow}>
            <View style={styles.flightDetailsCellCity}>
              <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
              <Text style={styles.flightCityText} numberOfLines={1}>{flightLookupResult.origin_city}</Text>
            </View>
            <View style={styles.flightDetailsCellDate}>
              <Text style={styles.flightDate}>
                {new Date(flightLookupResult.dep_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.flightDetailsCellTime}>
              <Text style={styles.flightTime}>
                {new Date(flightLookupResult.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Text>
            </View>
            <View style={styles.flightDetailsCellArrow} />
          </View>
          <View style={styles.flightDetailsRow}>
            <View style={styles.flightDetailsCellCity}>
              <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
              <Text style={styles.flightCityText} numberOfLines={1}>{flightLookupResult.dest_city}</Text>
            </View>
            <View style={styles.flightDetailsCellDate}>
              <Text style={styles.flightDate}>
                {new Date(flightLookupResult.arr_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.flightDetailsCellTime}>
              <Text style={styles.flightTime}>
                {new Date(flightLookupResult.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </Text>
            </View>
            <View style={styles.flightDetailsCellArrow} />
          </View>
          {!flightDetailsExpanded && (
            <View style={styles.flightDetailsChevronWrap}>
              <Ionicons name="chevron-forward" size={20} color="#059669" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface FlightSegmentCardsProps {
  flightSegments: any[];
}

export const FlightSegmentCards: React.FC<FlightSegmentCardsProps> = ({ flightSegments }) => {
  if (flightSegments.length === 0) return null;

  return (
    <View>
      {flightSegments.map((seg, idx) => (
        <View key={idx} style={[styles.flightDetailsCard, styles.flightSegmentCard]}>
          <Text style={styles.flightNumberText}>{seg.carrier} {seg.number}</Text>
          <View style={styles.flightDetailsTable}>
            <View style={styles.flightDetailsRow}>
              <View style={styles.flightDetailsCellCity}>
                <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
                <Text style={styles.flightCityText} numberOfLines={1}>{seg.origin_city}</Text>
              </View>
              <View style={styles.flightDetailsCellDate}>
                <Text style={styles.flightDate}>
                  {new Date(seg.dep_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.flightDetailsCellTime}>
                <Text style={styles.flightTime}>
                  {new Date(seg.dep_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
              </View>
              <View style={styles.flightDetailsCellArrow} />
            </View>
            <View style={styles.flightDetailsRow}>
              <View style={styles.flightDetailsCellCity}>
                <Ionicons name="airplane" size={18} color="#059669" style={{ transform: [{ rotate: '-90deg' }] }} />
                <Text style={styles.flightCityText} numberOfLines={1}>{seg.dest_city}</Text>
              </View>
              <View style={styles.flightDetailsCellDate}>
                <Text style={styles.flightDate}>
                  {new Date(seg.arr_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.flightDetailsCellTime}>
                <Text style={styles.flightTime}>
                  {new Date(seg.arr_local).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
              </View>
              <View style={styles.flightDetailsCellArrow} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

interface FlightLookupStepProps {
  flightCarrier: string;
  flightNumber: string;
  detectedAirline: string | null;
  isLookingUpFlight: boolean;
  flightNotFound: boolean;
  flightLookupResult: any;
  flightSegments: any[];
  flightDetailsExpanded: boolean;
  onFlightCarrierChange: (v: string) => void;
  onFlightNumberChange: (v: string) => void;
  onFlightDetailsExpand: (v: boolean) => void;
  onAddAnotherFlight: () => void;
  onConfirmFlightTrip: () => void;
  onShowManualEntry: () => void;
}

const FlightLookupStep: React.FC<FlightLookupStepProps> = ({
  flightCarrier,
  flightNumber,
  detectedAirline,
  isLookingUpFlight,
  flightNotFound,
  flightLookupResult,
  flightSegments,
  flightDetailsExpanded,
  onFlightCarrierChange,
  onFlightNumberChange,
  onFlightDetailsExpand,
  onAddAnotherFlight,
  onConfirmFlightTrip,
  onShowManualEntry,
}) => {
  const hasFlights = Boolean(flightLookupResult) || flightSegments.length > 0;

  return (
    <>
      <FlightSegmentCards flightSegments={flightSegments} />

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
                  placeholderTextColor="#8E8E93"
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
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

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
          <TouchableOpacity style={styles.addAnotherFlightButton} onPress={onAddAnotherFlight}>
            <Ionicons name="add" size={18} color="#059669" />
            <Text style={styles.addAnotherFlightText}>Add another flight</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={onConfirmFlightTrip}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {isLookingUpFlight && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3AABF0" />
          <Text style={styles.loadingText}>Looking up flight...</Text>
        </View>
      )}

      {flightNotFound && !isLookingUpFlight && (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Ionicons name="airplane-outline" size={32} color="#8E8E93" />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 10 }}>
            No flight found
          </Text>
          <Text style={{ color: '#8E8E93', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            Try a different flight number or enter details manually
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.manualEntryButton, { marginTop: 16 }]}
        onPress={onShowManualEntry}
      >
        <Text style={styles.manualEntryButtonText}>Enter details manually instead</Text>
      </TouchableOpacity>
    </>
  );
};

export default FlightLookupStep;
