import { useEffect, useState, useRef, useCallback } from 'react';
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

  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, getThemeColors } from '../../config/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, X, Plus } from 'lucide-react-native';

import { useSettings } from '../../hooks/useSettings';
import { useArretsCsv } from '../../hooks/useArretsCsv';
import { useCurrentStop } from '../../hooks/useCurrentStop';
import moment from 'moment-timezone';
import { formatTime } from '../../utils/formatTime';
import { useLocalSearchParams } from 'expo-router';
import { API_ENDPOINTS } from '../../config';


interface Stop {
  id?: string;
  name: string;
}



interface Connection {
  time: string; 
  terminal: { name: string };
  type: 'tram' | 'bus';
  line: string;
  color: string; 
  delay: number;
}


interface Departure {
  vehicleType: string;
  number: string;
  destination: string;
  departure: moment.Moment; 
  minutes: number;
  delay: number;
  color: string;
}


interface GroupedDeparture {
  vehicleType: string;
  number: string;
  color: string;
  destinations: {
    [destination: string]: Departure[];
  };
}


interface GroupedDeparturesMap {
  [key: string]: GroupedDeparture;
}


interface PositionMap {
  [key: string]: number;
}


interface VehiclePosition {
  vehicleKey: string;
  position: number;
}

export default function StopsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [departures, setDepartures] = useState<GroupedDeparture[]>([]);
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [vehicleNumberFilters, setVehicleNumberFilters] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<GroupedDeparture | null>(null);
  const { language, timeFormat, darkMode } = useSettings();
  const theme = getThemeColors(darkMode);
  
  const { currentStop, setCurrentStop, setVehicleNumberFilters: setGlobalFilters, vehiclePositions, setVehiclePositions } = useCurrentStop() as { currentStop: Stop | null; setCurrentStop: (stop: Stop | null) => void; setVehicleNumberFilters: (filters: string[]) => void; vehiclePositions: VehiclePosition[]; setVehiclePositions: (positions: VehiclePosition[]) => void; };
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const departureUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVehiclePressTimestampRef = useRef<number>(0);
  const [noResultsFound, setNoResultsFound] = useState(false);
  // Remove unused state variables
  // const [nextRefreshTime, setNextRefreshTime] = useState('');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  // Removed unused justSelected and setJustSelected state
  const [, setHasActiveSelection] = useState(false);
  const [processingFavoriteSelection, setProcessingFavoriteSelection] = useState(false);
  const selectedVehicleNumberRef = useRef<string | null>(null);
  
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  const { filterSuggestions, findNearestStop } = useArretsCsv();
  
  
  // Wrap in useCallback to prevent unnecessary re-renders
  const getStopSuggestions = useCallback(async (query: string): Promise<Stop[]> => { 
  if (__DEV__) {
    console.log('Searching for stops with query:', query);
  }
  
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const url = `${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(query)}&type=station`;
    
    if (__DEV__) {
      console.log('Fetching suggestions from URL:', url);
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (__DEV__) {
      console.log('API returned stations:', data.stations?.length || 0);
    }
    
    if (!data.stations || data.stations.length === 0) {
      if (__DEV__) {
        console.log('No suggestions found for query:', query);
      }
      return [];
    }
    
    const filteredSuggestions = await filterSuggestions(data.stations);
    const limitedSuggestions = filteredSuggestions.slice(0, 4);
    
    if (__DEV__) {
      console.log('Filtered TPG suggestions:', filteredSuggestions.length, 'Limited to:', limitedSuggestions.length);
    }
    
    return limitedSuggestions;
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching stop suggestions:', error);
    }
    return [];
  }
  }, [filterSuggestions]);
  
  
  useEffect(() => {
    if (__DEV__) {
      console.log('Current state in index.tsx:', {
        selectedStop,
        vehicleNumberFilters,
        searchQuery,
        globalCurrentStop: currentStop
      });
    }
  }, [selectedStop, vehicleNumberFilters, searchQuery, currentStop]);

  
  const params = useLocalSearchParams();
  
  
  useEffect(() => {
    if (!params || Object.keys(params).length === 0) return;
    
    console.log('Processing URL params:', params);
    
    try {
      
      const stopName = params.stop;
      
      if (!stopName) {
        console.log('No stop parameter found in URL params');
        return;
      }
      
      
      setProcessingFavoriteSelection(true);
      
      
      const stopNameStr = String(stopName);
      console.log(`Setting stop from params: "${stopNameStr}"`);
      
      const stop = { name: stopNameStr };
      
      setSearchQuery(stopNameStr);
      setSelectedStop(stop);
      setCurrentStop(stop);
      setHasActiveSelection(true);
      
      
      setSuggestions([]);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
      
      
      try {
        if (params.numbers) {
          const numbersStr = String(params.numbers);
          
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
          
          setVehicleNumberFilters([]);
          setGlobalFilters([]);
        }
      } catch (filterError) {
        console.error('Error processing vehicle number filters:', filterError);
        setVehicleNumberFilters([]);
        setGlobalFilters([]);
      }
      
      
      setTimeout(() => {
        if (stopNameStr) {
          fetchDepartures(stopNameStr)
            .then(() => {
              
              synchronizeToIntervals();
              
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
  }, [params, fetchDepartures, setCurrentStop, setGlobalFilters, synchronizeToIntervals]);
  
  
  useEffect(() => {
    if (selectedStop) {
      fetchDepartures(selectedStop.name);
    }
  }, [selectedStop, fetchDepartures]); 

  
  // Handle cleanup for all timeout references
  useEffect(() => {
    // This effect handles cleanup of all timeout references when component unmounts
    
    return () => {
      // Clear departureUpdateTimeoutRef
      if (departureUpdateTimeoutRef.current) {
        clearTimeout(departureUpdateTimeoutRef.current);
        departureUpdateTimeoutRef.current = null;
      }
      
      // Clear refreshTimeoutRef
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Clear scheduledRefreshRef
      if (scheduledRefreshRef.current) {
        clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
      
      // Clear searchTimeoutRef
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);
  
  
  // Define scheduleNextRefresh first
  const scheduleNextRefresh = useCallback(() => {
    if (processingFavoriteSelection) {
      console.log('Skipping refresh scheduling while processing favorite selection');
      return;
    }
    
    const now = new Date();
    const currentSeconds = now.getSeconds();
    const currentMs = now.getMilliseconds();
    
    let targetSeconds;
    if (currentSeconds < 20) targetSeconds = 20;
    else if (currentSeconds < 40) targetSeconds = 40;
    else targetSeconds = 0; 
    
    let delayMs;
    if (targetSeconds === 0) { 
      delayMs = (60 - currentSeconds) * 1000 - currentMs;
    } else {
      delayMs = (targetSeconds - currentSeconds) * 1000 - currentMs;
    }
    
    if (scheduledRefreshRef.current) {
      clearTimeout(scheduledRefreshRef.current);
    }
    
    scheduledRefreshRef.current = setTimeout(() => {
      console.log(`Executing refresh at ${new Date().toLocaleTimeString()}`);
      if (selectedStop) {
        setIsAutoRefreshing(true);
        fetchDepartures(selectedStop.name)
          .then(() => {
            scheduleNextRefresh();
          })
          .finally(() => {
            setIsAutoRefreshing(false);
          });
      }
    }, delayMs);

    console.log(`Next refresh scheduled at XX:XX:${targetSeconds} (in ${Math.round(delayMs / 1000)} seconds)`);
  }, [processingFavoriteSelection, selectedStop, fetchDepartures]);

  // Then define synchronizeToIntervals
  const synchronizeToIntervals = useCallback(() => {
    const now = new Date();
    const currentSeconds = now.getSeconds();
    const currentMs = now.getMilliseconds();
    
    const nextInterval = Math.ceil(currentSeconds / 20) * 20;
    const secondsToNextBoundary = nextInterval === currentSeconds ? 20 : nextInterval - currentSeconds;
    
    const adjustedDelay = (secondsToNextBoundary * 1000) - currentMs;
    
    console.log(`Synchronizing to 20-second boundaries. Next refresh at XX:XX:${nextInterval % 60} (in ${adjustedDelay/1000} seconds)`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      if (selectedStop) {
        console.log(`Executing refresh at ${new Date().toLocaleTimeString()}`);
        
        setIsAutoRefreshing(true);
        fetchDepartures(selectedStop.name)
          .then(() => {
            scheduleNextRefresh();
          })
          .finally(() => {
            setIsAutoRefreshing(false);
          });
      }
    }, adjustedDelay);
  }, [selectedStop, fetchDepartures, scheduleNextRefresh]);

  
  // Wrap fetchDepartures in useCallback
  const fetchDepartures = useCallback(async (stopName: string | undefined, isInitialLoad = false) => {
    if (__DEV__) {
      console.log('Fetching departures for stop:', stopName);
    }
    
    if (!stopName) {
      if (__DEV__) {
        console.warn('No stop name provided to fetchDepartures');
      }
      return;
    }
    
    if ((isInitialLoad && !isAutoRefreshing) || isInitialFetch) {
      setLoading(true);
    }
    
    try {
      const url = `${API_ENDPOINTS.STATIONBOARD}?stop=${encodeURIComponent(stopName)}&limit=300&show_delays=1&transportation_types=tram,bus&mode=depart`;
      
      if (__DEV__) {
        console.log('Fetching from URL:', url);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data && data.connections) {
        const nowMoment = moment().tz('Europe/Zurich');
        const filteredDepartures: Departure[] = data.connections 
          .filter((conn: Connection | null): conn is Connection => !!(conn && conn.time && conn.terminal && conn.terminal.name)) 
          .map((conn: Connection) => { 
            try {
              const departure = moment.tz(conn.time, 'Europe/Zurich');
              const minutesUntilDeparture = Math.ceil(moment.duration(departure.diff(nowMoment)).asMinutes());
              return {
                vehicleType: conn.type === 'tram' ? 'Tram' : 'Bus',
                number: conn.line || '',
                destination: conn.terminal.name || '',
                departure,
                minutes: minutesUntilDeparture,
                delay: conn.delay ?? 0,
                color: conn.color ? `#${conn.color.split('~')[0]}` : '#FF6600'
              };
            } catch (error) {
              console.error('Error processing departure:', error);
              
              return {
                vehicleType: conn.type === 'tram' ? 'Tram' : 'Bus',
                number: conn.line || '',
                destination: conn.terminal?.name || 'Unknown',
                departure: nowMoment,
                minutes: 0,
                delay: 0,
                color: '#FF6600'
              };
            }
          });

        
        const groupedDepartures: GroupedDeparturesMap = {}; 
        
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

        
        let filteredGroupedDepartures: GroupedDeparture[] = Object.values(groupedDepartures); 
        
        if (vehicleNumberFilters.length > 0) {
          
          const filterSet = new Set<string>(vehicleNumberFilters); 
          
          filteredGroupedDepartures = filteredGroupedDepartures.filter((vehicle: GroupedDeparture) => { 
            
            const vehicleNum = String(vehicle.number).trim();
            
            return filterSet.has(vehicleNum);
          });
        }

        console.log('Filtered departures count:', filteredGroupedDepartures.length);
        
        
        
        const departuresArray: GroupedDeparture[] = Object.values(filteredGroupedDepartures); 
        
        
        if (vehiclePositions.length > 0) {
          const existingKeys = new Set<string>(vehiclePositions.map(p => p.vehicleKey)); 
          const newVehicles = departuresArray.filter((v: GroupedDeparture) => !existingKeys.has(`${v.vehicleType}-${v.number}`)); 
          
          if (newVehicles.length > 0) {
            console.log('New vehicles detected in this session:', newVehicles.length);
            
            const maxPosition = vehiclePositions.reduce((max, p) => Math.max(max, p.position), -1);
            
            
            const newPositions: VehiclePosition[] = [...vehiclePositions]; 
            
            newVehicles.forEach((vehicle: GroupedDeparture, index: number) => { 
              const vehicleKey = `${vehicle.vehicleType}-${vehicle.number}`;
              newPositions.push({
                vehicleKey,
                position: maxPosition + 1 + index
              });
              console.log(`Added new vehicle ${vehicleKey} at position ${maxPosition + 1 + index}`);
            });
            
            
            setVehiclePositions(newPositions);
          }
        }
        
        setDepartures(departuresArray); 
        
        
        if (isInitialFetch) {
          setIsInitialFetch(false);
        }
        
        
        if (modalVisible && selectedVehicleNumberRef.current) {
          const updatedVehicleData: GroupedDeparture | undefined = filteredGroupedDepartures.find( 
            (v: GroupedDeparture) => v.number === selectedVehicleNumberRef.current 
          );
          
          if (updatedVehicleData) {
            setSelectedVehicle(updatedVehicleData || null); 
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
  }, [isAutoRefreshing, isInitialFetch, vehicleNumberFilters, vehiclePositions, setVehiclePositions, modalVisible, selectedVehicleNumberRef]);

  const renderDepartureTime = (departure: Departure) => { 
    
    if (departure.minutes <= 0) {
      return (
        <Text style={[styles.timeText, { fontWeight: 'bold' }]}>
          {language === 'en' ? 'Departing' : 'Départ'}
        </Text>
      );
    }
    
    
    if (timeFormat === 'minutes') {
      return (
        <Text style={styles.timeText}>
          {departure.minutes} {language === 'en' ? 'min' : 'min'}
        </Text>
      );
    } else {
      
      return (
        <Text style={styles.timeText}>
          {formatTime(departure.departure.format(), 'time')}
        </Text>
      );
    }
  };

  const handleVehiclePress = (vehicle: GroupedDeparture) => {
    const now = Date.now();
    if (now - lastVehiclePressTimestampRef.current > 30000) {
      lastVehiclePressTimestampRef.current = now;
      if (selectedStop?.name) {
        fetchDepartures(selectedStop.name);
      }
    }
    setSelectedVehicle(vehicle);
    selectedVehicleNumberRef.current = vehicle.number;
    setModalVisible(true);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      selectedVehicleNumberRef.current = null;
    });
  };
  
  
  const getSortedDepartures = (departuresArray: GroupedDeparture[]): GroupedDeparture[] => { 
    if (!departuresArray || departuresArray.length === 0) return [];
    
    
    if (vehiclePositions.length === 0 && departuresArray.length > 0) {
      
      return departuresArray;
    }
    
    
    if (vehiclePositions.length > 0) {
      
      const sortedDepartures = [...departuresArray];
      
      
      const positionMap: PositionMap = {}; 
      vehiclePositions.forEach((pos: VehiclePosition) => { 
        positionMap[pos.vehicleKey] = pos.position;
      });
      
      
      sortedDepartures.sort((a: GroupedDeparture, b: GroupedDeparture) => { 
        const keyA = `${a.vehicleType}-${a.number}`;
        const keyB = `${b.vehicleType}-${b.number}`;
        
        
        if (positionMap[keyA] !== undefined && positionMap[keyB] !== undefined) {
          return positionMap[keyA] - positionMap[keyB];
        }
        
        
        if (positionMap[keyA] !== undefined) return -1;
        if (positionMap[keyB] !== undefined) return 1;
        
        
        return 0;
      });
      
      return sortedDepartures;
    }
    
    
    
    return departuresArray;
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setNoResultsFound(false);
    setHasActiveSelection(false); 
  };
  
  
  const handleTextInputBlur = () => {
    setInputFocused(false);
    // Don't clear suggestions immediately to allow for suggestion selection
    setTimeout(() => {
      setSuggestions([]);
    }, 200);
  };

  
  const handleTextInputFocus = () => {
    setInputFocused(true);
    
    if (searchQuery.trim().length > 1) {
      setHasActiveSelection(false);
      
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
      }, 300); 
    }
  };

  const handleSearchInputChange = useCallback((text: string) => {
    setSearchQuery(text);
    setHasActiveSelection(false);
    
    if (text.trim().length < 2) {
      setSuggestions([]);
      setNoResultsFound(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      return;
    }
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Use a shorter debounce time for better responsiveness
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      if (__DEV__) {
        console.log('Debounced search triggered for query:', text);
      }
      try {
        const results = await getStopSuggestions(text);
        if (__DEV__) {
          console.log('Debounced search found suggestions:', results.length);
        }
        setSuggestions(results.slice(0, 4));
        setNoResultsFound(results.length === 0);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
        setNoResultsFound(true);
      } finally {
        setSearchLoading(false);
      }
    }, 200); // Reduced from 300ms to 200ms for better responsiveness
  }, [getStopSuggestions]);
  
  // Log function that only runs in development mode
  const devLog = (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  };

  const handleStopSelect = useCallback((stop: Stop) => {
    if (__DEV__) {
      console.log('Selected stop:', stop);
    }
    
    // Ensure we have a valid stop name
    if (!stop || !stop.name) {
      if (__DEV__) {
        console.warn('Invalid stop selected');
      }
      return;
    }
    
    setSelectedStop(stop);
    setCurrentStop(stop);
    setSearchQuery(stop.name); // Set the full name in the search input
    setSuggestions([]);
    setInputFocused(false);
    setHasActiveSelection(true);
    Keyboard.dismiss();
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // Immediately fetch departures when a stop is selected
    fetchDepartures(stop.name);
  }, [setCurrentStop, fetchDepartures]);
  
  const handleSearchSubmit = useCallback(() => {
    if (__DEV__) {
      console.log('Search submitted with query:', searchQuery);
    }
    
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) return;
    
    // Always use the text in the search box directly
    const stop = { name: trimmedQuery };
    if (__DEV__) {
      console.log('Creating stop from query:', stop);
    }
    
    setSelectedStop(stop);
    setCurrentStop(stop);
    setHasActiveSelection(true);
    setInputFocused(false);
    Keyboard.dismiss();
    setSuggestions([]);
    
    // Immediately fetch departures
    fetchDepartures(trimmedQuery);
  }, [searchQuery, setCurrentStop, fetchDepartures]);

  
  
  const handleLocationPress = useCallback(async () => {
    if (loading || searchLoading) return;
    
    setLoading(true);
    try {
      const result = await findNearestStop();
      
      if ('error' in result) {
        if (__DEV__) {
          console.log('Location error:', result.error);
        }
        alert(language === 'en' ? 'Could not detect your location' : 'Impossible de détecter votre position');
        return;
      }
      
      if (result) {
        // Call handleStopSelect directly without adding it to dependencies
        if (__DEV__) {
          console.log('Selected stop:', result);
        }
        setSelectedStop(result);
        setCurrentStop(result);
        setSearchQuery(result.name);
        setSuggestions([]);
        setInputFocused(false);
        setHasActiveSelection(true);
        Keyboard.dismiss();
        
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
      } else {
        alert(language === 'en' ? 'No stops found nearby' : 'Aucun arrêt trouvé à proximité');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error finding nearest stop:', error);
      }
      alert(language === 'en' ? 'Error detecting location' : 'Erreur lors de la détection de la position');
    } finally {
      setLoading(false);
    }
  }, [findNearestStop, language, loading, searchLoading, setCurrentStop]);
  
  const addVehicleNumberFilter = useCallback(() => {
    if (!vehicleNumberInput.trim()) return;
    
    const newFilter = vehicleNumberInput.trim();
    if (!vehicleNumberFilters.includes(newFilter)) {
      const newFilters = [...vehicleNumberFilters, newFilter];
      setVehicleNumberFilters(newFilters);
      setGlobalFilters(newFilters);
    }
    
    setVehicleNumberInput('');
  }, [vehicleNumberInput, vehicleNumberFilters, setGlobalFilters]);
  
  const removeVehicleNumberFilter = useCallback((number: string) => {
    const newFilters = vehicleNumberFilters.filter(n => n !== number);
    setVehicleNumberFilters(newFilters);
    setGlobalFilters(newFilters);
  }, [vehicleNumberFilters, setGlobalFilters]);

  // Wrap refresh in useCallback
  const refresh = useCallback(async () => {
    if (!selectedStop) return;
    
    if (__DEV__) {
      console.log('Manually refreshing departures for:', selectedStop.name);
    }
    
    if (departures.length === 0) {
      setLoading(true);
    } else {
      setIsAutoRefreshing(true);
    }
    
    try {
      await fetchDepartures(selectedStop.name);
      scheduleNextRefresh();
    } catch (error) {
      if (__DEV__) {
        console.error('Error refreshing departures:', error);
      }
      alert(language === 'en' ? 'Error refreshing departures' : 'Erreur lors du rafraîchissement des départs');
    } finally {
      setLoading(false);
      setIsAutoRefreshing(false);
    }
  }, [departures.length, fetchDepartures, language, scheduleNextRefresh, selectedStop, setIsAutoRefreshing, setLoading]);
  
  // Fix useEffect dependencies
  useEffect(() => {
    if (selectedStop) {
      setIsInitialFetch(true);
      refresh();
    }
  }, [selectedStop, vehicleNumberFilters, refresh]);
  
  useEffect(() => {
    if (selectedStop) {
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
  }, [selectedStop, synchronizeToIntervals]);
  
  // Fix cleanup for departureUpdateTimeoutRef
  useEffect(() => {
    // Store ref value in a variable inside the effect to avoid the exhaustive deps warning
    return () => {
      const timeoutRef = departureUpdateTimeoutRef.current;
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);
  
  
  useEffect(() => {
    return () => {
      // Store ref values in variables inside the cleanup function to avoid the exhaustive deps warning
      const refreshTimeout = refreshTimeoutRef.current;
      const scheduledRefreshTimeout = scheduledRefreshRef.current;
      const searchTimeout = searchTimeoutRef.current;
      const departureUpdateTimeout = departureUpdateTimeoutRef.current;
      
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      if (scheduledRefreshTimeout) {
        clearTimeout(scheduledRefreshTimeout);
      }
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (departureUpdateTimeout) {
        clearTimeout(departureUpdateTimeout);
      }
    };
  }, []);

  
  useEffect(() => {
    if (modalVisible && selectedVehicleNumberRef.current && departures.length > 0) { 
      
      const updatedVehicleData = departures.find((v: GroupedDeparture) => v.number === selectedVehicleNumberRef.current); 
      
      if (updatedVehicleData) {
        
        setSelectedVehicle(updatedVehicleData || null); 
      }
    }
  }, [departures, modalVisible]);

  
  useEffect(() => {
    
    if (departures.length > 0 && vehiclePositions.length === 0) { 
      const initialPositions: VehiclePosition[] = departures.map((item: GroupedDeparture, index: number) => ({ 
        vehicleKey: `${item.vehicleType}-${item.number}`,
        position: index
      }));
      
      
      setTimeout(() => {
        setVehiclePositions(initialPositions);
      }, 0);
    }
  }, [departures, vehiclePositions.length, setVehiclePositions]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
        <View style={[styles.header, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: '#FF6600' }]}>
            {language === 'en' ? 'TPG Bus and Tram' : 'Bus et Tram TPG'}
          </Text>
          {}
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <View style={[styles.inputContainer, { 
              backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5',
              borderRadius: 10,
              borderColor: theme.stopNameBorder,
              borderWidth: 1,
              overflow: 'hidden' // Ensure content doesn't overflow rounded corners
            }]}>
              <Search size={20} color="#FF6600" style={styles.searchIcon} />
              <TextInput
                style={[styles.input, { 
                  color: darkMode ? '#FFFFFF' : '#333',
                  borderRadius: 10 // Match parent container's border radius
                }]}
                placeholder={language === 'en' ? 'Enter stop name' : 'Nom de l\'arrêt'}
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                onSubmitEditing={handleSearchSubmit} // This triggers when Enter/Return is pressed
                onBlur={handleTextInputBlur}
                onFocus={handleTextInputFocus}
                returnKeyType="search" // Change to search for better UX
                blurOnSubmit={true}
                placeholderTextColor={darkMode ? '#666666' : '#999'}
                autoCorrect={false}
                autoCapitalize="words" // Auto-capitalize for stop names
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                  <X size={18} color={darkMode ? '#999999' : '#666666'} />
                </TouchableOpacity>
              )}
              {searchLoading && <ActivityIndicator size="small" color="#FF6600" style={styles.loadingIndicator} />}
            </View>
            
            {}
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
        
        {}
        
        {}
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
              style={styles.vehiclesList}
              data={getSortedDepartures(departures)}
              keyExtractor={(item: GroupedDeparture) => `${item.vehicleType}-${item.number}`} 
              numColumns={3}
              renderItem={({ item }: { item: GroupedDeparture }) => ( 
                <TouchableOpacity
                  style={[styles.vehicleButton, { backgroundColor: item.color }]}
                  onPress={() => handleVehiclePress(item)}>
                  <Text style={styles.vehicleNumber}>{item.number}</Text>
                  <Text style={styles.vehicleType}>{item.vehicleType}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={[styles.vehiclesGrid, { flexGrow: 1, paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 75 : 65) }]}
              columnWrapperStyle={styles.vehiclesRow}
              scrollIndicatorInsets={{ bottom: insets.bottom + (Platform.OS === 'ios' ? 75 : 65) }}
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
                  {selectedVehicle && Object.entries(selectedVehicle.destinations).map(([destination, times]) => { 
                    const departureTimes = times as Departure[]; 
                    return ( 
                    <View key={destination} style={styles.destinationSection}>
                      <Text style={[styles.destinationTitle, { color: darkMode ? '#FFFFFF' : '#333' }]}>
                        {language === 'en' ? 'To: ' : 'Vers: '}{destination}
                      </Text>
                      <View style={styles.timesGrid}>
                        {departureTimes.slice(0, 4).map((time: Departure, index: number) => { 
                          
                          const isDeparting = time.minutes <= 0;
                          
                          return (
                            <View
                              key={index}
                              style={[
                                styles.timeBoxContainer,
                              ]}>
                              {isDeparting ? (
                                
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
                                
                                <View 
                                  style={[
                                    styles.timeBox,
                                    { 
                                      backgroundColor: time.delay > 0 ? 'yellow' : selectedVehicle.color
                                    }
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
                  );})}
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
    zIndex: 1000, 
    maxHeight: 220, 
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    marginTop: 1,
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
  
  suggestion: {
    padding: 15,
    borderBottomWidth: 0, 
    
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
    minHeight: 0,
    flexGrow: 1,
  },
  vehiclesGrid: {
    padding: 0,
    flexGrow: 1,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
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
    width: '48%',  
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
    padding: 13, 
  },
  departingTimeText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.TEXT.DARK,
  },
  vehiclesList: {
    flex: 1,
  },
});
