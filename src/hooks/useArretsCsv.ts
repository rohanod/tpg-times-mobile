import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config';

interface ArretData {
  name: string;
  municipality: string;
  coords: [number, number];
  active: boolean;
  fullName: string;
  distance?: number;
  didocCode: string;
}

interface StopSuggestion {
  id: string;
  rawName: string;
}

interface NearestStopResult {
  id: string;
  name: string;
}

interface LocationError {
  error: string;
  message?: string;
}

interface CachedArretData {
  data: ArretData[];
  timestamp: number;
  version: string;
}

const CACHE_KEY = 'arrets_csv_cache';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const useArretsCsv = () => {
  const [arretsList, setArretsList] = useState<ArretData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromCache = useCallback(async (): Promise<ArretData[] | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;

      const parsed: CachedArretData = JSON.parse(cachedData);
      const now = Date.now();
      
      // Check if cache is expired or version mismatch
      if (now - parsed.timestamp > CACHE_DURATION || parsed.version !== CACHE_VERSION) {
        if (__DEV__) {
          console.log('Arrets cache expired or version mismatch, will fetch fresh data');
        }
        await AsyncStorage.removeItem(CACHE_KEY);
        return null;
      }

      if (__DEV__) {
        console.log(`Loaded ${parsed.data.length} stops from cache`);
      }
      
      return parsed.data;
    } catch (error) {
      console.error('Error loading arrets cache:', error);
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (data: ArretData[]): Promise<void> => {
    try {
      const cacheData: CachedArretData = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };
      
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      if (__DEV__) {
        console.log(`Cached ${data.length} stops to AsyncStorage`);
      }
    } catch (error) {
      console.error('Error saving arrets cache:', error);
    }
  }, []);

  const parseCSVData = useCallback((csvText: string): ArretData[] => {
    const lines = csvText.split('\n').slice(1).filter(line => line.trim() !== '');
    
    const parsedArrets = lines.map(line => {
      const parts = line.split(';');
      if (parts.length < 7) return null;
      
      const active = parts[6].trim() === 'Y';
      if (!active) return null;

      const name = parts[1].trim();
      const municipality = parts[2].trim();
      const didocCode = parts[4].trim();
      const coordsStr = parts[5].trim();
      
      if (!didocCode || !name || !municipality || !coordsStr) return null;
      
      const coordParts = coordsStr.split(',');
      if (coordParts.length < 2) return null;
      
      const lat = parseFloat(coordParts[0].trim());
      const lon = parseFloat(coordParts[1].trim());
      if (isNaN(lat) || isNaN(lon)) return null;
      
      return {
        didocCode,
        name,
        municipality,
        coords: [lat, lon] as [number, number],
        active,
        fullName: `${municipality}, ${name}`
      };
    }).filter(Boolean) as ArretData[];
    
    return parsedArrets;
  }, []);

  const fetchArretsCsv = useCallback(async (forceRefresh: boolean = false): Promise<ArretData[]> => {
    if (arretsList.length > 0 && !forceRefresh) return arretsList;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = await loadFromCache();
        if (cachedData) {
          setArretsList(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data from server
      if (__DEV__) {
        console.log('Fetching fresh arrets.csv from server...');
      }
      
      const response = await fetch(API_ENDPOINTS.ARRETS_CSV);
      const csvText = await response.text();
      const parsedArrets = parseCSVData(csvText);
      
      // Save to cache
      await saveToCache(parsedArrets);
      
      setArretsList(parsedArrets);
      
      if (__DEV__) {
        console.log(`Fetched and cached ${parsedArrets.length} stops from server`);
      }
      
      return parsedArrets;
    } catch (error) {
      console.error('Error fetching arrets.csv:', error);
      setError('Failed to load stops data');
      
      // Try to load from cache as fallback
      const cachedData = await loadFromCache();
      if (cachedData) {
        if (__DEV__) {
          console.log('Using cached data as fallback after fetch error');
        }
        setArretsList(cachedData);
        setError(null); // Clear error since we have cached data
        return cachedData;
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [arretsList, loadFromCache, saveToCache, parseCSVData]);

  const checkIfTPG = async (stopName: string): Promise<boolean> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    if (!stopName) return false;
    
    const lowerStopName = stopName.toLowerCase();
    return arretsList.some(arret => {
      const arretName = arret.name.toLowerCase();
      return arret.active && (lowerStopName.includes(arretName) || arretName.includes(lowerStopName));
    });
  };

  const getFullStopName = async (stopName: string): Promise<string> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    if (!stopName) return '';
    
    const lowerStopName = stopName.toLowerCase();
    const match = arretsList.find(arret => {
      const arretName = arret.name.toLowerCase();
      return arret.active && (lowerStopName.includes(arretName) || arretName.includes(lowerStopName));
    });
    
    // Return the matched stop's raw name - no external API calls
    // Rely on search.ch stationboard response for proper name formatting
    return match ? match.name : stopName;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestStop = async (): Promise<NearestStopResult | null | LocationError> => {
    try {
      console.log('Starting location detection process');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return { error: 'location_permission_denied' };
      }
      
      console.log('Location permission granted, checking if location services are enabled');
      
      const isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationServicesEnabled) {
        console.log('Location services not enabled');
        return { 
          error: 'location_services_disabled',
          message: 'Please enable location services in your device settings.' 
        };
      }
      
      console.log('Location services enabled, attempting to get location');
      
      try {
        let location = null;
        
        try {
          console.log('Attempting to get last known position');
          const lastKnownPosition = await Location.getLastKnownPositionAsync({
            maxAge: 60000 
          });
          
          if (lastKnownPosition) {
            console.log('Successfully got last known position');
            location = lastKnownPosition;
          } else {
            console.log('No last known position available');
          }
        } catch {
          console.log('Error getting last known position:');
        }
        
        if (!location) {
          console.log('Getting current position with high accuracy');
          
          try {
            location = await Promise.race([
              Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              }),
              new Promise<never>((_, reject) => {
                setTimeout(() => {
                  console.log('High accuracy location request timed out after 15 seconds');
                  reject(new Error('High accuracy location timed out'));
                }, 15000);
              })
            ]);
            
            console.log('Successfully got high accuracy location');
          } catch {
            console.log('Error getting high accuracy location:');
            
            try {
              console.log('Falling back to balanced accuracy');
              location = await Promise.race([
                Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                }),
                new Promise<never>((_, reject) => {
                  setTimeout(() => {
                    console.log('Balanced accuracy location request timed out after 10 seconds');
                    reject(new Error('Balanced accuracy location timed out'));
                  }, 10000);
                })
              ]);
              
              console.log('Successfully got balanced accuracy location');
            } catch {
              console.log('Error getting balanced accuracy location:');
              
              try {
                console.log('Falling back to low accuracy');
                location = await Promise.race([
                  Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Lowest,
                  }),
                  new Promise<never>((_, reject) => {
                    setTimeout(() => {
                      console.log('Low accuracy location request timed out after 10 seconds');
                      reject(new Error('Low accuracy location timed out'));
                    }, 10000);
                  })
                ]);
                
                console.log('Successfully got low accuracy location');
              } catch {
                throw new Error('All location methods failed');
              }
            }
          }
        }
        
        if (!location) {
          return { 
            error: 'location_unavailable',
            message: 'Unable to determine your location. Please make sure location services are enabled and you have a GPS signal.'
          };
        }
        
        const { latitude, longitude } = location.coords;
        console.log(`Got location: ${latitude}, ${longitude}`);
        
        // Load the latest stops list
        const list = await fetchArretsCsv();
        
        const stopsWithDistances = list
          .filter(stop => stop.active)
          .map(stop => ({
            ...stop,
            distance: calculateDistance(latitude, longitude, stop.coords[0], stop.coords[1])
          }))
          .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        console.log(`Computed distances for ${stopsWithDistances.length} active stops`);
        console.log(`Nearest TPG stop: "${stopsWithDistances[0].fullName}" (lat: ${stopsWithDistances[0].coords[0]}, lng: ${stopsWithDistances[0].coords[1]}) - ${stopsWithDistances[0].distance?.toFixed(2)} km away`);
        
        const nearestStop = stopsWithDistances[0];
        if (!nearestStop) {
          return { error: 'no_stops_found' };
        }
        
        console.log(`Found nearest stop: ${nearestStop.fullName} at ${nearestStop.distance?.toFixed(2)} km`);

        return {
          id: nearestStop.didocCode,
          name: nearestStop.name,
        };
      } catch {
        return { 
          error: 'location_service_error',
          message: 'There was a problem with location services. Please check your device settings and ensure your GPS is working properly.'
        };
      }
    } catch {
      return { 
        error: 'location_service_error',
        message: 'There was a problem with location services. Please check your device settings and ensure your GPS is working properly.'
      };
    }
  };

  const filterSuggestions = async (suggestions: any[]): Promise<StopSuggestion[]> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    const validSuggestions = [];
    
    for (const suggestion of suggestions) {
      if (suggestion && suggestion.name && await checkIfTPG(suggestion.name)) {
        const fullName = await getFullStopName(suggestion.name);
        validSuggestions.push({
          id: suggestion.id || `suggestion-${Date.now()}-${Math.random()}`,
          rawName: fullName
        });
      }
    }
    
    return validSuggestions;
  };

  const getStopSuggestions = async (query: string): Promise<StopSuggestion[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Filter stops based on query matching stop name or municipality
    const matchingStops = arretsList
      .filter(arret => {
        if (!arret.active) return false;
        
        const stopName = arret.name.toLowerCase();
        const municipality = arret.municipality.toLowerCase();
        const fullName = arret.fullName.toLowerCase();
        
        return stopName.includes(normalizedQuery) || 
               municipality.includes(normalizedQuery) ||
               fullName.includes(normalizedQuery);
      })
      .map(arret => ({
        id: arret.didocCode,
        rawName: arret.name,
        municipality: arret.municipality,
        fullName: `${arret.municipality}, ${arret.name}`
      }))
      // Sort by relevance: exact matches first, then starts with, then contains
      .sort((a, b) => {
        const aName = a.rawName.toLowerCase();
        const bName = b.rawName.toLowerCase();
        const aMunicipality = a.municipality.toLowerCase();
        const bMunicipality = b.municipality.toLowerCase();
        
        // Exact name match gets highest priority
        if (aName === normalizedQuery && bName !== normalizedQuery) return -1;
        if (bName === normalizedQuery && aName !== normalizedQuery) return 1;
        
        // Name starts with query gets second priority
        if (aName.startsWith(normalizedQuery) && !bName.startsWith(normalizedQuery)) return -1;
        if (bName.startsWith(normalizedQuery) && !aName.startsWith(normalizedQuery)) return 1;
        
        // Municipality starts with query gets third priority
        if (aMunicipality.startsWith(normalizedQuery) && !bMunicipality.startsWith(normalizedQuery)) return -1;
        if (bMunicipality.startsWith(normalizedQuery) && !aMunicipality.startsWith(normalizedQuery)) return 1;
        
        // Alphabetical order for remaining matches
        return aName.localeCompare(bName);
      })
      // Remove duplicates based on stop name (some stops might have same name in different municipalities)
      .filter((stop, index, array) => {
        return index === array.findIndex(s => s.rawName.toLowerCase() === stop.rawName.toLowerCase());
      })
      // Limit results for performance
      .slice(0, 10);

    return matchingStops.map(stop => ({
      id: stop.id,
      rawName: stop.fullName
    }));
  };

  const refreshCache = useCallback(async (): Promise<void> => {
    await fetchArretsCsv(true);
  }, [fetchArretsCsv]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      setArretsList([]);
      if (__DEV__) {
        console.log('Arrets cache cleared');
      }
    } catch (error) {
      console.error('Error clearing arrets cache:', error);
    }
  }, []);

  return {
    loading,
    error,
    checkIfTPG,
    getFullStopName,
    findNearestStop,
    filterSuggestions,
    getStopSuggestions,
    refreshCache,
    clearCache
  };
};