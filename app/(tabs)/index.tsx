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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, X, Plus, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useSettings } from '../../hooks/useSettings';
import { useArretsCsv } from '../../hooks/useArretsCsv';
import { useCurrentStop } from '../../hooks/useCurrentStop';
import moment from 'moment-timezone';
import { formatTime } from '../../utils/formatTime';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_ENDPOINTS, TIME_CONFIG } from '../../config';

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

// This function needs to be inside the StopsScreen component to access the hook
// Moving it inside the component in the next change

export default function StopsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  // Use local state for UI purposes
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [departures, setDepartures] = useState<any[]>([]);
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [vehicleNumberFilters, setVehicleNumberFilters] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { language, timeFormat, darkMode } = useSettings();
  // Use the global state for sharing between tabs
  const { currentStop, setCurrentStop, setVehicleNumberFilters: setGlobalFilters } = useCurrentStop();
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
      
      console.log('Filtered TPG suggestions:', filteredSuggestions.length);
      return filteredSuggestions;
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
  
  // Effect to debounce search and show suggestions after 800ms of inactivity
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
      
      // Set a new timeout for 800ms after last keystroke
      searchTimeoutRef.current = setTimeout(async () => {
        console.log('Debounced search triggered for query:', searchQuery);
        setSearchLoading(true);
        try {
          const results = await getStopSuggestions(searchQuery);
          console.log('Debounced search found suggestions:', results.length);
          setSuggestions(results);
          setNoResultsFound(results.length === 0);
        } catch (error) {
          console.error('Error getting suggestions:', error);
          setSuggestions([]);
        } finally {
          setSearchLoading(false);
        }
      }, 800); // 800ms debounce time
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
  
  // New effect to auto-update departures after 2 seconds of inactivity in the search box
  const departureUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Only proceed if we have a valid search query with at least 2 characters
    if (searchQuery.trim().length > 1) {
      // Clear any existing timeout
      if (departureUpdateTimeoutRef.current) {
        clearTimeout(departureUpdateTimeoutRef.current);
      }
      
      // Set a new timeout for 2000ms (2 seconds) after last keystroke
      departureUpdateTimeoutRef.current = setTimeout(async () => {
        console.log('Auto-updating departures for query after 2s:', searchQuery);
        
        // If we have suggestions, use the first one to fetch departures
        if (suggestions.length > 0) {
          const stopToUse = suggestions[0];
          console.log('Using first suggestion for auto-update:', stopToUse.name);
          
          // Update the selected stop
          const stopData = { id: stopToUse.id, name: stopToUse.name };
          setSelectedStop(stopData);
          setCurrentStop(stopData);
          setHasActiveSelection(true);
          
          // Fetch departures for this stop
          setIsAutoRefreshing(true);
          try {
            await fetchDepartures(stopToUse.name);
          } catch (error) {
            console.error('Error auto-updating departures:', error);
          } finally {
            setIsAutoRefreshing(false);
          }
        } else if (searchQuery.trim().length > 2) {
          // If no suggestions yet but query is valid, try to get suggestions and then fetch
          try {
            const results = await getStopSuggestions(searchQuery);
            if (results.length > 0) {
              const stopToUse = results[0];
              console.log('Found suggestion for auto-update:', stopToUse.name);
              
              // Update the selected stop
              const stopData = { id: stopToUse.id, name: stopToUse.name };
              setSelectedStop(stopData);
              setCurrentStop(stopData);
              setHasActiveSelection(true);
              
              // Fetch departures for this stop
              setIsAutoRefreshing(true);
              try {
                await fetchDepartures(stopToUse.name);
              } catch (error) {
                console.error('Error auto-updating departures:', error);
              } finally {
                setIsAutoRefreshing(false);
              }
            }
          } catch (error) {
            console.error('Error getting suggestions for auto-update:', error);
          }
        }
      }, 2000); // 2 second debounce time for auto-updating departures
    }
    
    // Cleanup function
    return () => {
      if (departureUpdateTimeoutRef.current) {
        clearTimeout(departureUpdateTimeoutRef.current);
      }
    };
  }, [searchQuery, suggestions]);
  
  const handleSearchSubmit = async () => {
    if (searchQuery.trim().length > 0) {
      // Clear any pending timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      
      // If we already have suggestions, simply select the first one
      if (suggestions.length > 0) {
        await handleStopSelect(suggestions[0]);
        return;
      }
      
      // Otherwise, fetch suggestions one more time
      setSearchLoading(true);
      setNoResultsFound(false);
      try {
        const newSuggestions = await getStopSuggestions(searchQuery);
        setSuggestions(newSuggestions);
        
        // If there are suggestions, automatically select the first one
        if (newSuggestions && newSuggestions.length > 0) {
          await handleStopSelect(newSuggestions[0]);
        } else {
          setNoResultsFound(true);
        }
      } catch (error) {
        console.error('Error during search:', error);
        alert(language === 'en' ? 'Error searching for stops' : 'Erreur lors de la recherche d\'arrêts');
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSuggestions([]);
    }
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
      
      if (nearestStop) {
        handleStopSelect(nearestStop);
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
        setDepartures(Object.values(filteredGroupedDepartures));
        
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

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setNoResultsFound(false);
    setHasActiveSelection(false); // Clear the active selection flag to allow new searches
  };
  
  // Function to dismiss suggestions when exiting the text box
  const handleTextInputBlur = () => {
    // Add a small delay to allow for selection before clearing
    setTimeout(() => {
      setSuggestions([]);
    }, 200);
  };

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
          <View style={[styles.inputContainer, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5' }]}>
            <Search size={20} color="#FF6600" style={styles.searchIcon} />
            <TextInput
              style={[styles.input, { color: darkMode ? '#FFFFFF' : '#333' }]}
              placeholder={language === 'en' ? 'Enter stop name' : 'Nom de l\'arrêt'}
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              onSubmitEditing={handleSearchSubmit}
              onBlur={handleTextInputBlur}
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
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleLocationPress}
            disabled={loading || searchLoading}>
            <MapPin size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Suggestions list positioned below search input and above filter container */}
        <View style={[styles.searchSuggestionsWrapper, { zIndex: 20 }]}>
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestion, { backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF', borderBottomColor: darkMode ? '#333333' : '#EEEEEE' }]}
                  onPress={() => handleStopSelect(item)}>
                  <Text style={[styles.suggestionText, { color: darkMode ? '#FFFFFF' : '#333' }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
              style={[styles.suggestionsList, { backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF' }]}
            />        
          )}
        </View>
        
        {/* Bus/Tram number filter with chips */}
        <View style={[styles.filterContainer, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5' }]}>
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
          <View style={[styles.noResultsContainer, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5' }]}>
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
              data={departures}
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
                  { backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF' },
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
    backgroundColor: '#FFFFFF',
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
    color: '#FF6600',
    flex: 1,
    textAlign: 'center',
  },
  // Removed favoritesButton styles as the button has been removed
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  // Filter styles
  filterContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF6600',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
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
    backgroundColor: '#DDDDDD',
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
    backgroundColor: '#FF6600',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginLeft: 10,
  },
  searchSuggestionsWrapper: {
    position: 'relative',
    marginHorizontal: 20, // Match the paddingHorizontal of searchContainer
    marginTop: 0,
    width: '100%', // Ensure the wrapper takes full width within its constraints
    alignSelf: 'center', // Center the wrapper
    zIndex: 20,
  },
  suggestionsList: {
    maxHeight: 200,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    position: 'absolute', // Use absolute positioning to hover over elements
    top: '100%', // Position it right at the bottom of the search input
    left: 0,
    right: 0,
    zIndex: 20, // Higher z-index to ensure it appears above other elements
    elevation: 10, // Increased elevation for Android to create more pronounced shadow
    width: '100%', // Set to 100% to match parent width exactly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Increased shadow offset for more visible drop shadow
    shadowOpacity: 0.3, // Increased opacity for more visible shadow
    shadowRadius: 8, // Increased radius for a softer, more spread shadow
    borderRadius: 10, // Match the noResultsContainer style
    overflow: 'hidden', // Add overflow hidden to prevent content from spilling out
  },
  suggestion: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  vehicleNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  vehicleType: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 20,
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
    color: '#FF6600',
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
    color: '#333',
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
  },
  timeText: {
    color: '#FFFFFF',
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
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  departingTimeBox: {
    backgroundColor: '#FF3B30', // Red color for departing
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 13, // Adjust padding to account for the border
  },
  departingTimeText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
