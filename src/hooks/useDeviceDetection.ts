import { Dimensions, Platform } from 'react-native';

// Synchronous check for immediate device type detection
export function getIsPhone(): boolean {
  const { width } = Dimensions.get('window');

  // Quick check: consider it a phone if width is less than 768px (tablet breakpoint)
  // This is synchronous and doesn't require useEffect
  return width < 768;
}

// Hook version for components that need to respond to orientation changes
export function useDeviceDetection() {
  const isPhone = getIsPhone();

  return {
    isPhone,
    isTablet: !isPhone,
    platform: Platform.OS,
  };
}

// Export the immediate check function for use in layout
export { getIsPhone as isPhone };
