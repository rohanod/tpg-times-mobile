import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, X, Plus } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useKeyboardHandler, KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { useSettings } from '../../hooks/useSettings';
import { useArretsCsv } from '../../hooks/useArretsCsv';
import { useCurrentStop } from '../../hooks/useCurrentStop';
import { useDepartureService } from '../../hooks/useDepartureService';
import { formatTime } from '../../utils/formatTime';
import { getThemeColors } from '../../config/theme';
import DepartureService, { type Stop, type GroupedDeparture } from '../../services/DepartureService';
import LocationService from '../../services/LocationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedDepartureItem = React.memo(
  ({ item, index, isVisible, language, timeFormat, darkMode, theme }) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(screenWidth);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }],
    }));

    // React to changes in the shared value
    useAnimatedReaction(
      () => isVisible.value,
      (visible) => {
        const delay = index * 80;
        const duration = 300;
        const easing = Easing.out(Easing.exp);

        if (visible) {
          // Arrival: staggered delay for smooth entrance
          opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
          translateX.value = withDelay(delay, withTiming(0, { duration, easing }));
        } else {
          // Departure: no delay - all cards slide out simultaneously
          opacity.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) });
          translateX.value = withTiming(screenWidth, {
            duration: 100,
            easing: Easing.in(Easing.ease),
          });
        }
      }
    );

    return (
      <Animated.View style={[styles.departureItem, { borderColor: theme.border }, animatedStyle]}>
        <View style={[styles.vehicleIcon, { backgroundColor: item.color }]}>
          <Text style={styles.vehicleNumber}>{item.number}</Text>
        </View>
        <View style={styles.departureInfo}>
          <Text style={[styles.vehicleType, { color: theme.text }]}>
            {item.vehicleType} {item.number}
          </Text>
          {Object.entries(item.destinations).map(([destination, times]) => (
            <View key={destination} style={styles.destinationRow}>
              <Text style={[styles.destinationText, { color: theme.textSecondary }]} numberOfLines={1}>
                {destination}
              </Text>
              <View style={styles.timesContainer}>
                {times.slice(0, 3).map((time, index) => {
                  const timeValue = formatTime(time.departure.toISOString(), timeFormat);
                  const isDelayed = time.delay > 0;
                  return (
                    <View key={index} style={styles.timeChip}>
                      <Text style={[styles.timeText, { color: theme.text }]}>
                        {timeFormat === 'minutes'
                          ? `${timeValue} ${language === 'en' ? 'min' : 'min'}`
                          : timeValue}
                      </Text>
                      {isDelayed && <Text style={styles.delayText}>+{time.delay}</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  }
);

export default function StopsScreen() {
  const insets = useSafeAreaInsets();
  const { language, timeFormat, darkMode } = useSettings();
  const theme = getThemeColors(darkMode);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [vehicleNumberFilters, setVehicleNumberFilters] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [vehicleOrder, setVehicleOrder] = useState<string[]>([]); // Track vehicle order for this stop session


  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const departureService = useRef(DepartureService.getInstance());
  const locationService = useRef(LocationService.getInstance());

  // Hooks
  const { currentStop, setCurrentStop } = useCurrentStop();
  const { findNearestStop } = useArretsCsv();
  const {
    departures,
    loading: departuresLoading,
    error: departuresError,
    refreshing,
    fetchDepartures,
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh,
  } = useDepartureService();

  // Animations
  const animationProgress = useSharedValue(0);
  const searchEntranceProgress = useSharedValue(0);
  const filtersEntranceProgress = useSharedValue(0);
  const departureCardsVisible = useSharedValue(true);



  const animatedSearchEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - searchEntranceProgress.value) * screenWidth }], // Slide in from right
    opacity: searchEntranceProgress.value,
  }));

  const animatedFiltersEntranceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - filtersEntranceProgress.value) * -screenWidth }], // Slide in from left
    opacity: filtersEntranceProgress.value,
  }));

  const animatedFiltersStyle = useAnimatedStyle(() => ({
    opacity: 1 - animationProgress.value,
    transform: [{ translateX: -animationProgress.value * screenWidth }],
  }));

  const animatedDeparturesStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: animationProgress.value * screenHeight, // Slide down when focused
      },
    ],
  }));

  const animatedSuggestionsStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (1 - animationProgress.value) * -200, // Slide in from top when focused
      },
    ],
    opacity: animationProgress.value,
  }));


  // Entrance animations on mount
  useEffect(() => {
    const duration = 800;
    const easing = Easing.out(Easing.exp);

    // Search slides in from right with delay
    searchEntranceProgress.value = withDelay(200, withTiming(1, { duration, easing }));

    // Filters slide in from left with delay
    filtersEntranceProgress.value = withDelay(400, withTiming(1, { duration, easing }));
  }, []);

  useEffect(() => {
    const shouldSlideDown = inputFocused;

    if (shouldSlideDown) {
      // First hide departure cards
      departureCardsVisible.value = false;

      // Calculate delay based on number of departure cards
      const maxCardDelay = departures.length > 0 ? (departures.length - 1) * 50 + 300 : 0;
      const borderDelay = maxCardDelay + 100; // Extra 100ms buffer

      // Then slide down the border after cards finish animating out
      animationProgress.value = withDelay(borderDelay, withTiming(1, {
        duration: 600,
        easing: Easing.inOut(Easing.ease)
      }));
    } else {
      // When coming back, slide border up first, then show cards
      animationProgress.value = withTiming(0, {
        duration: 600,
        easing: Easing.inOut(Easing.ease)
      });

      // Show cards after border finishes sliding up
      departureCardsVisible.value = withDelay(600, withTiming(1, { duration: 0 }));
    }
  }, [inputFocused, departures.length]);

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
    } catch (error) {
      console.error('Search error:', error);
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
      setSearchQuery(stop.name);
      setSuggestions([]);
      setInputFocused(false);
      Keyboard.dismiss();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      try {
        await fetchDepartures(stop, vehicleNumberFilters);
        startAutoRefresh(stop, vehicleNumberFilters);
      } catch (error) {
        console.error('Error fetching departures:', error);
      }
    },
    [fetchDepartures, startAutoRefresh, vehicleNumberFilters, setCurrentStop]
  );

  // Location detection
  const findNearestStopLocation = useCallback(async () => {
    if (locationLoading || searchLoading) return;
    setLocationLoading(true);
    try {
      const locationResult = await locationService.current.getCurrentLocation();
      if ('error' in locationResult) {
        Alert.alert(
          language === 'en' ? 'Location Error' : 'Erreur de localisation',
          language === 'en'
            ? 'Could not detect your location'
            : 'Impossible de détecter votre position'
        );
        return;
      }
      const nearestStop = await findNearestStop(
        locationResult.latitude,
        locationResult.longitude
      );
      if (nearestStop) {
        await handleStopSelect(nearestStop);
      } else {
        Alert.alert(
          language === 'en' ? 'No Stops Found' : 'Aucun arrêt trouvé',
          language === 'en' ? 'No stops found nearby' : 'Aucun arrêt trouvé à proximité'
        );
      }
    } catch (error) {
      console.error('Error finding nearest stop:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Erreur',
        language === 'en'
          ? 'Error detecting location'
          : 'Erreur lors de la détection de la position'
      );
    } finally {
      setLocationLoading(false);
    }
  }, [findNearestStop, handleStopSelect, language, locationLoading, searchLoading]);

  // Vehicle filter management
  const addVehicleNumberFilter = useCallback(() => {
    if (!vehicleNumberInput.trim()) return;
    const newFilter = vehicleNumberInput.trim();
    if (!vehicleNumberFilters.includes(newFilter)) {
      const newFilters = [...vehicleNumberFilters, newFilter];
      setVehicleNumberFilters(newFilters);
      if (selectedStop) {
        fetchDepartures(selectedStop, newFilters);
        startAutoRefresh(selectedStop, newFilters);
      }
    }
    setVehicleNumberInput('');
  }, [
    vehicleNumberInput,
    vehicleNumberFilters,
    selectedStop,
    fetchDepartures,
    startAutoRefresh,
  ]);

  const removeVehicleNumberFilter = useCallback(
    (number: string) => {
      const newFilters = vehicleNumberFilters.filter((n) => n !== number);
      setVehicleNumberFilters(newFilters);
      if (selectedStop) {
        fetchDepartures(selectedStop, newFilters);
        startAutoRefresh(selectedStop, newFilters);
      }
    },
    [vehicleNumberFilters, selectedStop, fetchDepartures, startAutoRefresh]
  );

  // Manual refresh
  const handleManualRefresh = useCallback(async () => {
    if (!selectedStop) return;
    try {
      await manualRefresh();
    } catch (error) {
      Alert.alert(
        language === 'en' ? 'Refresh Error' : 'Erreur de rafraîchissement',
        language === 'en'
          ? 'Failed to refresh departures'
          : 'Échec du rafraîchissement des départs'
      );
    }
  }, [selectedStop, manualRefresh, language]);


  // Initialize with current stop
  useEffect(() => {
    if (currentStop && !selectedStop) {
      setSelectedStop(currentStop);
      setSearchQuery(currentStop.name);
      fetchDepartures(currentStop, vehicleNumberFilters);
      startAutoRefresh(currentStop, vehicleNumberFilters);
    }
  }, [currentStop, selectedStop, fetchDepartures, startAutoRefresh, vehicleNumberFilters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [stopAutoRefresh]);

  // Reset vehicle order when selectedStop changes (new stop session)
  useEffect(() => {
    setVehicleOrder([]);
  }, [selectedStop]);

  // Establish and maintain vehicle order for consistent positioning
  useEffect(() => {
    if (departures.length > 0) {
      const currentVehicleKeys = departures.map(dep => `${dep.vehicleType}-${dep.number}`);

      setVehicleOrder(prevOrder => {
        if (prevOrder.length === 0) {
          // First time loading - establish initial order
          return currentVehicleKeys;
        } else {
          // Add any new vehicles to the end, keep existing order for consistency
          const newVehicles = currentVehicleKeys.filter(key => !prevOrder.includes(key));
          return [...prevOrder, ...newVehicles];
        }
      });
    }
  }, [departures]);

  // Render functions
  const renderSuggestion = ({ item }: { item: Stop }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
      onPress={() => handleStopSelect(item)}
    >
      <MapPin size={16} color={theme.textSecondary} />
      <Text style={[styles.suggestionText, { color: theme.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVehicleFilter = ({ item }: { item: string }) => (
    <View style={[styles.filterChip, { backgroundColor: theme.primary }]}>
      <Text style={styles.filterChipText}>{item}</Text>
      <TouchableOpacity
        onPress={() => removeVehicleNumberFilter(item)}
        style={styles.filterChipRemove}
      >
        <X size={14} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderDeparture = ({ item, index }: { item: GroupedDeparture; index: number }) => (
    <AnimatedDepartureItem
      item={item}
      index={index}
      isVisible={departureCardsVisible}
      language={language}
      timeFormat={timeFormat}
      darkMode={darkMode}
      theme={theme}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {language === 'en' ? 'TPG Times' : 'Horaires TPG'}
            </Text>
          </View>

          {/* Search Section */}
          <Animated.View style={[styles.searchSection, animatedSearchEntranceStyle]}>
            <View style={styles.searchWrapper}>
              <View
                style={[
                  styles.searchContainer,
                  { borderColor: theme.border },
                ]}
              >
                <Search size={20} color={theme.textSecondary} />
                <TextInput
                  autoComplete="off"
                  autoCorrect={false}
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder={
                    language === 'en' ? 'Search for a stop...' : 'Rechercher un arrêt...'
                  }
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                {searchQuery.length > 0 && !searchLoading && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <X size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
                {searchLoading && <ActivityIndicator size="small" color={theme.primary} />}
              </View>


            </View>

            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: theme.primary }]}
              onPress={findNearestStopLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MapPin size={20} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Suggestions Container - Slides in from top */}
          {inputFocused && suggestions.length > 0 && (
            <Animated.View
              style={[
                styles.suggestionsContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  maxHeight: 250,
                },
                animatedSuggestionsStyle,
              ]}
            >
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => `${item.id || item.name}-${index}`}
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              />
            </Animated.View>
          )}

          {/* Vehicle Filters */}
          <Animated.View style={[styles.filtersSection, animatedFiltersStyle, animatedFiltersEntranceStyle]}>
            <View style={[styles.filterInputContainer, { borderColor: theme.border }]}>
              <TextInput
                style={[styles.filterInput, { color: theme.text }]}
                placeholder={
                  language === 'en' ? 'Filter by vehicle number...' : 'Filtrer par numéro...'
                }
                placeholderTextColor={theme.textSecondary}
                value={vehicleNumberInput}
                onChangeText={setVehicleNumberInput}
                onSubmitEditing={addVehicleNumberFilter}
                returnKeyType="done"
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={[styles.addFilterButton, { backgroundColor: theme.primary }]}
                onPress={addVehicleNumberFilter}
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>

            {vehicleNumberFilters.length > 0 && (
              <FlatList
                data={vehicleNumberFilters}
                renderItem={renderVehicleFilter}
                keyExtractor={(item) => item}
                horizontal
                style={styles.filtersRow}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Animated.View>

          {/* Departures Section */}
          {selectedStop && (
            <Animated.View
              style={[
                styles.departuresSection,
                {
                  backgroundColor: darkMode
                    ? 'rgba(28, 28, 30, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)',
                  shadowColor: darkMode ? '#000' : '#000',
                },
                animatedDeparturesStyle,
              ]}
            >
              {departuresError && (
                <View style={[styles.errorContainer, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.errorText, { color: '#FF3B30' }]}>
                    {departuresError}
                  </Text>
                </View>
              )}

              {departuresLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    {language === 'en'
                      ? 'Loading departures...'
                      : 'Chargement des départs...'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={departures.sort((a, b) => {
                    const aKey = `${a.vehicleType}-${a.number}`;
                    const bKey = `${b.vehicleType}-${b.number}`;
                    const aIndex = vehicleOrder.indexOf(aKey);
                    const bIndex = vehicleOrder.indexOf(bKey);

                    // If both are in the order, sort by their position
                    if (aIndex !== -1 && bIndex !== -1) {
                      return aIndex - bIndex;
                    }
                    // If only one is in the order, prioritize it
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    // If neither is in the order, maintain original order
                    return 0;
                  })}
                  renderItem={renderDeparture}
                  keyExtractor={(item) => `${item.vehicleType}-${item.number}`}
                  style={styles.departuresList}
                  showsVerticalScrollIndicator={false}
                  refreshing={refreshing}
                  onRefresh={handleManualRefresh}
                  keyboardDismissMode="on-drag"
                  ListHeaderComponent={<View style={{ height: 16 }} />}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        {language === 'en'
                          ? 'No departures found'
                          : 'Aucun départ trouvé'}
                      </Text>
                    </View>
                  }
                />
              )}
            </Animated.View>
          )}

        </View>


      </SafeAreaView>


    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
    zIndex: 1001, // Ensure search section is above suggestions
  },
  searchWrapper: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44, // Fixed height
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    // No padding
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  suggestionText: {
    fontSize: 16,
    flex: 1,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 150, // Just below search section
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterInput: {
    flex: 1,
    fontSize: 16,
  },
  addFilterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersRow: {
    marginTop: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  filterChipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  departuresSection: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 5, // Reduced bottom margin to extend closer to tab bar
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
  },
  departuresList: {
    flex: 1,
  },
  departureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  departureInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  destinationText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  delayText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});