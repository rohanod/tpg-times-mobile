import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from '../config';

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