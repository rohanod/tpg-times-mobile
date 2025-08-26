import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from '../config';

// Conditional imports based on platform
let create: any;
let persist: any;
let createJSONStorage: any;

if (typeof Platform !== 'undefined' && Platform.OS === 'web') {
  // Use traditional API for web to avoid import.meta issues
  const zustandTraditional = require('zustand/traditional');
  create = zustandTraditional.createWithEqualityFn;
  persist = require('zustand/middleware').persist;
  createJSONStorage = require('zustand/middleware').createJSONStorage;
} else {
  // Use regular API for native platforms
  create = require('zustand').create;
  persist = require('zustand/middleware').persist;
  createJSONStorage = require('zustand/middleware').createJSONStorage;
}

interface SettingsState {
  language: 'en' | 'fr';
  darkMode: boolean;
  timeFormat: 'minutes' | 'time';
  setLanguage: (language: 'en' | 'fr') => void;
  setDarkMode: (darkMode: boolean) => void;
  setTimeFormat: (format: 'minutes' | 'time') => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: DEFAULT_SETTINGS.language,
      darkMode: DEFAULT_SETTINGS.darkMode,
      timeFormat: DEFAULT_SETTINGS.timeFormat,
      setLanguage: (language) => set({ language }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);