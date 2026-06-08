import React, { useEffect, useRef } from 'react';
import { View, Keyboard, StatusBar, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './TravelScreen.styles';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TravelStackParamList } from '../../../../shared/types';
import PagerView from 'react-native-pager-view';
import { useHealthData } from '../../../../shared/context/HealthDataContext';
import { useReduceMotion } from '../../../../shared/utils/reduceMotion';
import TravelHeader from './components/TravelHeader';
import TravelTabBar from './components/TravelTabBar';
import SearchTab from './components/SearchTab';
import TripPlanningTab from './components/TripPlanningTab';
import AddTripModal from './components/AddTripModal';
import EditTripModal from './components/EditTripModal';
import EmergencyModal from './components/EmergencyModal';
import MetricDetailModal from './components/MetricDetailModal';
import { createTravelHandlers } from './hooks/useTravelHandlers';
import { useTravelState, popularCities } from './hooks/useTravelState';
import { useCurtainReveal } from './hooks/useCurtainReveal';
import { useTypewriter } from './hooks/useTypewriter';

type Nav = CompositeNavigationProp<
  StackNavigationProp<TravelStackParamList, 'TravelList'>,
  StackNavigationProp<RootStackParamList>
>;

const USE_CURTAIN_REVEAL = true;

const TravelScreen: React.FC = () => {
  const reduceMotion = useReduceMotion();
  const { travelHealth, getCurrentLocation, updateTravelHealthData } = useHealthData();

  const fadeOpacity = useRef(new Animated.Value(0)).current;

  const s = useTravelState();
  const typedCityText = useTypewriter(popularCities.slice(0, 8));
  const curtain = useCurtainReveal({
    selectedLocation: s.selectedLocation,
    isLoading: s.isLoading,
    reduceMotion,
    resultsOpacity: s.resultsOpacity,
    getRowAnim: s.getRowAnim,
  });

  useEffect(() => {
    if (travelHealth && (travelHealth as any).apiErrors) {
      s.setApiErrors((travelHealth as any).apiErrors);
    } else {
      s.setApiErrors({});
    }
  }, [travelHealth]);

  const h = createTravelHandlers({
    s,
    travelHealth,
    updateTravelHealthData,
    getCurrentLocation,
    contentMeasuredHeight: curtain.contentMeasuredHeight,
    setContentMeasuredHeight: curtain.setContentMeasuredHeight,
  });

  const handleChildScroll = (offsetY: number) => {
    // Show gradient only when scrolled past 10px
    const target = offsetY > 10 ? 1 : 0;
    fadeOpacity.setValue(target);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <TravelHeader />

      <TravelTabBar
        activeTab={s.activeTab}
        onTabPress={(tab, pageIndex) => {
          s.setActiveTab(tab);
          try { s.pagerRef.current?.setPage?.(pageIndex); } catch { /* pager navigation failure is non-fatal */ }
        }}
        onAddTrip={() => {
          s.tripModalTranslateY.setValue(1000);
          Animated.spring(s.tripModalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
          s.setShowAddTripModal(true);
        }}
      />

      <View style={{ flex: 1 }}>
        <Animated.View style={[fadeStyles.topFade, { opacity: fadeOpacity }]} pointerEvents="none">
          <LinearGradient
            colors={['#000000', 'rgba(0,0,0,0)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <PagerView
          style={styles.pager}
          initialPage={0}
          ref={s.pagerRef}
          onPageSelected={(e) => {
            s.setActiveTab(e.nativeEvent.position === 0 ? 'health' : 'trips');
          }}
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
            typedCityText={typedCityText}
            popularCities={popularCities}
            travelHealth={travelHealth}
            resultsOpacity={s.resultsOpacity}
            resultsTranslateY={s.resultsTranslateY}
            contentMeasuredHeight={curtain.contentMeasuredHeight}
            curtainAnimationComplete={curtain.curtainAnimationComplete}
            coverTranslate={curtain.coverTranslate}
            getRowAnim={s.getRowAnim}
            USE_CURTAIN_REVEAL={USE_CURTAIN_REVEAL}
            onInputChange={(text) => {
              s.setInputText(text); s.setSearchLocation(text);
              s.setSelectedLocation(''); s.setShowInlineSuggestions(!!text.trim());
            }}
            onLocationSelect={h.handleLocationSelect}
            onGetCurrentLocation={h.handleGetCurrentLocationForSearch}
            onRefresh={h.handleRefresh}
            onContentLayout={(height) => {
              if (height > 0 && (curtain.contentMeasuredHeight === 0 || Math.abs(height - curtain.contentMeasuredHeight) > 4)) {
                curtain.setContentMeasuredHeight(height);
              }
            }}
            onEmergencyContactPress={h.handleEmergencyContactPress}
            onDismissSuggestions={() => s.setShowInlineSuggestions(false)}
            onInputEndEditing={() => {
              const trimmed = s.inputText.trim();
              if (!trimmed || trimmed === s.selectedLocation) return;
              s.setShowInlineSuggestions(false); s.setCitySearchResults([]); s.setFilteredCities([]);
              s.setSelectedLocation(trimmed); s.setSearchLocation(trimmed); s.setInputText(trimmed);
              h.handleLocationSelect(trimmed);
            }}
            onInputSubmit={() => {
              if (s.inputText.trim()) {
                const submitted = s.inputText.trim();
                s.setShowInlineSuggestions(false); s.setCitySearchResults([]); s.setFilteredCities([]);
                s.setSelectedLocation(submitted); s.setSearchLocation(submitted); s.setInputText(submitted);
                h.handleLocationSelect(submitted); Keyboard.dismiss();
              }
            }}
            onClearSearch={() => {
              s.setInputText(''); s.setSearchLocation('');
              s.setFilteredCities(popularCities.slice(0, 8)); s.setShowInlineSuggestions(true);
            }}
            onFocusSearch={() => {
              if (!s.inputText.trim()) { s.setFilteredCities(popularCities.slice(0, 8)); s.setShowInlineSuggestions(true); }
            }}
            onScrollOffset={handleChildScroll}
          />
        </View>

        <View key="trips">
          <TripPlanningTab
            trips={s.trips}
            tripModalTranslateY={s.tripModalTranslateY}
            onOpenAddTrip={() => s.setShowAddTripModal(true)}
            onScrollOffset={handleChildScroll}
          />
        </View>
      </PagerView>
      </View>

      <EmergencyModal visible={s.showEmergencyModal} onClose={() => s.setShowEmergencyModal(false)} />

      <AddTripModal
        visible={s.showAddTripModal}
        tripModalTranslateY={s.tripModalTranslateY}
        flightCarrier={s.flightCarrier}
        flightNumber={s.flightNumber}
        detectedAirline={s.detectedAirline}
        isLookingUpFlight={s.isLookingUpFlight}
        flightNotFound={s.flightNotFound}
        flightLookupResult={s.flightLookupResult}
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
        onFlightCarrierChange={(v: string) => { s.setFlightCarrier(v); s.setFlightNotFound(false); }}
        onFlightNumberChange={(v: string) => { s.setFlightNumber(v); s.setFlightNotFound(false); }}
        onFlightLookup={h.handleFlightLookup}
        onFlightDetailsExpand={s.setFlightDetailsExpanded}
        onAddAnotherFlight={() => {
          if (s.flightLookupResult) {
            s.setFlightSegments(prev => [...prev, s.flightLookupResult]);
            s.setFlightLookupResult(null); s.setFlightCarrier('');
            s.setFlightNumber(''); s.setFlightDetailsExpanded(false);
          }
        }}
        onConfirmFlightTrip={h.handleConfirmFlightTrip}
        onShowManualEntry={() => s.setShowManualEntry(true)}
        onHideManualEntry={() => s.setShowManualEntry(false)}
        onAddTrip={h.handleAddTrip}
        onDepartureLocationChange={s.setNewTripDepartureLocation}
        onDestinationChange={s.setNewTripDestination}
        onSetDepartureLocation={(v) => { s.setNewTripDepartureLocation(v); s.setDepartureSuggestions([]); }}
        onSetDestination={(v) => { s.setNewTripDestination(v); s.setTripSuggestions([]); }}
        onShowDatePicker={(type) => {
          let initial: Date;
          if (type === 'departure') initial = s.newTripDepartureDate || new Date();
          else if (type === 'return') initial = s.newTripReturnDate || new Date();
          else if (type === 'departureTime') initial = s.newTripDepartureTime || new Date();
          else initial = s.newTripReturnTime || new Date();
          s.setTempDatePickerValue(initial);
          s.setShowDatePicker(type);
        }}
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
        onClose={() => s.setShowEditTripModal(false)}
        onDelete={() => { if (s.editingTrip) h.handleDeleteTrip(s.editingTrip.id); s.setShowEditTripModal(false); }}
        onSave={h.handleSaveEditTrip}
        onDepartureLocationChange={s.setEditTripDepartureLocation}
        onDestinationChange={s.setEditTripDestination}
        onNotesChange={s.setEditTripNotes}
        onSetDepartureLocation={(v) => { s.setEditTripDepartureLocation(v); s.setEditTripDepartureSuggestions([]); }}
        onSetDestination={(v) => { s.setEditTripDestination(v); s.setEditTripSuggestions([]); }}
        onShowEditDatePicker={s.setShowEditDatePicker}
        onEditDateChange={h.handleEditDateChange}
        onEditDateConfirm={h.handleEditDateConfirm}
        onEditDateCancel={h.handleEditDateCancel}
        onGetCurrentLocation={h.handleGetCurrentLocationForEdit}
      />

      <MetricDetailModal visible={s.metricModalVisible} metric={s.selectedMetric} onClose={() => {}} />
    </View>
  );
};

const fadeStyles = StyleSheet.create({
  topFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 32,
    zIndex: 10,
  },
});

export default TravelScreen;
