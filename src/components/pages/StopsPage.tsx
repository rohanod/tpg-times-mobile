import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Keyboard,
  View,
  StyleSheet,
  Platform,
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
import { SuggestionsList } from '../organisms/SuggestionsList';
import { SuggestionsBackdrop } from '../organisms/SuggestionsBackdrop';
import { ResponsiveLayout } from '../layout/ResponsiveLayout';
import { PageHeader } from '../layout/PageHeader';
import { Toast, type ToastType } from '../Toast';
import { LAYOUT } from '~/utils/layout';

export const StopsPage: React.FC = () => {
  const { language } = useSettings();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  // Suggestions disabled
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [vehicleNumberFilters, setVehicleNumberFilters] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [vehicleOrder, setVehicleOrder] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  
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
  const filtersVisibilityProgress = useSharedValue(0);
  const departuresVisibilityProgress = useSharedValue(0);
  const suggestionsEnterProgress = useSharedValue(0);

  // Track previous input focus to avoid triggering initial duplicate animations
  const wasInputFocusedRef = useRef(false);



  // Refs
  // No suggestion debounce needed
  // const departureService = useRef(DepartureService.getInstance());
  const vehicleFilterFocusedRef = useRef(false);

  // Hooks
  const { currentStop, setCurrentStop } = useCurrentStop();
  const { findNearestStop, getStopSuggestions } = useArretsCsv();
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

  // Filters: single visibility progress to avoid double animations
  const animatedFiltersStyle = useAnimatedStyle(() => ({
    opacity: filtersVisibilityProgress.value,
    transform: [
      {
        translateX: interpolate(
          filtersVisibilityProgress.value,
          [0, 1],
          [-screenDimensions.width, 0]
        ),
      },
    ],
  }));



  // Departures container animation: match autosuggestions (single progress for enter/leave)
  const animatedDeparturesStyle = useAnimatedStyle(() => {
    return {
      opacity: departuresVisibilityProgress.value,
      transform: [
        {
          translateY: interpolate(
            departuresVisibilityProgress.value,
            [0, 1],
            [50, 0]
          ),
        },
        {
          scale: interpolate(
            departuresVisibilityProgress.value,
            [0, 1],
            [0.9, 1]
          ),
        },
      ],
    };
  });

  // Keep layout stable for search section (no additional transforms)
  const animatedSearchHideStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ translateY: 0 }],
  }));

  // Suggestions container style with delayed entrance and proper positioning
  const animatedSuggestionsStyle = useAnimatedStyle(() => {
    // Add platform-specific positioning adjustment for web
    const baseTop = LAYOUT.SUGGESTIONS_TOP;
    const platformAdjustment = Platform.OS === 'web' ? 12 : 0; // Add more gap on web to avoid collision

    return {
      top: baseTop + platformAdjustment, // Use proper layout constant with web adjustment
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

  // Entrance animations
  useEffect(() => {
    const duration = 800;
    const easing = Easing.out(Easing.exp);

    searchEntranceProgress.value = withDelay(200, withTiming(1, { duration, easing }));
    filtersVisibilityProgress.value = withDelay(400, withTiming(1, { duration, easing }));
  }, [searchEntranceProgress, filtersVisibilityProgress]);

  // Start departures entrance as soon as both search and filters are fully on screen
  useAnimatedReaction(
    () => {
      'worklet';
      return searchEntranceProgress.value >= 1 && filtersVisibilityProgress.value >= 1;
    },
    (ready, wasReady) => {
      'worklet';
      if (ready && !wasReady && departuresVisibilityProgress.value < 1) {
        departuresVisibilityProgress.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
          mass: 1,
        });
      }
    }
  );

  // Fetch stop suggestions from arrets.csv when typing
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const q = searchQuery.trim();
      if (inputFocused && q.length >= 2) {
        try {
          const items = await getStopSuggestions(q);
          if (!cancelled) setSuggestions(items);
        } catch {
          if (!cancelled) setSuggestions([]);
        }
      } else {
        if (!cancelled) setSuggestions([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [inputFocused, searchQuery, getStopSuggestions]);

  // Keyboard state animations - sequenced for proper order (works on both web and native)
  useEffect(() => {
    if (inputFocused) {
      // Step 1: Vehicle filters slide out immediately (fast)
      filtersVisibilityProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });

      // Step 2: Departures fade/slide out (match autosuggestions reverse)
      departuresVisibilityProgress.value = withTiming(0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });

      // Step 3: Suggestions enter after filters are out (delayed)
      suggestionsEnterProgress.value = withDelay(200, withSpring(1, {
        damping: 12,
        stiffness: 100,
        mass: 1,
      }));
    } else {
      // Reverse sequence: suggestions out first, then filters back in
      suggestionsEnterProgress.value = withTiming(0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });

      // Filters slide back in after suggestions are gone
      filtersVisibilityProgress.value = withDelay(100, withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      }));

      // Only show departures again if we are returning from focus (avoid double init animation)
      if (wasInputFocusedRef.current) {
        departuresVisibilityProgress.value = withDelay(100, withSpring(1, {
          damping: 12,
          stiffness: 100,
          mass: 1,
        }));
      }
    }
    wasInputFocusedRef.current = inputFocused;
  }, [inputFocused, suggestionsEnterProgress, departuresVisibilityProgress, filtersVisibilityProgress]);



  // Vehicle filter focus animations removed to avoid stacking transforms; focus still tracked for keyboard logic

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
      console.log('🔥 handleStopSelect called with stop:', stop.rawName);
      try {
        if (__DEV__) {
          console.log('Stop selected:', stop);
        }

        // First fetch departures to get authoritative formatted stop name
        const result = await fetchDepartures(stop, vehicleNumberFilters);
        const formatted = result?.formattedStopName || stop.rawName || '';

        if (__DEV__) {
          console.log('Setting search query to:', formatted);
        }

        // Update search query - ensure it happens on web
        setSearchQuery(formatted);

        // Update selected stop and start auto refresh
        setSelectedStop(stop);
        setCurrentStop(stop);
        startAutoRefresh(stop, vehicleNumberFilters);

        // Close keyboard after selection - delay on web to let state update complete
        if (Platform.OS === 'web') {
          console.log('Web: Delaying blur to let state update complete');
          setTimeout(() => {
            setInputFocused(false);
            // On web, blur the active element to hide virtual keyboard
            if (typeof document !== 'undefined' && document.activeElement && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }, 50); // Small delay to let state update complete
        } else {
          // Native platforms - immediate handling
          setInputFocused(false);
          Keyboard.dismiss();
        }
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
  }, []);

  const handleVehicleFilterBlur = useCallback(() => {
    vehicleFilterFocusedRef.current = false;
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
          suggestionsVisible={inputFocused}
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
          animatedStyle={[animatedFiltersStyle]}
        />

        {/* Suggestions Backdrop - blocks other interactions on web when suggestions visible */}
        <SuggestionsBackdrop 
          visible={inputFocused}
          onClose={() => setInputFocused(false)}
        />

        {/* Suggestions List - platform-specific implementation */}
        {Platform.OS === 'web' ? (
          // Simple web implementation - positioned right under search bar
          <SuggestionsList
            suggestions={suggestions}
            onStopSelect={handleStopSelect}
            visible={inputFocused}
          />
        ) : (
          // Native implementation with animations
          <SuggestionsList
            suggestions={suggestions}
            onStopSelect={handleStopSelect}
            visible={inputFocused}
            animatedStyle={animatedSuggestionsStyle}
          />
        )}

        {/* Departures List - now keyboard-aware */}
        <DeparturesList
          departures={departures}
          vehicleOrder={vehicleOrder}
          loading={departuresLoading}
          refreshing={refreshing}
          onRefresh={handleManualRefresh}
          animatedStyle={[animatedDeparturesStyle]}
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

