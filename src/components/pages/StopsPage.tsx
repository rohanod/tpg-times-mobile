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
  withSpring,
  Easing,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { useSettings } from '~/hooks/useSettings';
import { useArretsCsv } from '~/hooks/useArretsCsv';
import { useCurrentStop } from '~/hooks/useCurrentStop';
import { useDepartureService } from '~/hooks/useDepartureService';
import { useKeyboardHandler } from '~/hooks/useKeyboardHandler';
import type { Stop } from '~/services/DepartureService';
import { screenDimensions } from '~/utils/responsive';

import { SearchSection } from '../organisms/SearchSection';
import { VehicleFilters } from '../organisms/VehicleFilters';
import { DeparturesList } from '../organisms/DeparturesList';
import { SuggestionsContainer } from '../organisms/SuggestionsContainer';
import { ResponsiveLayout } from '../layout/ResponsiveLayout';
import { PageHeader } from '../layout/PageHeader';
import { Toast, type ToastType } from '../Toast';

export const StopsPage: React.FC = () => {
  const { language } = useSettings();
  const { keyboardHeight, screenHeight } = useKeyboardHandler();

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
  const [toastType, setToastType] = useState<ToastType>('error');

  // Toast helper function
  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  // Animated Values
  const searchEntranceProgress = useSharedValue(0);
  const filtersEntranceProgress = useSharedValue(0);
  const departuresEntranceProgress = useSharedValue(0);
  const vehicleFilterMoveUpProgress = useSharedValue(0);
  
  // New animated values for bouncy keyboard transitions
  const departuresExitProgress = useSharedValue(0);
  const departuresReturnProgress = useSharedValue(0);
  
  // Animation sequencing for proper order: filters out -> suggestions in
  const filtersExitProgress = useSharedValue(0);
  const suggestionsEnterProgress = useSharedValue(0);

  // Constants for layout calculations
  const HEADER_HEIGHT = 60; // approximate header height
  const SEARCH_HEIGHT = 60; // approximate search bar height  
  const TAB_BAR_HEIGHT = 85; // approximate tab bar height

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

  // Keyboard listeners - simplified since useKeyboardHandler manages keyboard height
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

  // Updated filters style for keyboard-aware behavior - slide out first
  const animatedFiltersStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(filtersExitProgress.value, [0, 1], [1, 0]),
      transform: [
        { translateX: filtersExitProgress.value * -screenDimensions.width }
      ],
    };
  });

  // Suggestions container style with delayed entrance and proper positioning
  const animatedSuggestionsStyle = useAnimatedStyle(() => {
    return {
      top: HEADER_HEIGHT + SEARCH_HEIGHT, // Position after header and search
      opacity: suggestionsEnterProgress.value,
      transform: [
        { 
          translateY: interpolate(
            suggestionsEnterProgress.value,
            [0, 1],
            [50, 0]
          )
        },
        {
          scale: interpolate(
            suggestionsEnterProgress.value,
            [0, 1],
            [0.9, 1]
          )
        }
      ],
    };
  });

  // Updated departures style with bouncy spring animations
  const animatedDeparturesStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(departuresExitProgress.value, [0, 1], [1, 0]),
      transform: [
        { 
          translateY: interpolate(
            departuresExitProgress.value,
            [0, 1],
            [0, screenHeight * 0.6], // slide down with spring bounce
            Extrapolation.CLAMP
          )
        },
        {
          scale: interpolate(
            departuresReturnProgress.value,
            [0, 1],
            [0.85, 1], // slight scale animation for return
            Extrapolation.CLAMP
          )
        }
      ],
    };
  });

  // Initial entrance for departures: slide up from bottom and fade in
  const animatedDeparturesEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - departuresEntranceProgress.value) * screenDimensions.height }],
    opacity: departuresEntranceProgress.value,
  }));

  // Keep layout stable when focusing vehicle number filter
  const animatedSearchHideStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ translateY: 0 }],
  }));

  const animatedVehicleFilterMoveUpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 0 }],
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

  // Keyboard state animations - sequenced for proper order
  useEffect(() => {
    if (inputFocused) {
      // Step 1: Vehicle filters slide out immediately (fast)
      filtersExitProgress.value = withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      
      // Step 2: Departures exit with bounce (concurrent with filters)
      departuresExitProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
      
      // Step 3: Suggestions enter after filters are out (delayed)
      suggestionsEnterProgress.value = withDelay(200, withSpring(1, {
        damping: 12,
        stiffness: 100,
        mass: 1,
      }));
      
      departuresReturnProgress.value = 0;
    } else {
      // Reverse sequence: suggestions out first, then filters back in
      suggestionsEnterProgress.value = withTiming(0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
      
      // Filters slide back in after suggestions are gone
      filtersExitProgress.value = withDelay(100, withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      }));
      
      // Departures return with bounce
      departuresExitProgress.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
        mass: 1.2,
      });
      departuresReturnProgress.value = withDelay(100, withSpring(1, {
        damping: 12,
        stiffness: 100,
        mass: 1,
      }));
    }
  }, [inputFocused, departuresExitProgress, departuresReturnProgress, filtersExitProgress, suggestionsEnterProgress]);

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

        {/* Suggestions Container - positioned absolutely to not affect layout */}
        {inputFocused && (
          <SuggestionsContainer
            keyboardHeight={keyboardHeight}
            searchHeight={SEARCH_HEIGHT}
            availableHeight={screenHeight - HEADER_HEIGHT - TAB_BAR_HEIGHT}
            isVisible={inputFocused}
            animatedStyle={animatedSuggestionsStyle}
          >
            {/* Future: Add stop suggestions here */}
          </SuggestionsContainer>
        )}

        {/* Departures List - now keyboard-aware */}
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

