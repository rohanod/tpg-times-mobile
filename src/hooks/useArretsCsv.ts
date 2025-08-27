import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../config';
import { accentInsensitiveMatch, calculateRelevanceScore } from '~/utils/accentSearch';

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

// Web-specific storage functions
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(key);
      if (__DEV__) {
        console.log(`WebStorage getItem: ${key} = ${value ? value.substring(0, 100) + '...' : 'null'}`);
      }
      return value;
    } catch (error) {
      console.error('WebStorage getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
      if (__DEV__) {
        console.log(`WebStorage setItem: ${key} = ${value.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('WebStorage setItem error:', error);
      // Silently fail if storage is full or unavailable
    }
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      if (__DEV__) {
        console.log(`WebStorage removeItem: ${key}`);
      }
    } catch (error) {
      console.error('WebStorage removeItem error:', error);
      // Silently fail
    }
  }
};

export const useArretsCsv = () => {
  const [arretsList, setArretsList] = useState<ArretData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromCache = useCallback(async (): Promise<ArretData[] | null> => {
    try {
      const storage = (typeof Platform !== 'undefined' && Platform.OS === 'web') ? webStorage : AsyncStorage;
      const cachedData = await storage.getItem(CACHE_KEY);
      if (!cachedData) return null;

      const parsed: CachedArretData = JSON.parse(cachedData);
      const now = Date.now();

      // Check if cache is expired or version mismatch
      if (now - parsed.timestamp > CACHE_DURATION || parsed.version !== CACHE_VERSION) {
        if (__DEV__) {
          console.log('Arrets cache expired or version mismatch, will fetch fresh data');
        }
        await storage.removeItem(CACHE_KEY);
        return null;
      }

      if (__DEV__) {
        const storageType = (typeof Platform !== 'undefined' && Platform.OS === 'web') ? 'localStorage' : 'AsyncStorage';
        console.log(`Loaded ${parsed.data.length} stops from cache (${storageType})`);
        console.log('Sample stops:', parsed.data.slice(0, 3));
      }

      return parsed.data;
    } catch (error) {
      console.error('Error loading arrets cache:', error);
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (data: ArretData[]): Promise<void> => {
    try {
      const storage = (typeof Platform !== 'undefined' && Platform.OS === 'web') ? webStorage : AsyncStorage;
      const cacheData: CachedArretData = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };

      await storage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      if (__DEV__) {
        const storageType = (typeof Platform !== 'undefined' && Platform.OS === 'web') ? 'localStorage' : 'AsyncStorage';
        console.log(`Cached ${data.length} stops to ${storageType}`);
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

    return arretsList.some(arret => {
      return arret.active && accentInsensitiveMatch(stopName, arret.name);
    });
  };

  const getFullStopName = async (stopName: string): Promise<string> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }

    if (!stopName) return '';

    // Find best match using accent-insensitive search and relevance scoring
    let bestMatch = null;
    let bestScore = -1;

    for (const arret of arretsList) {
      if (!arret.active) continue;

      if (accentInsensitiveMatch(stopName, arret.name)) {
        const score = calculateRelevanceScore(stopName, arret.name, arret.municipality);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = arret;
        }
      }
    }

    // Return the matched stop's raw name - no external API calls
    // Rely on search.ch stationboard response for proper name formatting
    return bestMatch ? bestMatch.name : stopName;
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

  const getStopSuggestions = useCallback(async (query: string): Promise<StopSuggestion[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }

    const trimmedQuery = query.trim();

    // Filter stops using accent-insensitive matching
    const matchingStops = arretsList
      .filter(arret => {
        if (!arret.active) return false;

        // Use accent-insensitive matching for stop name, municipality, and full name
        return accentInsensitiveMatch(trimmedQuery, arret.name) ||
               accentInsensitiveMatch(trimmedQuery, arret.municipality) ||
               accentInsensitiveMatch(trimmedQuery, arret.fullName);
      })
      .map(arret => ({
        id: arret.didocCode,
        rawName: arret.name,
        municipality: arret.municipality,
        fullName: `${arret.municipality}, ${arret.name}`,
        // Calculate relevance score for sorting
        relevanceScore: calculateRelevanceScore(trimmedQuery, arret.name, arret.municipality)
      }))
      // Sort by relevance score (higher is better)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
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
  }, [arretsList, fetchArretsCsv]);

  const refreshCache = useCallback(async (): Promise<void> => {
    await fetchArretsCsv(true);
  }, [fetchArretsCsv]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const storage = (typeof Platform !== 'undefined' && Platform.OS === 'web') ? webStorage : AsyncStorage;
      await storage.removeItem(CACHE_KEY);
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