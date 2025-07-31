import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  Keyboard,
} from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { useSettings } from '~/hooks/useSettings';
import { useArretsCsv } from '~/hooks/useArretsCsv';
import { useCurrentStop } from '~/hooks/useCurrentStop';
import { useDepartureService } from '~/hooks/useDepartureService';
import DepartureService, { type Stop } from '~/services/DepartureService';
import { 
  screenDimensions, 
  animations
} from '~/utils/responsive';

import { SearchSection } from '../organisms/SearchSection';
import { SuggestionsList } from '../organisms/SuggestionsList';
import { VehicleFilters } from '../organisms/VehicleFilters';
import { DeparturesList } from '../organisms/DeparturesList';
import { ResponsiveLayout } from '../layout/ResponsiveLayout';
import { PageHeader } from '../layout/PageHeader';
import { Toast } from '../Toast';

export const StopsPage: React.FC = () => {
  const { language } = useSettings();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [vehicleNumberFilters, setVehicleNumberFilters] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [vehicleOrder, setVehicleOrder] = useState<string[]>([]);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'warning' | 'info'>('error');

  // Toast helper function
  const showToast = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  // Watch for departure errors and show toast
  useEffect(() => {
    if (departuresError) {
      showToast(departuresError, 'error');
    }
  }, [departuresError, showToast]);

  // Animated Values
  const animationProgress = useSharedValue(0);
  const searchEntranceProgress = useSharedValue(0);
  const filtersEntranceProgress = useSharedValue(0);
  const departureCardsVisible = useSharedValue(true);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const departureService = useRef(DepartureService.getInstance());

  // Hooks
  const { currentStop, setCurrentStop } = useCurrentStop();
  const { findNearestStop } = useArretsCsv();
  const {
    departures,
    currentStopName,
    loading: departuresLoading,
    error: departuresError,
    refreshing,
    fetchDepartures,
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh,
  } = useDepartureService();

  // Keyboard listeners
  useFocusEffect(
    React.useCallback(() => {
      const onKeyboardShow = () => setInputFocused(true);
      const onKeyboardHide = () => setInputFocused(false);

      const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
      const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [])
  );

  // Animation styles
  const animatedSearchEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - searchEntranceProgress.value) * screenDimensions.width }],
    opacity: searchEntranceProgress.value,
  }));

  const animatedFiltersEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - filtersEntranceProgress.value) * -screenDimensions.width }],
    opacity: filtersEntranceProgress.value,
  }));

  const animatedFiltersStyle = useAnimatedStyle(() => ({
    opacity: 1 - animationProgress.value,
    transform: [{ translateX: -animationProgress.value * screenDimensions.width }],
  }));

  const animatedDeparturesStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animationProgress.value * screenDimensions.height }],
  }));

  const animatedSuggestionsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - animationProgress.value) * -animations.translate.large * 4 }],
    opacity: animationProgress.value,
  }));

  // Entrance animations
  useEffect(() => {
    const duration = 800;
    const easing = Easing.out(Easing.exp);

    searchEntranceProgress.value = withDelay(200, withTiming(1, { duration, easing }));
    filtersEntranceProgress.value = withDelay(400, withTiming(1, { duration, easing }));
  }, [searchEntranceProgress, filtersEntranceProgress]);

  // Focus animations
  useEffect(() => {
    const shouldSlideDown = inputFocused;

    if (shouldSlideDown) {
      departureCardsVisible.value = false;
      const maxCardDelay = departures.length > 0 ? (departures.length - 1) * 50 + 300 : 0;
      const borderDelay = maxCardDelay + 100;

      animationProgress.value = withDelay(borderDelay, withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.ease)
      }));
    } else {
      animationProgress.value = withTiming(0, {
        duration: 600,
        easing: Easing.inOut(Easing.ease)
      });
      departureCardsVisible.value = withDelay(600, withTiming(1, { duration: 0 }));
    }
  }, [inputFocused, departures.length, animationProgress, departureCardsVisible]);

  // Search functionality
  const handleSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await departureService.current.getStopSuggestions(query);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const onSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(text);
      }, 300);
    },
    [handleSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Stop selection
  const handleStopSelect = useCallback(
    async (stop: Stop) => {
      setSelectedStop(stop);
      setCurrentStop(stop);
      setSuggestions([]);
      setInputFocused(false);
      Keyboard.dismiss();
      setSearchQuery('');
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      try {
        await fetchDepartures(stop, vehicleNumberFilters);
        startAutoRefresh(stop, vehicleNumberFilters);
      } catch (error) {
        console.error('Error fetching departures or starting auto-refresh:', error);
      }
    },
    [fetchDepartures, startAutoRefresh, vehicleNumberFilters, setCurrentStop]
  );

  // Location detection
  const findNearestStopLocation = useCallback(async () => {
    if (locationLoading || searchLoading) return;
    setLocationLoading(true);
    try {
      const nearestStop = await findNearestStop();
      if (nearestStop && !('error' in nearestStop)) {
        await handleStopSelect({ id: nearestStop.id, rawName: nearestStop.name });
      } else {
        showToast(
          language === 'en' ? 'No stops found nearby' : 'Aucun arrêt trouvé à proximité',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error finding nearest stop:', error);
      showToast(
        language === 'en'
          ? 'Error detecting location'
          : 'Erreur lors de la détection de la position',
        'error'
      );
    } finally {
      setLocationLoading(false);
    }
  }, [findNearestStop, handleStopSelect, language, locationLoading, searchLoading, showToast]);

  // Vehicle filter management
  const addVehicleNumberFilter = useCallback(() => {
    if (!vehicleNumberInput.trim()) return;
    const newFilter = vehicleNumberInput.trim();
    if (!vehicleNumberFilters.includes(newFilter)) {
      const newFilters = [...vehicleNumberFilters, newFilter];
      setVehicleNumberFilters(newFilters);
      if (selectedStop) {
        startAutoRefresh(selectedStop, newFilters);
      }
    }
    setVehicleNumberInput('');
  }, [vehicleNumberInput, vehicleNumberFilters, selectedStop, startAutoRefresh]);

  const removeVehicleNumberFilter = useCallback(
    (number: string) => {
      const newFilters = vehicleNumberFilters.filter((n) => n !== number);
      setVehicleNumberFilters(newFilters);
      if (selectedStop) {
        startAutoRefresh(selectedStop, newFilters);
      }
    },
    [vehicleNumberFilters, selectedStop, startAutoRefresh]
  );

  // Manual refresh
  const handleManualRefresh = useCallback(async () => {
    if (!selectedStop) return;
    try {
      await manualRefresh();
    } catch {
      showToast(
        language === 'en'
          ? 'Failed to refresh departures'
          : 'Échec du rafraîchissement des départs',
        'error'
      );
    }
  }, [selectedStop, manualRefresh, language, showToast]);

  // Initialize with current stop
  useEffect(() => {
    if (currentStop && !selectedStop) {
      setSelectedStop(currentStop);
      startAutoRefresh(currentStop, vehicleNumberFilters);
    }
  }, [currentStop, selectedStop, startAutoRefresh, vehicleNumberFilters]);

  // Update search query when currentStopName changes
  useEffect(() => {
    if (currentStopName && !inputFocused) {
      setSearchQuery(currentStopName);
    }
  }, [currentStopName, inputFocused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [stopAutoRefresh]);

  // Reset vehicle order when selectedStop changes
  useEffect(() => {
    setVehicleOrder([]);
  }, [selectedStop]);

  // Establish and maintain vehicle order
  useEffect(() => {
    if (departures.length > 0) {
      const currentVehicleKeys = departures.map(dep => `${dep.vehicleType}-${dep.number}`);

      setVehicleOrder(prevOrder => {
        if (prevOrder.length === 0) {
          return currentVehicleKeys;
        } else {
          const newVehicles = currentVehicleKeys.filter(key => !prevOrder.includes(key));
          return [...prevOrder, ...newVehicles];
        }
      });
    }
  }, [departures]);

  return (
    <ResponsiveLayout>
      {/* Header */}
      <PageHeader
        title={language === 'en' ? 'TPG Times' : 'Horaires TPG'}
      />

          {/* Search Section */}
          <SearchSection
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchFocus={() => setInputFocused(true)}
            onSearchBlur={() => setInputFocused(false)}
            onClearSearch={clearSearch}
            onLocationPress={findNearestStopLocation}
            searchLoading={searchLoading}
            locationLoading={locationLoading}
            animatedStyle={animatedSearchEntranceStyle}
          />

          {/* Suggestions */}
          <SuggestionsList
            suggestions={suggestions}
            onStopSelect={handleStopSelect}
            visible={inputFocused && suggestions.length > 0}
            animatedStyle={animatedSuggestionsStyle}
          />

          {/* Vehicle Filters */}
          <VehicleFilters
            vehicleNumberInput={vehicleNumberInput}
            onVehicleNumberInputChange={setVehicleNumberInput}
            onAddFilter={addVehicleNumberFilter}
            filters={vehicleNumberFilters}
            onRemoveFilter={removeVehicleNumberFilter}
            animatedStyle={[animatedFiltersStyle, animatedFiltersEntranceStyle]}
          />

      {/* Departures List */}
      {selectedStop && (
        <DeparturesList
          departures={departures}
          vehicleOrder={vehicleOrder}
          loading={departuresLoading}
          refreshing={refreshing}
          onRefresh={handleManualRefresh}
          animatedStyle={animatedDeparturesStyle}
        />
      )}

      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </ResponsiveLayout>
  );
};

