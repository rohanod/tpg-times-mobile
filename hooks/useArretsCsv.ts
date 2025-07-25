import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
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

export const useArretsCsv = () => {
  const [arretsList, setArretsList] = useState<ArretData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArretsCsv = useCallback(async (): Promise<ArretData[]> => {
    if (arretsList.length > 0) return arretsList;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.ARRETS_CSV);
      const csvText = await response.text();
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
      
      setArretsList(parsedArrets);
      return parsedArrets;
    } catch {
      console.error('Error fetching arrets.csv:');
      setError('Failed to load stops data');
      return [];
    } finally {
      setLoading(false);
    }
  }, [arretsList]);

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
    
    const initialName = match ? match.fullName : stopName;
    
    try {
      const locationsResponse = await fetch(`${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(initialName)}&type=station`);
      const locationsData = await locationsResponse.json();
      
      if (locationsData && locationsData.stations && locationsData.stations.length > 0) {
        return locationsData.stations[0].name || initialName;
      }
    } catch {
      console.error('Error getting formatted stop name:');
    }
    
    return initialName;
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

  return {
    loading,
    error,
    checkIfTPG,
    getFullStopName,
    findNearestStop,
    filterSuggestions
  };
};