import React, { useEffect, useRef, useCallback } from "react";
import { View, Keyboard, StatusBar, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./TravelScreen.styles";
import PagerView from "react-native-pager-view";
import { useHealthData } from "@shared/context/HealthDataContext";
import { useReduceMotion } from "@shared/utils/reduceMotion";
import TravelHeader from "./components/TravelHeader";
import TravelTabBar from "./components/TravelTabBar";
import SearchTab from "./components/SearchTab";
import TripPlanningTab from "./components/TripPlanningTab";
import AddTripModal from "./components/AddTripModal";
import EditTripModal from "./components/EditTripModal";
import EmergencyModal from "./components/EmergencyModal";
import { createTravelHandlers } from "./hooks/useTravelHandlers";
import { useTravelState, popularCities } from "./hooks/useTravelState";
import { useStaggerReveal } from "./hooks/useStaggerReveal";
import { useStableCallbacks } from "./hooks/useStableCallbacks";
import { palette } from "@shared/theme/colors";

const TravelScreen: React.FC = () => {
  const reduceMotion = useReduceMotion();
  const { travelHealth, getCurrentLocation, updateTravelHealthData } =
    useHealthData();

  const fadeOpacity = useRef(new Animated.Value(0)).current;

  const s = useTravelState();
  useStaggerReveal({
    selectedLocation: s.selectedLocation,
    isLoading: s.isLoading,
    reduceMotion,
    resultsOpacity: s.resultsOpacity,
    getRowAnim: s.getRowAnim,
  });

  useEffect(() => {
    if (travelHealth && travelHealth.apiErrors) {
      s.setApiErrors(travelHealth.apiErrors);
    } else {
      s.setApiErrors({});
    }
  }, [travelHealth]);

  // Rebuilt every render so it always closes over current state, then handed to
  // children through a stable façade so their React.memo actually holds.
  const h = useStableCallbacks(
    createTravelHandlers({
      s,
      travelHealth,
      updateTravelHealthData,
      getCurrentLocation,
    }),
  );

  // Latest-state ref: lets the JSX callbacks below be created once while still
  // reading current values when they fire.
  const sRef = useRef(s);
  sRef.current = s;

  // These three only close over values that are stable for the life of the
  // screen (state setters, useRef handles, Animated.Values), so they can be
  // created once. That in turn lets the memoised children below actually skip
  // re-rendering while the user types in the search field.
  const handleChildScroll = useCallback(
    (offsetY: number) => {
      // Show gradient only when scrolled past 10px
      const target = offsetY > 10 ? 1 : 0;
      fadeOpacity.setValue(target);
    },
    [fadeOpacity],
  );

  const { setActiveTab, pagerRef, tripModalTranslateY, setShowAddTripModal } =
    s;

  const handleTabPress = useCallback(
    (tab: "health" | "trips", pageIndex: number) => {
      setActiveTab(tab);
      try {
        pagerRef.current?.setPage?.(pageIndex);
      } catch {
        /* pager navigation failure is non-fatal */
      }
    },
    [setActiveTab, pagerRef],
  );

  const handleOpenAddTrip = useCallback(() => {
    tripModalTranslateY.setValue(1000);
    Animated.spring(tripModalTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setShowAddTripModal(true);
  }, [tripModalTranslateY, setShowAddTripModal]);

  // Search-field callbacks. Created once and reading through sRef, so SearchTab's
  // props stay referentially stable between renders.
  const handleInputChange = useCallback((text: string) => {
    const st = sRef.current;
    st.setInputText(text);
    st.setSearchLocation(text);
    st.setSelectedLocation("");
    st.setShowInlineSuggestions(!!text.trim());
  }, []);

  const handleDismissSuggestions = useCallback(() => {
    sRef.current.setShowInlineSuggestions(false);
  }, []);

  /** Commit a typed value as the chosen location and kick off the lookup. */
  const commitSearch = useCallback((value: string) => {
    const st = sRef.current;
    st.setShowInlineSuggestions(false);
    st.setCitySearchResults([]);
    st.setFilteredCities([]);
    st.setSelectedLocation(value);
    st.setSearchLocation(value);
    st.setInputText(value);
    h.handleLocationSelect(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputEndEditing = useCallback(() => {
    const st = sRef.current;
    const trimmed = st.inputText.trim();
    if (!trimmed || trimmed === st.selectedLocation) return;
    commitSearch(trimmed);
  }, [commitSearch]);

  const handleInputSubmit = useCallback(() => {
    const trimmed = sRef.current.inputText.trim();
    if (!trimmed) return;
    commitSearch(trimmed);
    Keyboard.dismiss();
  }, [commitSearch]);

  const handleClearSearch = useCallback(() => {
    const st = sRef.current;
    st.setInputText("");
    st.setSearchLocation("");
    st.setFilteredCities(popularCities.slice(0, 8));
    st.setShowInlineSuggestions(true);
  }, []);

  const handleFocusSearch = useCallback(() => {
    // Always surface the popular cities on focus. (Previously gated on an empty
    // input, so after a city was selected its name stayed in the input and the
    // popular list never came back — leaving only "Use current location".)
    // Typing still narrows the list live.
    const st = sRef.current;
    if (!st.inputText.trim() || st.inputText.trim() === st.selectedLocation) {
      st.setFilteredCities(popularCities.slice(0, 8));
    }
    st.setShowInlineSuggestions(true);
  }, []);

  const handleShowAddTripModal = useCallback(() => {
    sRef.current.setShowAddTripModal(true);
  }, []);

  const handleCloseEmergency = useCallback(() => {
    sRef.current.setShowEmergencyModal(false);
  }, []);

  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      sRef.current.setActiveTab(
        e.nativeEvent.position === 0 ? "health" : "trips",
      );
    },
    [],
  );

  // ── Add-trip modal callbacks ──────────────────────────────────────────────
  const handleFlightCarrierChange = useCallback((v: string) => {
    sRef.current.setFlightCarrier(v);
    sRef.current.setFlightNotFound(false);
  }, []);

  const handleFlightNumberChange = useCallback((v: string) => {
    sRef.current.setFlightNumber(v);
    sRef.current.setFlightNotFound(false);
  }, []);

  const handleShowManualEntry = useCallback(() => {
    sRef.current.setShowManualEntry(true);
  }, []);

  const handleHideManualEntry = useCallback(() => {
    sRef.current.setShowManualEntry(false);
  }, []);

  const handleSetDepartureLocation = useCallback((v: string) => {
    sRef.current.setNewTripDepartureLocation(v);
    sRef.current.setDepartureSuggestions([]);
  }, []);

  const handleSetDestination = useCallback((v: string) => {
    sRef.current.setNewTripDestination(v);
    sRef.current.setTripSuggestions([]);
  }, []);

  const handleShowDatePicker = useCallback(
    (type: "departure" | "return" | "departureTime" | "returnTime") => {
      const st = sRef.current;
      let initial: Date;
      if (type === "departure") initial = st.newTripDepartureDate || new Date();
      else if (type === "return") initial = st.newTripReturnDate || new Date();
      else if (type === "departureTime")
        initial = st.newTripDepartureTime || new Date();
      else initial = st.newTripReturnTime || new Date();
      st.setTempDatePickerValue(initial);
      st.setShowDatePicker(type);
    },
    [],
  );

  // ── Edit-trip modal callbacks ─────────────────────────────────────────────
  const handleCloseEditTrip = useCallback(() => {
    sRef.current.setShowEditTripModal(false);
  }, []);

  const handleDeleteEditingTrip = useCallback(() => {
    const st = sRef.current;
    if (st.editingTrip) h.handleDeleteTrip(st.editingTrip.id);
    st.setShowEditTripModal(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetEditDepartureLocation = useCallback((v: string) => {
    sRef.current.setEditTripDepartureLocation(v);
    sRef.current.setEditTripDepartureSuggestions([]);
  }, []);

  const handleSetEditDestination = useCallback((v: string) => {
    sRef.current.setEditTripDestination(v);
    sRef.current.setEditTripSuggestions([]);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={palette.bg} />

      <TravelHeader />

      <TravelTabBar
        activeTab={s.activeTab}
        onTabPress={handleTabPress}
        onAddTrip={handleOpenAddTrip}
      />

      <View style={{ flex: 1 }}>
        <Animated.View
          style={[fadeStyles.topFade, { opacity: fadeOpacity }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[palette.bg, "rgba(0,0,0,0)"]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <PagerView
          style={styles.pager}
          initialPage={0}
          ref={s.pagerRef}
          onPageSelected={handlePageSelected}
        >
          <View key="search">
            <SearchTab
              inputText={s.inputText}
              searchLocation={s.searchLocation}
              selectedLocation={s.selectedLocation}
              showInlineSuggestions={s.showInlineSuggestions}
              isLoading={s.isLoading}
              isRefreshing={s.isRefreshing}
              isGettingLocation={s.isGettingLocation}
              isSearchingCities={s.isSearchingCities}
              filteredCities={s.filteredCities}
              citySearchResults={s.citySearchResults}
              popularCities={popularCities}
              travelHealth={travelHealth}
              apiErrors={s.apiErrors}
              resultsOpacity={s.resultsOpacity}
              resultsTranslateY={s.resultsTranslateY}
              getRowAnim={s.getRowAnim}
              onInputChange={handleInputChange}
              onLocationSelect={h.handleLocationSelect}
              onGetCurrentLocation={h.handleGetCurrentLocationForSearch}
              onRefresh={h.handleRefresh}
              onEmergencyContactPress={h.handleEmergencyContactPress}
              onDismissSuggestions={handleDismissSuggestions}
              onInputEndEditing={handleInputEndEditing}
              onInputSubmit={handleInputSubmit}
              onClearSearch={handleClearSearch}
              onFocusSearch={handleFocusSearch}
              onScrollOffset={handleChildScroll}
            />
          </View>

          <View key="trips">
            <TripPlanningTab
              trips={s.trips}
              tripModalTranslateY={s.tripModalTranslateY}
              onOpenAddTrip={handleShowAddTripModal}
              onEditTrip={h.handleModifyTripDates}
              onDeleteTrip={h.handleDeleteTrip}
              onScrollOffset={handleChildScroll}
            />
          </View>
        </PagerView>
      </View>

      <EmergencyModal
        visible={s.showEmergencyModal}
        onClose={handleCloseEmergency}
      />

      <AddTripModal
        visible={s.showAddTripModal}
        tripModalTranslateY={s.tripModalTranslateY}
        flightCarrier={s.flightCarrier}
        flightNumber={s.flightNumber}
        detectedAirline={s.detectedAirline}
        isLookingUpFlight={s.isLookingUpFlight}
        flightNotFound={s.flightNotFound}
        flightLookupResult={s.flightLookupResult}
        flightSuggestions={s.flightSuggestions}
        flightSegments={s.flightSegments}
        flightDetailsExpanded={s.flightDetailsExpanded}
        showManualEntry={s.showManualEntry}
        newTripDepartureLocation={s.newTripDepartureLocation}
        newTripDestination={s.newTripDestination}
        newTripDepartureDate={s.newTripDepartureDate}
        newTripReturnDate={s.newTripReturnDate}
        newTripDepartureTime={s.newTripDepartureTime}
        newTripReturnTime={s.newTripReturnTime}
        showDatePicker={s.showDatePicker}
        tempDatePickerValue={s.tempDatePickerValue}
        tripSuggestions={s.tripSuggestions}
        departureSuggestions={s.departureSuggestions}
        isGettingLocation={s.isGettingLocation}
        onClose={h.handleCloseAddTrip}
        onFlightCarrierChange={handleFlightCarrierChange}
        onFlightNumberChange={handleFlightNumberChange}
        onSelectFlightSuggestion={h.handleSelectFlightSuggestion}
        onFlightLookup={h.handleFlightLookup}
        onFlightDetailsExpand={s.setFlightDetailsExpanded}
        onAddAnotherFlight={h.handleAddAnotherFlight}
        onConfirmFlightTrip={h.handleConfirmFlightTrip}
        onEditSegment={h.handleEditSegment}
        onShowManualEntry={handleShowManualEntry}
        onHideManualEntry={handleHideManualEntry}
        onAddTrip={h.handleAddTrip}
        onDepartureLocationChange={s.setNewTripDepartureLocation}
        onDestinationChange={s.setNewTripDestination}
        onSetDepartureLocation={handleSetDepartureLocation}
        onSetDestination={handleSetDestination}
        onShowDatePicker={handleShowDatePicker}
        onDateChange={h.handleDateChange}
        onDateConfirm={h.handleDateConfirm}
        onDateCancel={h.handleDateCancel}
        onGetCurrentLocation={h.handleGetCurrentLocationForTrip}
      />

      <EditTripModal
        visible={s.showEditTripModal}
        editingTripId={s.editingTrip?.id ?? null}
        editTripDepartureLocation={s.editTripDepartureLocation}
        editTripDestination={s.editTripDestination}
        editTripDepartureDate={s.editTripDepartureDate}
        editTripReturnDate={s.editTripReturnDate}
        editTripNotes={s.editTripNotes}
        showEditDatePicker={s.showEditDatePicker}
        tempEditDatePickerValue={s.tempEditDatePickerValue}
        editTripSuggestions={s.editTripSuggestions}
        editTripDepartureSuggestions={s.editTripDepartureSuggestions}
        isGettingLocation={s.isGettingLocation}
        onClose={handleCloseEditTrip}
        onDelete={handleDeleteEditingTrip}
        onSave={h.handleSaveEditTrip}
        onDepartureLocationChange={s.setEditTripDepartureLocation}
        onDestinationChange={s.setEditTripDestination}
        onNotesChange={s.setEditTripNotes}
        onSetDepartureLocation={handleSetEditDepartureLocation}
        onSetDestination={handleSetEditDestination}
        onShowEditDatePicker={s.setShowEditDatePicker}
        onEditDateChange={h.handleEditDateChange}
        onEditDateConfirm={h.handleEditDateConfirm}
        onEditDateCancel={h.handleEditDateCancel}
        onGetCurrentLocation={h.handleGetCurrentLocationForEdit}
      />
    </View>
  );
};

const fadeStyles = StyleSheet.create({
  topFade: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 32,
    zIndex: 10,
  },
});

export default TravelScreen;
