import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS } from '../config';

interface WidgetStop {
  id: string;
  name: string;
}

interface SettingsState {
  language: 'en' | 'fr';
  darkMode: boolean;
  timeFormat: 'minutes' | 'time';
  widgetStop: WidgetStop | null;
  widgetLine: string | null;
  widgetDirection: string | null;
  setLanguage: (language: 'en' | 'fr') => void;
  setDarkMode: (darkMode: boolean) => void;
  setTimeFormat: (format: 'minutes' | 'time') => void;
  setWidgetStop: (stop: WidgetStop | null) => void;
  setWidgetLine: (line: string | null) => void;
  setWidgetDirection: (direction: string | null) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: DEFAULT_SETTINGS.language,
      darkMode: DEFAULT_SETTINGS.darkMode,
      timeFormat: DEFAULT_SETTINGS.timeFormat,
      widgetStop: null,
      widgetLine: null,
      widgetDirection: null,
      setLanguage: (language) => set({ language }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setWidgetStop: (stop) => set({ widgetStop: stop }),
      setWidgetLine: (line) => set({ widgetLine: line }),
      setWidgetDirection: (direction) => set({ widgetDirection: direction }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);