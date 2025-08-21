import { useState, useCallback } from 'react';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export interface UpdateState {
  isChecking: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  error: string | null;
}

export const useEASUpdate = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: false,
    isUpdating: false,
    updateAvailable: false,
    error: null,
  });

  const checkForUpdate = useCallback(async () => {
    if (updateState.isChecking || updateState.isUpdating) {
      return;
    }

    setUpdateState(prev => ({
      ...prev,
      isChecking: true,
      error: null,
    }));

    try {
      const update = await Updates.checkForUpdateAsync();

      setUpdateState(prev => ({
        ...prev,
        isChecking: false,
        updateAvailable: update.isAvailable,
      }));

      return update.isAvailable;
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateState(prev => ({
        ...prev,
        isChecking: false,
        error: 'Failed to check for updates',
      }));
      return false;
    }
  }, [updateState.isChecking, updateState.isUpdating]);

  const performUpdate = useCallback(async () => {
    if (updateState.isUpdating) {
      return;
    }

    setUpdateState(prev => ({
      ...prev,
      isUpdating: true,
      error: null,
    }));

    try {
      // Check for update first
      const update = await Updates.checkForUpdateAsync();

      if (!update.isAvailable) {
        setUpdateState(prev => ({
          ...prev,
          isUpdating: false,
        }));
        Alert.alert('No Updates', 'Your app is already up to date.');
        return;
      }

      // Fetch and reload the update
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error during update:', error);
      setUpdateState(prev => ({
        ...prev,
        isUpdating: false,
        error: 'Failed to update the app',
      }));
      Alert.alert('Update Failed', 'Unable to update the app. Please try again later.');
    }
  }, [updateState.isUpdating]);

  const clearError = useCallback(() => {
    setUpdateState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    updateState,
    checkForUpdate,
    performUpdate,
    clearError,
  };
};
