import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useArretsCsv } from './useArretsCsv';

const FIRST_OPEN_KEY = 'first_open_completed';

export const useArretsRefresh = () => {
  const { refreshCache, loading, error } = useArretsCsv();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if this is the first app open and fetch arrets.csv
  useEffect(() => {
    const handleFirstOpen = async () => {
      try {
        const firstOpenCompleted = await AsyncStorage.getItem(FIRST_OPEN_KEY);

        if (!firstOpenCompleted) {
          console.log('First app open detected, fetching arrets.csv...');
          await refreshCache();

                  // Mark first open as completed
        await AsyncStorage.setItem(FIRST_OPEN_KEY, 'true');

        console.log('First app open setup completed');
        }
      } catch (error) {
        console.error('Error during first app open setup:', error);
      }
    };

    handleFirstOpen();
  }, [refreshCache]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshCache();
    } catch (error) {
      console.error('Error refreshing arrets data:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCache, isRefreshing]);

  return {
    handleRefresh,
    isRefreshing: isRefreshing || loading,
    error,
  };
};
