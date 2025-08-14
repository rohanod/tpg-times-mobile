import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Keyboard,
  View,
  StyleSheet,
} from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  useAnimatedReaction,
} from 'react-native-reanimated';

import { useSettings } from '~/hooks/useSettings';
import { useArretsCsv } from '~/hooks/useArretsCsv';
import { useCurrentStop } from '~/hooks/useCurrentStop';
import { useDepartureService } from '~/hooks/useDepartureService';
import type { Stop } from '~/services/DepartureService';
import { screenDimensions } from '~/utils/responsive';

import { SearchSection } from '../organisms/SearchSection';
import { VehicleFilters } from '../organisms/VehicleFilters';
import { DeparturesList } from '../organisms/DeparturesList';
import { ResponsiveLayout } from '../layout/ResponsiveLayout';
import { PageHeader } from '../layout/PageHeader';
import { Toast } from '../Toast';

export const StopsPage: React.FC = () => {
  const { language } = useSettings();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  // Suggestions disabled
  const [inputFocused, setInputFocused] = useState(false);
  const [vehicleFilterFocused, setVehicleFilterFocused] = useState(false);
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

  // Animated Values
  const animationProgress = useSharedValue(0);
  const searchEntranceProgress = useSharedValue(0);
  const filtersEntranceProgress = useSharedValue(0);
  const departuresEntranceProgress = useSharedValue(0);
  const departureCardsVisible = useSharedValue(1);
  const vehicleFilterMoveUpProgress = useSharedValue(0);

  // Refs
  // No suggestion debounce needed
  // const departureService = useRef(DepartureService.getInstance());
  const vehicleFilterFocusedRef = useRef(false);

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

  // Watch for departure errors and show toast
  useEffect(() => {
    if (departuresError) {
      showToast(departuresError, 'error');
    }
  }, [departuresError, showToast]);

  // Keyboard listeners
  useEffect(() => {
    const onKeyboardShow = () => {
      // Only set inputFocused if vehicle filter is not focused
      if (!vehicleFilterFocusedRef.current) {
        setInputFocused(true);
      }
    };
    const onKeyboardHide = () => {
      setInputFocused(false);
      vehicleFilterFocusedRef.current = false;
      setVehicleFilterFocused(false);
    };

    const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

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

  // Initial entrance for departures: slide up from bottom and fade in
  const animatedDeparturesEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - departuresEntranceProgress.value) * screenDimensions.height }],
    opacity: departuresEntranceProgress.value,
  }));

  // Suggestions disabled currently; keeping style prepared for future use
  // const animatedSuggestionsStyle = useAnimatedStyle(() => ({
  //   transform: [{ translateY: (1 - animationProgress.value) * -animations.translate.large * 4 }],
  //   opacity: animationProgress.value,
  // }));

  const animatedSearchHideStyle = useAnimatedStyle(() => ({
    opacity: 1 - vehicleFilterMoveUpProgress.value,
    transform: [{ translateY: -vehicleFilterMoveUpProgress.value * 60 }],
  }));

  const animatedVehicleFilterMoveUpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -vehicleFilterMoveUpProgress.value * 80 }],
  }));

  // Entrance animations
  useEffect(() => {
    const duration = 800;
    const easing = Easing.out(Easing.exp);

    searchEntranceProgress.value = withDelay(200, withTiming(1, { duration, easing }));
    filtersEntranceProgress.value = withDelay(400, withTiming(1, { duration, easing }));
  }, [searchEntranceProgress, filtersEntranceProgress]);

  // Start departures entrance as soon as both search and filters are fully on screen
  useAnimatedReaction(
    () => {
      'worklet';
      return searchEntranceProgress.value >= 1 && filtersEntranceProgress.value >= 1;
    },
    (ready, wasReady) => {
      'worklet';
      if (ready && !wasReady && departuresEntranceProgress.value < 1) {
        const duration = 700;
        const easing = Easing.out(Easing.exp);
        departuresEntranceProgress.value = withTiming(1, { duration, easing });
      }
    }
  );

  // Focus animations
  useEffect(() => {
    const shouldSlideDown = inputFocused;

    if (shouldSlideDown) {
      departureCardsVisible.value = 0;
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

  // Vehicle filter focus animations
  useEffect(() => {
    if (vehicleFilterFocused) {
      vehicleFilterMoveUpProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.inOut(Easing.ease)
      });
    } else {
      vehicleFilterMoveUpProgress.value = withTiming(0, {
        duration: 400,
        easing: Easing.inOut(Easing.ease)
      });
    }
  }, [vehicleFilterFocused, vehicleFilterMoveUpProgress]);

  const onSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Stop selection
  const handleStopSelect = useCallback(
    async (stop: Stop) => {
      setSelectedStop(stop);
      setCurrentStop(stop);
      setInputFocused(false);
      Keyboard.dismiss();
      setSearchQuery('');
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
    if (locationLoading) return;
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
  }, [findNearestStop, handleStopSelect, language, locationLoading, showToast]);

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

  // Vehicle filter focus handlers
  const handleVehicleFilterFocus = useCallback(() => {
    vehicleFilterFocusedRef.current = true;
    setVehicleFilterFocused(true);
  }, []);

  const handleVehicleFilterBlur = useCallback(() => {
    vehicleFilterFocusedRef.current = false;
    setVehicleFilterFocused(false);
  }, []);

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
      <View style={styles.container}>
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
          searchLoading={false}
          locationLoading={locationLoading}
          animatedStyle={[animatedSearchEntranceStyle, animatedSearchHideStyle]}
        />

        {/* Vehicle Filters */}
        <VehicleFilters
          vehicleNumberInput={vehicleNumberInput}
          onVehicleNumberInputChange={setVehicleNumberInput}
          onAddFilter={addVehicleNumberFilter}
          filters={vehicleNumberFilters}
          onRemoveFilter={removeVehicleNumberFilter}
          onVehicleFilterFocus={handleVehicleFilterFocus}
          onVehicleFilterBlur={handleVehicleFilterBlur}
          animatedStyle={[animatedFiltersStyle, animatedFiltersEntranceStyle, animatedVehicleFilterMoveUpStyle]}
        />

        {/* Departures List - now using flex to fill remaining space */}
        <DeparturesList
          departures={departures}
          vehicleOrder={vehicleOrder}
          loading={departuresLoading}
          refreshing={refreshing}
          onRefresh={handleManualRefresh}
          animatedStyle={[animatedDeparturesEntranceStyle, animatedDeparturesStyle]}
        />
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

