// Centralized theme configuration for the TPG Times Mobile app

export const COLORS = {
  // Primary colors
  PRIMARY: '#FF6600',
  
  // Background colors
  BACKGROUND: {
    LIGHT: '#FFFFFF',
    DARK: '#000000'
  },
  
  // Surface colors (for cards, sections, etc.)
  SURFACE: {
    LIGHT: '#F5F5F5',
    DARK: '#1C1C1E'
  },
  
  // Text colors
  TEXT: {
    LIGHT: '#333333',
    DARK: '#FFFFFF',
    SECONDARY_LIGHT: '#999999',
    SECONDARY_DARK: '#666666',
    PLACEHOLDER_LIGHT: '#999999',
    PLACEHOLDER_DARK: '#666666'
  },
  
  // Border colors - standardized across the app
  BORDER: {
    LIGHT: '#DDDDDD',
    DARK: '#333333',
    DIVIDER_LIGHT: '#EEEEEE',
    DIVIDER_DARK: '#555555',
    STOP_NAME_LIGHT: '#DDDDDD',
    STOP_NAME_DARK: '#333333',
    VEHICLE_NUMBER_LIGHT: '#DDDDDD',
    VEHICLE_NUMBER_DARK: '#333333',
    SUGGESTIONS_LIGHT: '#DDDDDD',
    SUGGESTIONS_DARK: '#333333'
  },
  
  // Status colors
  STATUS: {
    ERROR: '#FF3B30',
    SUCCESS: '#34C759',
    WARNING: '#FFCC00',
    INFO: '#007AFF'
  },
  
  // Tab bar colors
  TAB_BAR: {
    ACTIVE: '#FFFFFF',
    INACTIVE: '#FFEBE0',
    BACKGROUND: '#FF6600'
  },
  
  // Switch colors
  SWITCH: {
    TRACK_OFF: '#767577',
    TRACK_ON: '#FF6600',
    THUMB_IOS: '#FFFFFF',
    THUMB_ANDROID: '#f4f3f4'
  },
  
  // Utility colors
  UTILITY: {
    SHADOW: '#000000',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    TRANSPARENT: 'transparent',
    LOADING_INDICATOR: '#FF6600'
  }
};

// Function to get theme colors based on dark mode
export const getThemeColors = (darkMode: boolean) => {
  return {
    background: darkMode ? COLORS.BACKGROUND.DARK : COLORS.BACKGROUND.LIGHT,
    surface: darkMode ? COLORS.SURFACE.DARK : COLORS.SURFACE.LIGHT,
    text: darkMode ? COLORS.TEXT.DARK : COLORS.TEXT.LIGHT,
    textSecondary: darkMode ? COLORS.TEXT.SECONDARY_DARK : COLORS.TEXT.SECONDARY_LIGHT,
    placeholderText: darkMode ? COLORS.TEXT.PLACEHOLDER_DARK : COLORS.TEXT.PLACEHOLDER_LIGHT,
    border: darkMode ? COLORS.BORDER.DARK : COLORS.BORDER.LIGHT,
    borderDivider: darkMode ? COLORS.BORDER.DIVIDER_DARK : COLORS.BORDER.DIVIDER_LIGHT,
    stopNameBorder: darkMode ? COLORS.BORDER.STOP_NAME_DARK : COLORS.BORDER.STOP_NAME_LIGHT,
    vehicleNumberBorder: darkMode ? COLORS.BORDER.VEHICLE_NUMBER_DARK : COLORS.BORDER.VEHICLE_NUMBER_LIGHT,
    suggestionsBorder: darkMode ? COLORS.BORDER.SUGGESTIONS_DARK : COLORS.BORDER.SUGGESTIONS_LIGHT,
    primary: COLORS.PRIMARY,
    tabBarBackground: COLORS.TAB_BAR.BACKGROUND,
    tabBarActive: COLORS.TAB_BAR.ACTIVE,
    tabBarInactive: COLORS.TAB_BAR.INACTIVE,
    switchTrackOff: COLORS.SWITCH.TRACK_OFF,
    switchTrackOn: COLORS.SWITCH.TRACK_ON,
    switchThumb: Platform.OS === 'ios' ? COLORS.SWITCH.THUMB_IOS : COLORS.SWITCH.THUMB_ANDROID,
    loadingIndicator: COLORS.UTILITY.LOADING_INDICATOR
  };
};

// Import Platform for OS-specific switch thumb colors
import { Platform } from 'react-native';