import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import DepartureService, { type GroupedDeparture, type Stop } from '../services/DepartureService';

interface UseDepartureServiceReturn {
  departures: GroupedDeparture[];
  currentStopName: string | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchDepartures: (stop: Stop, vehicleFilters?: string[]) => Promise<void>;
  startAutoRefresh: (stop: Stop, vehicleFilters?: string[]) => void;
  stopAutoRefresh: () => void;
  manualRefresh: () => Promise<void>;
}

export function useDepartureService(): UseDepartureServiceReturn {
  const [departures, setDepartures] = useState<GroupedDeparture[]>([]);
  const [currentStopName, setCurrentStopName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const departureService = useRef(DepartureService.getInstance());
  const currentStop = useRef<Stop | null>(null);
  const currentFilters = useRef<string[]>([]);

  const fetchDepartures = useCallback(async (stop: Stop, vehicleFilters: string[] = []) => {
    if (!stop?.id) {
      setError('Invalid stop provided');
      return;
    }

    setLoading(true);
    setError(null);
    currentStop.current = stop;
    currentFilters.current = vehicleFilters;

    try {
      const result = await departureService.current.getDepartures(stop, vehicleFilters);
      setDepartures(result.departures);
      setCurrentStopName(result.formattedStopName);
      
      if (__DEV__) {
        console.log(`Fetched ${result.departures.length} departures for ${result.formattedStopName}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch departures';
      
      // Check for server rate limiting
      if (errorMessage === 'RATE_LIMITED_BY_SERVER') {
        Alert.alert(
          'Rate Limited',
          'Too many requests. Please wait a moment before trying again.',
          [{ text: 'OK' }]
        );
        setError('Rate limited by server');
      } else {
        setError(errorMessage);
      }
      
      if (__DEV__) {
        console.error('Error fetching departures:', err);
      }
      
      // Don't clear departures on error, keep showing last known data
    } finally {
      setLoading(false);
    }
  }, []);

  const startAutoRefresh = useCallback((stop: Stop, vehicleFilters: string[] = []) => {
    if (!stop?.id) {
      setError('Invalid stop provided for auto-refresh');
      return;
    }

    currentStop.current = stop;
    currentFilters.current = vehicleFilters;

    if (__DEV__) {
      console.log(`Starting auto-refresh for ${stop.rawName || stop.id}`);
    }

    departureService.current.startAutoRefresh(
      stop,
      vehicleFilters,
      (result) => {
        setDepartures(result.departures);
        setCurrentStopName(result.formattedStopName);
        setError(null);
        
        if (__DEV__) {
          console.log(`Auto-refresh updated: ${result.departures.length} departures for ${result.formattedStopName}`);
        }
      }
    );
  }, []);

  const stopAutoRefresh = useCallback(() => {
    if (__DEV__) {
      console.log('Stopping auto-refresh');
    }
    
    departureService.current.stopAutoRefresh();
  }, []);

  const manualRefresh = useCallback(async () => {
    if (!currentStop.current?.id) {
      setError('No stop selected for manual refresh');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const result = await departureService.current.manualRefresh(
        currentStop.current.id,
        currentFilters.current
      );
      
      setDepartures(result.departures);
      setCurrentStopName(result.formattedStopName);
      
      if (__DEV__) {
        console.log(`Manual refresh completed: ${result.departures.length} departures for ${result.formattedStopName}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh departures';
      setError(errorMessage);
      
      if (__DEV__) {
        console.error('Error during manual refresh:', err);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentService = departureService.current;
    return () => {
      if (__DEV__) {
        console.log('Cleaning up departure service');
      }
      currentService.cleanup();
    };
  }, []);

  return {
    departures,
    currentStopName,
    loading,
    error,
    refreshing,
    fetchDepartures,
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh,
  };
}