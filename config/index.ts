// Centralized configuration for the TPG Times Mobile app
import { COLORS, getThemeColors } from './theme';

export { COLORS, getThemeColors };

export const API_ENDPOINTS = {
  LOCATIONS: "https://transport.opendata.ch/v1/locations",
  STATIONBOARD: "https://search.ch/timetable/api/stationboard.fr.json",
  ARRETS_CSV: "https://raw.githubusercontent.com/rohanod/arrets/refs/heads/main/arrets.csv"
};

export const TIME_CONFIG = {
  TIMEZONE: "Europe/Zurich",
  STATIONBOARD_LIMIT: 250,
  DEBOUNCE_DELAY: 600,
  REFRESH_INTERVALS: {
    NORMAL_MODE: 30000,
    UNINTERACTIVE_MODE: 20000,
    COUNTDOWN: 5000
  },
  ANIMATION_DELAYS: {
    MODAL: 300,
    VISIBILITY: 500,
    RESIZE: 500,
    DEVTOOLS: 300,
    FADE: 300
  },
  GRID_CELLS_PER_ROW: 2,
  MAX_DEPARTURES_SHOWN: 6
};

export const UI_CONFIG = {
  SUGGESTIONS_LIMIT: 4,
  DEFAULT_LANGUAGE: "en",
  LANGUAGES: {
    EN: "en",
    FR: "fr"
  }
};

export const URL_PARAMS = {
  DARK_MODE: "darkMode",
  LANGUAGE: "lang",
  STOP: "stop",
  NUMBERS: "numbers",
  UNINTERACTIVE: "uninteractive",
  TIME_FORMAT: "timeFormat"
};

export const DEFAULT_SETTINGS = {
  darkMode: false,
  language: UI_CONFIG.LANGUAGES.EN,
  timeFormat: "minutes"
};