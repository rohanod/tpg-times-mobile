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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  InputAccessoryView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, X, Plus, RefreshCw } from 'lucide-react-native';

import { useSettings } from '../../hooks/useSettings';
import { useArretsCsv } from '../../hooks/useArretsCsv';
import { useCurrentStop } from '../../hooks/useCurrentStop';
import { useDepartureService } from '../../hooks/useDepartureService';
import { formatTime } from '../../utils/formatTime';
import { getThemeColors } from '../../config/theme';
import DepartureService, { type Stop, type GroupedDeparture } from '../../services/DepartureService';
import LocationService from '../../services/LocationService';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const departureService = useRef(DepartureService.getInstance());
  const locationService = useRef(LocationService.getInstance());
  const inputAccessoryViewID = 'vehicleNumberInputAccessory';

  // Hooks
  const { currentStop, setCurrentStop } = useCurrentStop();
  const { filterSuggestions, findNearestStop } = useArretsCsv();
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

  const onSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(text);
    }, 300);
  }, [handleSearch]);

  // Stop selection
  const handleStopSelect = useCallback(async (stop: Stop) => {
    setSelectedStop(stop);
    setCurrentStop(stop);
    setSearchQuery(stop.name);
    setSuggestions([]);
    setInputFocused(false);
    Keyboard.dismiss();

    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Fetch departures and start auto-refresh
    try {
      await fetchDepartures(stop, vehicleNumberFilters);
      startAutoRefresh(stop, vehicleNumberFilters);
    } catch (error) {
      console.error('Error fetching departures:', error);
    }
  }, [fetchDepartures, startAutoRefresh, vehicleNumberFilters, setCurrentStop]);

  // Location detection
  const findNearestStopLocation = useCallback(async () => {
    if (locationLoading || searchLoading) return;

    setLocationLoading(true);
    
    try {
      const locationResult = await locationService.current.getCurrentLocation();
      
      if ('error' in locationResult) {
        Alert.alert(
          language === 'en' ? 'Location Error' : 'Erreur de localisation',
          language === 'en' ? 'Could not detect your location' : 'Impossible de détecter votre position'
        );
        return;
      }

      const nearestStop = await findNearestStop(locationResult.latitude, locationResult.longitude);
      
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
        language === 'en' ? 'Error detecting location' : 'Erreur lors de la détection de la position'
      );
    } finally {
      setLocationLoading(false);
    }
  }, [findNearestStop, handleStopSelect, language, locationLoading, searchLoading]);

  // Vehicle filter management
  const addVehicleNumberFilter = useCallback(() => {
    if (!vehicleNumberInput.trim()) {
      return;
    }
    
    const newFilter = vehicleNumberInput.trim();
    if (!vehicleNumberFilters.includes(newFilter)) {
      const newFilters = [...vehicleNumberFilters, newFilter];
      setVehicleNumberFilters(newFilters);
      
      // Refresh departures with new filters
      if (selectedStop) {
        fetchDepartures(selectedStop, newFilters);
        startAutoRefresh(selectedStop, newFilters);
      }
    }
    
    setVehicleNumberInput('');
  }, [vehicleNumberInput, vehicleNumberFilters, selectedStop, fetchDepartures, startAutoRefresh]);

  const removeVehicleNumberFilter = useCallback((number: string) => {
    const newFilters = vehicleNumberFilters.filter(n => n !== number);
    setVehicleNumberFilters(newFilters);
    
    // Refresh departures with updated filters
    if (selectedStop) {
      fetchDepartures(selectedStop, newFilters);
      startAutoRefresh(selectedStop, newFilters);
    }
  }, [vehicleNumberFilters, selectedStop, fetchDepartures, startAutoRefresh]);


  // Manual refresh
  const handleManualRefresh = useCallback(async () => {
    if (!selectedStop) return;
    
    try {
      await manualRefresh();
    } catch (error) {
      Alert.alert(
        language === 'en' ? 'Refresh Error' : 'Erreur de rafraîchissement',
        language === 'en' ? 'Failed to refresh departures' : 'Échec du rafraîchissement des départs'
      );
    }
  }, [selectedStop, manualRefresh, language]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

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

  const renderDeparture = ({ item }: { item: GroupedDeparture }) => (
    <View
      style={[styles.departureItem, { borderColor: theme.border }]}
    >
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
                        : timeValue
                      }
                    </Text>
                    {isDelayed && (
                      <Text style={styles.delayText}>
                        +{time.delay}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {language === 'en' ? 'TPG Times' : 'Horaires TPG'}
            </Text>
          </View>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchWrapper}>
              <View 
                style={[
                  styles.searchContainer, 
                  { 
                    borderColor: theme.border,
                    borderBottomLeftRadius: inputFocused && suggestions.length > 0 ? 0 : 12,
                    borderBottomRightRadius: inputFocused && suggestions.length > 0 ? 0 : 12,
                  }
                ]}
              >
                <Search size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder={language === 'en' ? 'Search for a stop...' : 'Rechercher un arrêt...'}
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                {searchLoading && <ActivityIndicator size="small" color={theme.primary} />}
              </View>

              {/* Suggestions - Connected to Search Box */}
              {inputFocused && suggestions.length > 0 && (
                <View 
                  style={[
                    styles.suggestionsContainer, 
                    { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      maxHeight: Math.min(300, (insets.bottom + keyboardHeight > 0 ? 
                        (Dimensions.get('window').height - 250 - keyboardHeight) : 
                        300)),
                    }
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
                </View>
              )}
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
          </View>

          {/* Vehicle Filters */}
          {!inputFocused && (
            <View style={styles.filtersSection}>
              <View style={[styles.filterInputContainer, { borderColor: theme.border }]}>
                <TextInput
                  style={[styles.filterInput, { color: theme.text }]}
                  placeholder={language === 'en' ? 'Filter by vehicle number...' : 'Filtrer par numéro...'}
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
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>
          )}

          {/* Departures Section */}
          {!inputFocused && selectedStop && (
            <View style={[styles.departuresSection, { 
              backgroundColor: darkMode ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              shadowColor: darkMode ? '#000' : '#000',
            }]}>
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
                    {language === 'en' ? 'Loading departures...' : 'Chargement des départs...'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={departures}
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
                          : 'Aucun départ trouvé'
                        }
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          )}
        </View>
    </SafeAreaView>
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
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxHeight: 300,
    borderWidth: 1,
    borderTopWidth: 0,
    transform: [{ translateY: -1 }],
  },
  suggestionsList: {
    flexGrow: 0,
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
  accessoryView: {
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  accessoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  accessoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});