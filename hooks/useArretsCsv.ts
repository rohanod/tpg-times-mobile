import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { API_ENDPOINTS } from '../config';

interface ArretData {
  name: string;
  municipality: string;
  coords: [number, number];
  active: boolean;
  fullName: string;
  distance?: number;
}

interface StopSuggestion {
  id: string;
  name: string;
}

// Extended error interface for location errors
interface LocationError {
  error: string;
  message?: string;
}

export const useArretsCsv = () => {
  const [arretsList, setArretsList] = useState<ArretData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the arrets.csv data when the hook is first used
  useEffect(() => {
    fetchArretsCsv();
  }, []);

  // Fetch and parse the arrets.csv file
  const fetchArretsCsv = async () => {
    if (arretsList.length > 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.ARRETS_CSV);
      const csvText = await response.text();
      const lines = csvText.split('\n').slice(1).filter(line => line.trim() !== '');
      
      const parsedArrets = lines.map(line => {
        const parts = line.split(';');
        if (parts.length < 7) return null;
        
        const name = parts[1].trim();
        const municipality = parts[2].trim();
        const coordsStr = parts[5].trim();
        const active = parts[6].trim() === 'Y';
        
        if (!name || !municipality || !coordsStr || !active) return null;
        
        const coordParts = coordsStr.split(',');
        if (coordParts.length < 2) return null;
        
        const lat = parseFloat(coordParts[0].trim());
        const lon = parseFloat(coordParts[1].trim());
        if (isNaN(lat) || isNaN(lon)) return null;
        
        return {
          name,
          municipality,
          coords: [lat, lon] as [number, number],
          active,
          fullName: `${municipality}, ${name}`
        };
      }).filter(Boolean) as ArretData[];
      
      setArretsList(parsedArrets);
    } catch (err) {
      console.error('Error fetching arrets.csv:', err);
      setError('Failed to load stops data');
    } finally {
      setLoading(false);
    }
  };

  // Check if a stop name is a valid TPG stop using arrets.csv
  const checkIfTPG = async (stopName: string): Promise<boolean> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    // Add null check before using toLowerCase
    if (!stopName) return false;
    
    const lowerStopName = stopName.toLowerCase();
    return arretsList.some(arret => {
      const arretName = arret.name.toLowerCase();
      return arret.active && (lowerStopName.includes(arretName) || arretName.includes(lowerStopName));
    });
  };

  // Get the full stop name (municipality + stop name) from arrets.csv
  const getFullStopName = async (stopName: string): Promise<string> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    // Add null check before using toLowerCase
    if (!stopName) return '';
    
    const lowerStopName = stopName.toLowerCase();
    const match = arretsList.find(arret => {
      const arretName = arret.name.toLowerCase();
      return arret.active && (lowerStopName.includes(arretName) || arretName.includes(lowerStopName));
    });
    
    const initialName = match ? match.fullName : stopName;
    
    // Use transport.opendata.ch API to get nicely formatted name
    try {
      const locationsResponse = await fetch(`${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(initialName)}&type=station`);
      const locationsData = await locationsResponse.json();
      
      if (locationsData && locationsData.stations && locationsData.stations.length > 0) {
        // Return the nicely formatted name from locations API
        return locationsData.stations[0].name || initialName;
      }
    } catch (err) {
      console.error('Error getting formatted stop name:', err);
    }
    
    // Fallback to the initial name if API call fails
    return initialName;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find the nearest TPG stop using arrets.csv
  const findNearestStop = async (): Promise<StopSuggestion | null | LocationError> => {
    try {
      console.log('Starting location detection process');
      
      // Step 1: Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return { error: 'location_permission_denied' };
      }
      
      console.log('Location permission granted, checking if location services are enabled');
      
      // Step 2: Check if location services are enabled
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
        // Step 3: Try to get the last known position first (much faster)
        let location = null;
        
        try {
          console.log('Attempting to get last known position');
          const lastKnownPosition = await Location.getLastKnownPositionAsync({
            maxAge: 60000 // Accept positions from the last minute
          });
          
          if (lastKnownPosition) {
            console.log('Successfully got last known position');
            location = lastKnownPosition;
          } else {
            console.log('No last known position available');
          }
        } catch (lastKnownError) {
          console.log('Error getting last known position:', lastKnownError);
        }
        
        // Step 4: If no last known position, try to get current position
        if (!location) {
          console.log('Getting current position with high accuracy');
          
          // First try with high accuracy but shorter timeout
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
          } catch (highAccuracyError) {
            console.log('Error getting high accuracy location:', highAccuracyError instanceof Error ? highAccuracyError.message : 'Unknown error');
            
            // Fall back to low accuracy with longer timeout
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
            } catch (balancedAccuracyError) {
              console.log('Error getting balanced accuracy location:', balancedAccuracyError instanceof Error ? balancedAccuracyError.message : 'Unknown error');
              
              // Final attempt with lowest accuracy
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
              } catch (lowAccuracyError) {
                console.log('All location methods failed');
                throw new Error('All location methods failed');
              }
            }
          }
        }
        
        // If we still don't have a location after all attempts
        if (!location) {
          console.log('Failed to get location after all attempts');
          return { 
            error: 'location_unavailable',
            message: 'Unable to determine your location. Please make sure location services are enabled and you have a GPS signal.'
          };
        }
        
        const { latitude, longitude } = location.coords;
        console.log(`Got location: ${latitude}, ${longitude}`);
        
        // Make sure we have the arrets data
        if (arretsList.length === 0) {
          await fetchArretsCsv();
        }
        
        // Calculate distances to all stops
        const stopsWithDistances = arretsList
          .filter(stop => stop.active)
          .map(stop => ({
            ...stop,
            distance: calculateDistance(latitude, longitude, stop.coords[0], stop.coords[1])
          }))
          .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        
        // Get the nearest stop
        const nearestStop = stopsWithDistances[0];
        if (!nearestStop) {
          console.log('No stops found nearby');
          return { error: 'no_stops_found' };
        }
        
        console.log(`Found nearest stop: ${nearestStop.fullName} at ${nearestStop.distance?.toFixed(2)}km`);
        
        // First format as {Municipality}, {stop}
        const formattedName = nearestStop.fullName;
        
        // Use transport.opendata.ch API to get nicely formatted name and ID
        try {
          // Use the locations API directly to get the proper formatted name and ID
          const response = await fetch(
            `${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(formattedName)}&type=station`
          );
          const data = await response.json();
          
          if (data.stations && data.stations.length > 0) {
            console.log(`API returned formatted stop: ${data.stations[0].name}`);
            return {
              id: data.stations[0].id,
              name: data.stations[0].name
            };
          }
        } catch (err) {
          console.error('Error with locations API:', err);
          // Continue with fallback - this is not a critical error
        }
        
        // Fallback to just returning the nearest stop without an ID
        console.log(`Using fallback stop: ${formattedName}`);
        return {
          id: `local-${Date.now()}`,
          name: formattedName
        };
      } catch (locationError) {
        // Log the error but with a more user-friendly message
        console.log('Location service issue:', locationError instanceof Error ? locationError.message : 'Unknown error');
        
        // Check if the error is a timeout error
        if (locationError instanceof Error && locationError.message.includes('timed out')) {
          return { 
            error: 'location_timeout',
            message: 'Location services took too long to respond. Please try moving to an area with better GPS reception.'
          };
        }
        
        return { 
          error: 'location_unavailable',
          message: 'Unable to determine your location. Please check your device settings and try again.'
        };
      }
    } catch (err) {
      console.log('General location service error:', err instanceof Error ? err.message : 'Unknown error');
      return { 
        error: 'location_service_error',
        message: 'There was a problem with location services. Please check your device settings and ensure your GPS is working properly.'
      };
    }
  };

  // Filter suggestions using arrets.csv
  const filterSuggestions = async (suggestions: any[]): Promise<StopSuggestion[]> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    const validSuggestions = [];
    
    for (const suggestion of suggestions) {
      // Add null check for suggestion and suggestion.name
      if (suggestion && suggestion.name && await checkIfTPG(suggestion.name)) {
        const fullName = await getFullStopName(suggestion.name);
        validSuggestions.push({
          id: suggestion.id || `suggestion-${Date.now()}-${Math.random()}`,
          name: fullName
        });
      }
    }
    
    return validSuggestions;
  };

  return {
    loading,
    error,
    checkIfTPG,
    getFullStopName,
    findNearestStop,
    filterSuggestions
  };
};