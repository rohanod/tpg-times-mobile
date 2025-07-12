import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import DepartureService, { type GroupedDeparture, type Stop } from '../services/DepartureService';

interface UseDepartureServiceReturn {
  departures: GroupedDeparture[];
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const departureService = useRef(DepartureService.getInstance());
  const currentStop = useRef<Stop | null>(null);
  const currentFilters = useRef<string[]>([]);

  const fetchDepartures = useCallback(async (stop: Stop, vehicleFilters: string[] = []) => {
    if (!stop?.name) {
      setError('Invalid stop provided');
      return;
    }

    setLoading(true);
    setError(null);
    currentStop.current = stop;
    currentFilters.current = vehicleFilters;

    try {
      const result = await departureService.current.getDepartures(stop.name, vehicleFilters);
      setDepartures(result);
      
      if (__DEV__) {
        console.log(`Fetched ${result.length} departures for ${stop.name}`);
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
    if (!stop?.name) {
      setError('Invalid stop provided for auto-refresh');
      return;
    }

    currentStop.current = stop;
    currentFilters.current = vehicleFilters;

    if (__DEV__) {
      console.log(`Starting auto-refresh for ${stop.name}`);
    }

    departureService.current.startAutoRefresh(
      stop.name,
      vehicleFilters,
      (newDepartures) => {
        setDepartures(newDepartures);
        setError(null);
        
        if (__DEV__) {
          console.log(`Auto-refresh updated: ${newDepartures.length} departures`);
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
    if (!currentStop.current?.name) {
      setError('No stop selected for manual refresh');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const result = await departureService.current.manualRefresh(
        currentStop.current.name,
        currentFilters.current
      );
      
      setDepartures(result);
      
      if (__DEV__) {
        console.log(`Manual refresh completed: ${result.length} departures`);
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
    return () => {
      if (__DEV__) {
        console.log('Cleaning up departure service');
      }
      departureService.current.cleanup();
    };
  }, []);

  return {
    departures,
    loading,
    error,
    refreshing,
    fetchDepartures,
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh,
  };
}