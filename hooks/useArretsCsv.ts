import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const API_ENDPOINTS = {
  LOCATIONS: "https://transport.opendata.ch/v1/locations",
  STATIONBOARD: "https://search.ch/timetable/api/stationboard.fr.json",
  ARRETS_CSV: "https://raw.githubusercontent.com/rohanod/arrets/refs/heads/main/arrets.csv"
};

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
    
    const lowerStopName = stopName.toLowerCase();
    const match = arretsList.find(arret => {
      const arretName = arret.name.toLowerCase();
      return arret.active && (lowerStopName.includes(arretName) || arretName.includes(lowerStopName));
    });
    
    return match ? match.fullName : stopName;
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
  const findNearestStop = async (): Promise<StopSuggestion | null> => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
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
      if (!nearestStop) return null;
      
      // Verify with the API to get the proper ID
      try {
        const response = await fetch(
          `${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(nearestStop.fullName)}&type=station`
        );
        const data = await response.json();
        
        if (data.stations && data.stations.length > 0) {
          return {
            id: data.stations[0].id,
            name: data.stations[0].name
          };
        }
      } catch (err) {
        console.error('Error verifying stop with API:', err);
      }
      
      // Fallback to just returning the nearest stop without an ID
      return {
        id: `local-${Date.now()}`,
        name: nearestStop.fullName
      };
    } catch (err) {
      console.error('Error finding nearest stop:', err);
      return null;
    }
  };

  // Filter suggestions using arrets.csv
  const filterSuggestions = async (suggestions: any[]): Promise<StopSuggestion[]> => {
    if (arretsList.length === 0) {
      await fetchArretsCsv();
    }
    
    const validSuggestions = [];
    
    for (const suggestion of suggestions) {
      if (await checkIfTPG(suggestion.name)) {
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