import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, getThemeColors } from '../../config/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, X, Plus, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useSettings } from '../../hooks/useSettings';
import { useArretsCsv } from '../../hooks/useArretsCsv';
import { useCurrentStop } from '../../hooks/useCurrentStop';
import moment from 'moment-timezone';
import { formatTime } from '../../utils/formatTime';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_ENDPOINTS, TIME_CONFIG, UI_CONFIG } from '../../config';

// Define interfaces for better type safety
interface Stop {
  id?: string;
  name: string;
}

interface Departure {
  vehicleType: string;
  number: string;
  destination: string;
  departure: any; // moment object
  minutes: number;
  color: string;
}

export default function StopsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [departures, setDepartures] = useState<any[]>([]);
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [vehicleNumberFilters, setVehicleNumberFilters] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { language, timeFormat, darkMode } = useSettings();
  const theme = getThemeColors(darkMode);
  // Use the global state for sharing between tabs
  const { currentStop, setCurrentStop, setVehicleNumberFilters: setGlobalFilters, vehiclePositions, setVehiclePositions } = useCurrentStop();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [nextRefreshTime, setNextRefreshTime] = useState('');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [hasActiveSelection, setHasActiveSelection] = useState(false);
  const [processingFavoriteSelection, setProcessingFavoriteSelection] = useState(false);
  const selectedVehicleNumberRef = useRef<string | null>(null);
  // Add isInitialFetch state to determine if it's the first load for a stop
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  const { filterSuggestions, checkIfTPG, getFullStopName, findNearestStop } = useArretsCsv();
  
  // Function to get stop suggestions from the Transport API
  const getStopSuggestions = async (query: string): Promise<any[]> => {
    console.log('Searching for stops with query:', query);
    
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    try {
      // Fetch suggestions from the Transport API
      const url = `${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(query)}&type=station`;
      console.log('Fetching suggestions from URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API returned stations:', data.stations?.length || 0);
      
      // If no stations found, return empty array
      if (!data.stations || data.stations.length === 0) {
        console.log('No suggestions found for query:', query);
        return [];
      }
      
      // Use the filterSuggestions function from useArretsCsv hook
      // to only return TPG stops
      const filteredSuggestions = await filterSuggestions(data.stations);
      
      // Limit suggestions to 4 as per UI_CONFIG.SUGGESTIONS_LIMIT
      const limitedSuggestions = filteredSuggestions.slice(0, 4);
      
      console.log('Filtered TPG suggestions:', filteredSuggestions.length, 'Limited to:', limitedSuggestions.length);
      return limitedSuggestions;
    } catch (error) {
      console.error('Error fetching stop suggestions:', error);
      return [];
    }
  };
  
  // Log the current state for debugging
  useEffect(() => {
    console.log('Current state in index.tsx:', {
      selectedStop,
      vehicleNumberFilters,
      searchQuery,
      globalCurrentStop: currentStop
    });
  }, [selectedStop, vehicleNumberFilters, searchQuery, currentStop]);

  // Get parameters from URL when navigating from favorites
  const params = useLocalSearchParams();
  
  // Handle params but not for favorites (only for testing/deep linking if needed)
  useEffect(() => {
    if (!params || Object.keys(params).length === 0) return;
    
    console.log('Processing URL params:', params);
    
    try {
      // Extract stop parameter
      const stopName = params.stop;
      
      if (!stopName) {
        console.log('No stop parameter found in URL params');
        return;
      }
      
      // Set processing flag to prevent flickering
      setProcessingFavoriteSelection(true);
      
      // Convert to string safely
      const stopNameStr = String(stopName);
      console.log(`Setting stop from params: "${stopNameStr}"`);
      
      // Create stop object
      const stop = { name: stopNameStr };
      
      // Set state with the stop info
      setSearchQuery(stopNameStr);
      setSelectedStop(stop);
      setCurrentStop(stop);
      setHasActiveSelection(true);
      
      // Clear autosuggestions and any pending search timeouts
      setSuggestions([]);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      
      // Clear any existing refresh timeouts to prevent multiple refreshes
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
      
      // Process vehicle number filters if present
      try {
        if (params.numbers) {
          const numbersStr = String(params.numbers);
          // Handle the case where numbers is an empty string
          if (numbersStr.trim() === '') {
            setVehicleNumberFilters([]);
            setGlobalFilters([]);
          } else {
            const filtersArray = numbersStr.split(',').filter(n => n.trim() !== '');
            console.log('Setting filters from params:', filtersArray);
            setVehicleNumberFilters(filtersArray);
            setGlobalFilters(filtersArray);
          }
        } else {
          // Clear filters if no numbers provided
          setVehicleNumberFilters([]);
          setGlobalFilters([]);
        }
      } catch (filterError) {
        console.error('Error processing vehicle number filters:', filterError);
        setVehicleNumberFilters([]);
        setGlobalFilters([]);
      }
      
      // Fetch departures with slight delay to ensure state is updated
      setTimeout(() => {
        if (stopNameStr) {
          fetchDepartures(stopNameStr)
            .then(() => {
              // After initial fetch, set up the synchronization
              synchronizeToIntervals();
              // Clear the processing flag after everything is loaded
              setTimeout(() => {
                setProcessingFavoriteSelection(false);
              }, 500);
            })
            .catch(err => {
              console.error('Error fetching departures after param processing:', err);
              setProcessingFavoriteSelection(false);
            });
        }
      }, 300);
    } catch (error) {
      console.error('Error processing parameters:', error);
      setProcessingFavoriteSelection(false);
    }
  }, [params]);
  
  // Effect to fetch departures when filters change
  useEffect(() => {
    if (selectedStop) {
      fetchDepartures(selectedStop.name);
    }
  }, [selectedStop]); // Remove vehicleNumberFilters dependency

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Function to sync to 20-second boundaries
  const synchronizeToIntervals = () => {
    const now = new Date();
    const currentSeconds = now.getSeconds();
    const currentMs = now.getMilliseconds();
    
    // Find how many seconds until the next 20-second boundary
    // We want to land exactly on :00, :20, :40 seconds
    const nextInterval = Math.ceil(currentSeconds / 20) * 20;
    const secondsToNextBoundary = nextInterval === currentSeconds ? 20 : nextInterval - currentSeconds;
    
    // Calculate precise delay to the exact interval time
    const adjustedDelay = (secondsToNextBoundary * 1000) - currentMs;
    
    console.log(`Synchronizing to 20-second boundaries. Next refresh at XX:XX:${nextInterval % 60} (in ${adjustedDelay/1000} seconds)`);
    
    // Initial sync timeout
    refreshTimeoutRef.current = setTimeout(() => {
      if (selectedStop) {
        console.log(`Executing refresh at ${new Date().toLocaleTimeString()}`);
        // Set auto-refreshing flag to true to hide loading indicator
        setIsAutoRefreshing(true);
        fetchDepartures(selectedStop.name)
          .then(() => {
            // After fetch is complete, start the regular 20-second schedule
            scheduleNextRefresh();
          })
          .finally(() => {
            setIsAutoRefreshing(false);
          });
      }
    }, adjustedDelay);
  };

  // Function to schedule the next refresh
  const scheduleNextRefresh = () => {
    // Don't schedule refreshes while processing a favorite selection
    if (processingFavoriteSelection) {
      console.log('Skipping refresh scheduling while processing favorite selection');
      return;
    }
    
    const now = new Date();
    const currentSeconds = now.getSeconds();
    const currentMs = now.getMilliseconds();
    
    // Calculate exact time until next 20-second interval (:00, :20, :40)
    // First determine which boundary we're targeting
    let targetSeconds;
    if (currentSeconds < 20) targetSeconds = 20;
    else if (currentSeconds < 40) targetSeconds = 40;
    else targetSeconds = 0; // Next minute
    
    // Calculate precise delay to the exact time
    let delayMs;
    if (targetSeconds === 0) { // Next minute
      delayMs = (60 - currentSeconds) * 1000 - currentMs;
    } else {
      delayMs = (targetSeconds - currentSeconds) * 1000 - currentMs;
    }
    
    // Clear any existing refresh timeout
    if (scheduledRefreshRef.current) {
      clearTimeout(scheduledRefreshRef.current);
    }
    
    // Schedule next refresh exactly at the 20-second boundary
    scheduledRefreshRef.current = setTimeout(() => {
      console.log(`Executing refresh at ${new Date().toLocaleTimeString()}`);
      if (selectedStop) {
        // Set auto-refreshing flag to true to hide loading indicator during background refresh
        setIsAutoRefreshing(true);
        fetchDepartures(selectedStop.name)
          .then(() => {
            // After fetch is complete, schedule the next refresh
            scheduleNextRefresh();
          })
          .finally(() => {
            setIsAutoRefreshing(false);
          });
      }
    }, delayMs);

    console.log(`Next refresh scheduled at XX:XX:${targetSeconds} (in ${Math.round(delayMs / 1000)} seconds)`);
  };

  // Create a dedicated refresh function
  const refresh = async () => {
    if (!selectedStop) return;
    
    console.log('Manually refreshing departures for:', selectedStop.name);
    
    // Only show loading indicator if we don't have any departures yet
    if (departures.length === 0) {
      setLoading(true);
    } else {
      // Otherwise, use auto-refreshing flag to hide loading indicator
      setIsAutoRefreshing(true);
    }
    
    try {
      await fetchDepartures(selectedStop.name);
      
      // Reschedule the next regular refresh
      scheduleNextRefresh();
    } catch (error) {
      console.error('Error refreshing departures:', error);
      alert(language === 'en' ? 'Error refreshing departures' : 'Erreur lors du rafraîchissement des départs');
    } finally {
      setLoading(false);
      setIsAutoRefreshing(false);
    }
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    
    // If user completely clears the input, clear the active selection flag
    if (!text.trim()) {
      setHasActiveSelection(false);
    }
  };
  
  // Effect to debounce search and show suggestions after 400ms of inactivity
  useEffect(() => {
    // Don't show suggestions if we just selected a stop
    if (justSelected) {
      return;
    }
    
    // Don't show suggestions if we have an active selection,
    // unless the user has modified the search text (indicating they want new suggestions)
    if (hasActiveSelection && selectedStop) {
      // Get the current search query and the selected stop name
      const cleanQuery = searchQuery.trim().toLowerCase();
      const cleanSelectedName = selectedStop.name.trim().toLowerCase();
      
      // Only run search if the query doesn't match the current selection,
      // indicating the user is searching for something new
      if (cleanQuery === cleanSelectedName || 
          (cleanSelectedName.includes(cleanQuery) && cleanQuery.length > 3)) {
        return;
      }
      
      // If query is different enough from selected stop name,
      // clear the active selection flag to allow suggestions
      setHasActiveSelection(false);
    }
    
    // Only trigger search if there's enough text to search
    if (searchQuery.trim().length > 1) {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set a new timeout for 400ms after last keystroke (reduced from 800ms)
      searchTimeoutRef.current = setTimeout(async () => {
        console.log('Debounced search triggered for query:', searchQuery);
        setSearchLoading(true);
        try {
          const results = await getStopSuggestions(searchQuery);
          console.log('Debounced search found suggestions:', results.length);
          // Limit suggestions to 4 as per UI_CONFIG.SUGGESTIONS_LIMIT
          const limitedResults = results.slice(0, UI_CONFIG.SUGGESTIONS_LIMIT);
          setSuggestions(limitedResults);
          setNoResultsFound(results.length === 0);
        } catch (error) {
          console.error('Error getting suggestions:', error);
          setSuggestions([]);
        } finally {
          setSearchLoading(false);
        }
      }, 400); // 400ms debounce time (reduced from 800ms for faster response)
    } else {
      // Clear suggestions if search query is too short
      setSuggestions([]);
      setNoResultsFound(false);
    }
    
    // Cleanup function to clear the timeout when component unmounts or searchQuery changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, justSelected, hasActiveSelection, selectedStop]);
  
  const handleSearchSubmit = async () => {
    // Clear any pending timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Simply dismiss the keyboard and hide suggestions without selecting a stop
    Keyboard.dismiss();
    setSuggestions([]);
    setInputFocused(false);
    
    // If there's no query, nothing more to do
    if (!searchQuery.trim().length) {
      return;
    }
    
    // If we have an active selection, keep it
    if (hasActiveSelection && selectedStop) {
      return;
    }
    
    // Otherwise, we don't automatically select anything
    // This allows the user to just dismiss suggestions while keeping focus
    // and maintaining their current text input value
  };

  // Effect for handling stop selection and refresh
  useEffect(() => {
    if (selectedStop) {
      // Reset isInitialFetch to true when a new stop is selected
      setIsInitialFetch(true);
      refresh();
    }
  }, [selectedStop, vehicleNumberFilters]);

  // Effect for scheduled refreshes
  useEffect(() => {
    if (selectedStop) {
      // Initial sync to 20-second boundaries
      synchronizeToIntervals();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
      }
    };
  }, [selectedStop]);

  // We're now using the checkIfTPG function from the useArretsCsv hook

  const handleLocationPress = async () => {
    try {
      setSearchLoading(true);
      // Use the findNearestStop function from useArretsCsv hook
      const nearestStop = await findNearestStop();
      
      if (nearestStop && 'name' in nearestStop) {
        handleStopSelect(nearestStop);
      } else if (nearestStop && 'error' in nearestStop) {
        // Handle specific error types with custom messages when available
        if (nearestStop.error === 'location_timeout') {
          // Use the custom message if available, otherwise fall back to default message
          const message = nearestStop.message || 
            (language === 'en' ? 'Location request timed out. Please try again.' : 'La demande de localisation a expiré. Veuillez réessayer.');
          console.log('Location timeout handled gracefully');
          alert(message);
        } else if (nearestStop.error === 'location_permission_denied') {
          alert(language === 'en' ? 'Location permission denied. Please enable location services for this app.' : 'Permission de localisation refusée. Veuillez activer les services de localisation pour cette application.');
        } else if (nearestStop.error === 'no_stops_found') {
          alert(language === 'en' ? 'No TPG stops found nearby' : 'Aucun arrêt TPG trouvé à proximité');
        } else {
          // Use custom message if available
          const message = nearestStop.message || 
            (language === 'en' ? 'Error getting location' : 'Erreur de localisation');
          alert(message);
        }
      } else {
        alert(language === 'en' ? 'No TPG stops found nearby' : 'Aucun arrêt TPG trouvé à proximité');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert(language === 'en' ? 'Error getting location' : 'Erreur de localisation');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStopSelect = async (stop) => {
    console.log('Selecting stop:', stop.name);
    
    // Set active selection flag to true to prevent auto-search while typing
    setHasActiveSelection(true);
    
    // Clear previous departures so we can show loading indicator temporarily
    if (selectedStop?.name !== stop.name) {
      // Only clear departures if selecting a different stop
      setIsInitialFetch(true);
      // Reset vehicle positions for the new stop session
      setVehiclePositions([]);
    }
    
    // Set the input field text to the selected stop name
    setSearchQuery(stop.name);
    
    // Hide the suggestions when a stop is selected
    setSuggestions([]);
    
    // Clear the processing flag if it was set
    setProcessingFavoriteSelection(false);
    
    // Set the selected stop to trigger the useEffect for fetching departures
    const stopData = { id: stop.id, name: stop.name };
    setSelectedStop(stopData);
    setCurrentStop(stopData);
    
    // Mark that a selection was just made to avoid immediate new API calls
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 500);
  };

  // Add a vehicle number to the filters
  const addVehicleNumberFilter = () => {
    const number = vehicleNumberInput.trim();
    if (number && !vehicleNumberFilters.includes(number)) {
      const newFilters = [...vehicleNumberFilters, number];
      setVehicleNumberFilters(newFilters);
      setGlobalFilters(newFilters);
      setVehicleNumberInput('');
    }
  };
  
  // Function removed as the favorites button has been removed from the home screen
  // const navigateToFavorites = () => { ... };


  // Remove a vehicle number from the filters
  const removeVehicleNumberFilter = (numberToRemove) => {
    const newFilters = vehicleNumberFilters.filter(num => num !== numberToRemove);
    setVehicleNumberFilters(newFilters);
    // Update the global state
    setGlobalFilters(newFilters);
  };

  const fetchDepartures = async (stopName, isInitialLoad = false) => {
    console.log('Fetching departures for stop:', stopName);
    
    if (!stopName) {
      console.warn('No stop name provided to fetchDepartures');
      return;
    }
    
    // Only show loading indicator for initial load or manual refresh, not for auto-refresh
    // Also only show loading if we don't already have departures to display (initial fetch)
    if ((isInitialLoad && !isAutoRefreshing) || isInitialFetch) {
      setLoading(true);
    }
    
    try {
      // Get current time in HH:MM format
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const url = `${API_ENDPOINTS.STATIONBOARD}?stop=${encodeURIComponent(stopName)}&limit=300&show_delays=1&transportation_types=tram,bus&mode=depart&time=${currentTime}`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data && data.connections) {
        const nowMoment = moment().tz('Europe/Zurich');
        const filteredDepartures = data.connections
          .filter(conn => conn && conn.time && conn.terminal && conn.terminal.name)
          .map(conn => {
            try {
              const departure = moment.tz(conn.time, 'Europe/Zurich');
              const minutesUntilDeparture = Math.ceil(moment.duration(departure.diff(nowMoment)).asMinutes());
              return {
                vehicleType: conn.type === 'tram' ? 'Tram' : 'Bus',
                number: conn.line || '',
                destination: conn.terminal.name || '',
                departure,
                minutes: minutesUntilDeparture,
                color: conn.color ? `#${conn.color.split('~')[0]}` : '#FF6600'
              };
            } catch (error) {
              console.error('Error processing departure:', error);
              // Return a default departure object if parsing fails
              return {
                vehicleType: conn.type === 'tram' ? 'Tram' : 'Bus',
                number: conn.line || '',
                destination: conn.terminal?.name || 'Unknown',
                departure: nowMoment,
                minutes: 0,
                color: '#FF6600'
              };
            }
          });

        // Group departures by vehicle type and number, with error handling
        const groupedDepartures = {};
        
        try {
          filteredDepartures.forEach(curr => {
            if (!curr) return;
            
            const key = `${curr.vehicleType}-${curr.number}`;
            if (!groupedDepartures[key]) {
              groupedDepartures[key] = {
                vehicleType: curr.vehicleType,
                number: curr.number,
                color: curr.color,
                destinations: {}
              };
            }
            
            if (!groupedDepartures[key].destinations[curr.destination]) {
              groupedDepartures[key].destinations[curr.destination] = [];
            }
            
            groupedDepartures[key].destinations[curr.destination].push(curr);
          });
        } catch (error) {
          console.error('Error grouping departures:', error);
        }

        // Filter by vehicle numbers if specified - optimized filtering logic
        let filteredGroupedDepartures = Object.values(groupedDepartures);
        
        if (vehicleNumberFilters.length > 0) {
          // Create a Set for faster lookups
          const filterSet = new Set(vehicleNumberFilters);
          
          filteredGroupedDepartures = filteredGroupedDepartures.filter(vehicle => {
            // Convert to string for comparison
            const vehicleNum = String(vehicle.number).trim();
            // Use Set.has() for faster lookups
            return filterSet.has(vehicleNum);
          });
        }

        console.log('Filtered departures count:', filteredGroupedDepartures.length);
        
        // Process the complete data and update the UI with a single state change
        // This ensures we don't show empty states or loading indicators during refresh
        const departuresArray = Object.values(filteredGroupedDepartures);
        
        // Update vehicle positions for any new vehicles that weren't in the initial fetch
        if (vehiclePositions.length > 0) {
          const existingKeys = new Set(vehiclePositions.map(p => p.vehicleKey));
          const newVehicles = departuresArray.filter(v => !existingKeys.has(`${v.vehicleType}-${v.number}`));
          
          if (newVehicles.length > 0) {
            // Find the highest position currently used
            const maxPosition = vehiclePositions.reduce((max, p) => Math.max(max, p.position), -1);
            
            // Add new vehicles with positions after the existing ones
            const newPositions = [...vehiclePositions];
            newVehicles.forEach((vehicle, index) => {
              newPositions.push({
                vehicleKey: `${vehicle.vehicleType}-${vehicle.number}`,
                position: maxPosition + 1 + index
              });
            });
            
            // Update the stored positions
            setVehiclePositions(newPositions);
          }
        }
        
        setDepartures(departuresArray);
        
        // Now that we have data, mark initial fetch as complete
        if (isInitialFetch) {
          setIsInitialFetch(false);
        }
        
        // If modal is visible and we have a selected vehicle, update it with fresh data
        if (modalVisible && selectedVehicleNumberRef.current) {
          const updatedVehicleData = filteredGroupedDepartures.find(
            v => v.number === selectedVehicleNumberRef.current
          );
          
          if (updatedVehicleData) {
            setSelectedVehicle(updatedVehicleData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching departures:', error);
    } finally {
      if ((isInitialLoad && !isAutoRefreshing) || isInitialFetch) {
        setLoading(false);
      }
    }
  };

  const renderDepartureTime = (departure: any) => {
    // If the departure is happening now (0 minutes), show "Departing"
    if (departure.minutes <= 0) {
      return (
        <Text style={[styles.timeText, { fontWeight: 'bold' }]}>
          {language === 'en' ? 'Departing' : 'Départ'}
        </Text>
      );
    }
    
    // For all other times, use the selected format consistently
    if (timeFormat === 'minutes') {
      return (
        <Text style={styles.timeText}>
          {departure.minutes} {language === 'en' ? 'min' : 'min'}
        </Text>
      );
    } else {
      // Use 24h time format
      return (
        <Text style={styles.timeText}>
          {formatTime(departure.departure.format(), 'time')}
        </Text>
      );
    }
  };

  const handleVehiclePress = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    selectedVehicleNumberRef.current = vehicle.number;
    setModalVisible(true);
    // Start the fade-in animation when modal opens
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    // Fade out animation before closing the modal
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      selectedVehicleNumberRef.current = null;
    });
  };
  
  // Function to maintain consistent positions for vehicle buttons within a stop session
  const getSortedDepartures = (departuresArray) => {
    if (!departuresArray || departuresArray.length === 0) return [];
    
    // Create a map of vehicle keys to their current positions
    const currentVehicleKeys = departuresArray.map(item => `${item.vehicleType}-${item.number}`);
    
    // If we don't have any stored positions yet for this stop session, initialize them
    if (vehiclePositions.length === 0 && departuresArray.length > 0) {
      // Create initial positions based on the first fetch
      const initialPositions = departuresArray.map((item, index) => ({
        vehicleKey: `${item.vehicleType}-${item.number}`,
        position: index
      }));
      
      // Store these positions for this stop session
      setVehiclePositions(initialPositions);
      return departuresArray;
    }
    
    // If we have stored positions, use them to sort the departures
    if (vehiclePositions.length > 0) {
      // Create a copy of the departures array to sort
      const sortedDepartures = [...departuresArray];
      
      // Create a map of vehicle keys to their positions for faster lookup
      const positionMap = {};
      vehiclePositions.forEach(pos => {
        positionMap[pos.vehicleKey] = pos.position;
      });
      
      // Sort the departures based on their stored positions
      sortedDepartures.sort((a, b) => {
        const keyA = `${a.vehicleType}-${a.number}`;
        const keyB = `${b.vehicleType}-${b.number}`;
        
        // If both have positions, sort by position
        if (positionMap[keyA] !== undefined && positionMap[keyB] !== undefined) {
          return positionMap[keyA] - positionMap[keyB];
        }
        
        // If only one has a position, prioritize the one with a position
        if (positionMap[keyA] !== undefined) return -1;
        if (positionMap[keyB] !== undefined) return 1;
        
        // If neither has a position, maintain original order
        return 0;
      });
      
      // Check for new vehicles that weren't in the original positions
      const newVehicles = sortedDepartures.filter(item => {
        const key = `${item.vehicleType}-${item.number}`;
        return positionMap[key] === undefined;
      });
      
      // If we have new vehicles, add them to the positions
      if (newVehicles.length > 0) {
        // Find the next available position
        const maxPosition = Math.max(...vehiclePositions.map(p => p.position), -1);
        
        // Create new positions for the new vehicles
        const newPositions = newVehicles.map((item, index) => ({
          vehicleKey: `${item.vehicleType}-${item.number}`,
          position: maxPosition + 1 + index
        }));
        
        // Update the positions
        setVehiclePositions([...vehiclePositions, ...newPositions]);
      }
      
      return sortedDepartures;
    }
    
    // If we reach here, it means we have no stored positions yet
    // Just return the original array
    return departuresArray;
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setNoResultsFound(false);
    setHasActiveSelection(false); // Clear the active selection flag to allow new searches
  };
  
  // Function to dismiss suggestions when exiting the text box
  const handleTextInputBlur = () => {
    setInputFocused(false);
    // Add a small delay to allow for selection before clearing
    setTimeout(() => {
      setSuggestions([]);
    }, 200);
  };

  // Function to handle focus on the text input
  const handleTextInputFocus = () => {
    setInputFocused(true);
    // If there's text in the search box, reset active selection flag to allow new suggestions
    if (searchQuery.trim().length > 1) {
      setHasActiveSelection(false);
      // Trigger search if there's enough text
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const results = await getStopSuggestions(searchQuery);
          setSuggestions(results.slice(0, 4));
          setNoResultsFound(results.length === 0);
        } catch (error) {
          console.error('Error getting suggestions on focus:', error);
          setSuggestions([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300); // Shorter timeout for better responsiveness on focus
    }
  };

  // We already have a handleSearchSubmit function defined above, so we'll use that one
  // and remove this duplicate declaration

  // Effect for cleanup of all timeouts
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (departureUpdateTimeoutRef.current) {
        clearTimeout(departureUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Add useEffect to update selectedVehicle when departures change and modal is open
  useEffect(() => {
    if (modalVisible && selectedVehicleNumberRef.current && departures.length > 0) {
      // Find the updated vehicle data in the new departures
      const updatedVehicleData = departures.find(v => v.number === selectedVehicleNumberRef.current);
      
      if (updatedVehicleData) {
        // Update the selectedVehicle with fresh data
        setSelectedVehicle(updatedVehicleData);
      }
    }
  }, [departures, modalVisible]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
        <View style={[styles.header, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: '#FF6600' }]}>
            {language === 'en' ? 'TPG Bus and Tram' : 'Bus et Tram TPG'}
          </Text>
          {/* Removed the Save to Favorites button from the main page as requested */}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <View style={[styles.inputContainer, { 
              backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5',
              borderRadius: 10,
              borderBottomLeftRadius: suggestions && suggestions.length > 0 ? 0 : 10,
              borderBottomRightRadius: suggestions && suggestions.length > 0 ? 0 : 10,
              borderBottomWidth: suggestions && suggestions.length > 0 ? 0 : 1,
              borderColor: theme.stopNameBorder
            }]}>
              <Search size={20} color="#FF6600" style={styles.searchIcon} />
              <TextInput
                style={[styles.input, { color: darkMode ? '#FFFFFF' : '#333' }]}
                placeholder={language === 'en' ? 'Enter stop name' : 'Nom de l\'arrêt'}
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                onSubmitEditing={handleSearchSubmit}
                onBlur={handleTextInputBlur}
                onFocus={handleTextInputFocus}
                returnKeyType="done"
                blurOnSubmit={true}
                placeholderTextColor={darkMode ? '#666666' : '#999'}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                  <X size={18} color={darkMode ? '#999999' : '#666666'} />
                </TouchableOpacity>
              )}
              {searchLoading && <ActivityIndicator size="small" color="#FF6600" style={styles.loadingIndicator} />}
            </View>
            
            {/* Suggestions list positioned directly below search input */}
            {inputFocused && suggestions && suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.suggestion,
                      index === (suggestions && suggestions.length - 1) ? styles.lastSuggestion : {},
                      { 
                        backgroundColor: theme.background,
                        borderBottomColor: theme.suggestionsBorder,
                        borderBottomWidth: index === (suggestions && suggestions.length - 1) ? 0 : 1
                      }
                    ]}
                    onPress={() => handleStopSelect(item)}
                  >
                    <Text style={[styles.suggestionText, { color: theme.text }]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                style={[styles.suggestionsList, {
                  backgroundColor: theme.background,
                  borderColor: theme.suggestionsBorder
                }]}
              />
            )}
          </View>
          
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleLocationPress}
            disabled={loading || searchLoading}>
            <MapPin size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Removed the duplicate suggestions list */}
        
        {/* Bus/Tram number filter with chips */}
        <View style={[styles.filterContainer, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5', borderColor: theme.vehicleNumberBorder }]}>
          <View style={styles.filterInputContainer}>
            <TextInput
              style={[styles.filterInput, { color: darkMode ? '#FFFFFF' : '#333' }]}
              placeholder={language === 'en' ? 'Enter bus/tram number' : 'Numéro de bus/tram'}
              value={vehicleNumberInput}
              onChangeText={setVehicleNumberInput}
              placeholderTextColor={darkMode ? '#666666' : '#999'}
              keyboardType="numeric"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={addVehicleNumberFilter}
            />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addVehicleNumberFilter}
              disabled={!vehicleNumberInput.trim()}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {vehicleNumberFilters.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.chipsContainer}
              contentContainerStyle={styles.chipsContent}
            >
              {vehicleNumberFilters.map((number) => (
                <TouchableOpacity 
                  key={number} 
                  style={[styles.chip, { backgroundColor: darkMode ? '#333333' : '#DDDDDD' }]}
                  onPress={() => removeVehicleNumberFilter(number)}
                >
                  <Text style={[styles.chipText, { color: darkMode ? '#FFFFFF' : '#333333' }]}>{number}</Text>
                  <X size={16} color={darkMode ? '#FFFFFF' : '#333333'} style={styles.chipIcon} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {noResultsFound && !loading && (
          <View style={[styles.noResultsContainer, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5', borderColor: theme.border }]}>
            <Text style={[styles.noResultsText, { color: darkMode ? '#FFFFFF' : '#333' }]}>
              {language === 'en' ? 'No stops found. Please try another search.' : 'Aucun arrêt trouvé. Veuillez essayer une autre recherche.'}
            </Text>
          </View>
        )}

        {loading && !isAutoRefreshing && departures.length === 0 ? (
          <ActivityIndicator style={styles.loader} color="#FF6600" />
        ) : (
          <View style={styles.vehiclesContainer}>
            <FlatList
              data={getSortedDepartures(departures)}
              keyExtractor={(item) => `${item.vehicleType}-${item.number}`}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.vehicleButton, { backgroundColor: item.color }]}
                  onPress={() => handleVehiclePress(item)}>
                  <Text style={styles.vehicleNumber}>{item.number}</Text>
                  <Text style={styles.vehicleType}>{item.vehicleType}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.vehiclesGrid}
              columnWrapperStyle={styles.vehiclesRow}
            />
          </View>
        )}

        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            closeModal();
          }}>
          <Animated.View 
            style={[styles.modalOverlay, {
              opacity: fadeAnim,
            }]}
          >
            <Pressable 
              style={styles.modalBackdrop}
              onPress={closeModal}
            >
              <Animated.View 
                style={[styles.modalContent, 
                  { backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF', borderColor: theme.border },
                  {
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      })
                    }]
                  }
                ]}
                // This prevents taps on the content from closing the modal
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedVehicle?.vehicleType} {selectedVehicle?.number}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}>
                    <X size={24} color="#FF6600" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalScroll}>
                  {selectedVehicle && Object.entries(selectedVehicle.destinations).map(([destination, times]) => (
                    <View key={destination} style={styles.destinationSection}>
                      <Text style={[styles.destinationTitle, { color: darkMode ? '#FFFFFF' : '#333' }]}>
                        {language === 'en' ? 'To: ' : 'Vers: '}{destination}
                      </Text>
                      <View style={styles.timesGrid}>
                        {times.slice(0, 4).map((time, index) => {
                          // Only check if this is a departing vehicle - strict check for exactly 0 or negative
                          const isDeparting = time.minutes <= 0;
                          
                          return (
                            <View
                              key={index}
                              style={[
                                styles.timeBoxContainer,
                              ]}>
                              {isDeparting ? (
                                // Use a regular View instead of Animated.View for departing times
                                <View 
                                  style={[
                                    styles.timeBox,
                                    { backgroundColor: selectedVehicle.color },
                                    styles.departingTimeBox
                                  ]}
                                >
                                  <Text style={[
                                    styles.timeText,
                                    styles.departingTimeText
                                  ]}>
                                    {renderDepartureTime(time)}
                                  </Text>
                                </View>
                              ) : (
                                // Regular view for all other times
                                <View 
                                  style={[
                                    styles.timeBox,
                                    { backgroundColor: selectedVehicle.color }
                                  ]}
                                >
                                  <Text style={styles.timeText}>
                                    {renderDepartureTime(time)}
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  // Removed favoritesButton styles as the button has been removed
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    zIndex: 20,
  },
  searchInputWrapper: {
    flex: 1,
    zIndex: 20,
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  suggestionsList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000, // Increased from 10 to 1000 to ensure it's in front of all other elements
    maxHeight: 220, // Reduced from 250 to 220 to make it a tiny bit smaller
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    // borderColor is set dynamically based on theme
    overflow: 'hidden',
  },
  filterContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: COLORS.PRIMARY,
  },
  chipsContainer: {
    marginTop: 10,
    maxHeight: 40,
  },
  chipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    marginRight: 4,
  },
  chipIcon: {
    marginLeft: 2,
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginLeft: 10,
  },
  // Removed searchSuggestionsWrapper as it's no longer needed
  suggestion: {
    padding: 15,
    borderBottomWidth: 0, // Removed border to eliminate bottom border on suggestions
    // borderBottomColor is set dynamically based on theme
  },
  lastSuggestion: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingBottom: 16,
  },
  suggestionText: {
    fontSize: 16,
  },
  vehiclesContainer: {
    flex: 1,
    marginTop: 20,
  },
  vehiclesGrid: {
    padding: 10,
    alignItems: 'center',
  },
  vehiclesRow: {
    justifyContent: 'center',
  },
  vehicleButton: {
    width: 110,
    height: 110,
    margin: 8,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.UTILITY.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: COLORS.TEXT.DARK,
  },
  vehicleNumber: {
    color: COLORS.TEXT.DARK,
    fontSize: 24,
    fontWeight: 'bold',
  },
  vehicleType: {
    color: COLORS.TEXT.DARK,
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  closeButton: {
    padding: 5,
  },
  modalScroll: {
    flex: 1,
  },
  destinationSection: {
    marginBottom: 20,
  },
  destinationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeBoxContainer: {
    width: '48%',  // Make them slightly wider but keep two per row
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBox: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: '#FFFFFF',
  },
  timeText: {
    color: COLORS.TEXT.DARK,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginLeft: 10,
  },
  clearButton: {
    padding: 6,
  },
  noResultsContainer: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  departingTimeBox: {
    backgroundColor: COLORS.STATUS.ERROR,
    borderWidth: 2,
    borderColor: COLORS.TEXT.DARK,
    padding: 13, // Adjust padding to account for the border
  },
  departingTimeText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.TEXT.DARK,
  },
});
