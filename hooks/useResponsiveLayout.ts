import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { 
  isTablet, 
  isSmallDevice, 
  isLargeDevice, 
  getCurrentDeviceAdjustments,
  screenDimensions,
  getResponsiveValue
} from '~/utils/responsive';

interface ResponsiveLayout {
  isTablet: boolean;
  isSmallDevice: boolean;
  isLargeDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  deviceAdjustments: ReturnType<typeof getCurrentDeviceAdjustments>;
  getResponsiveValue: typeof getResponsiveValue;
}

export const useResponsiveLayout = (): ResponsiveLayout => {
  const [dimensions, setDimensions] = useState(screenDimensions);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  return {
    isTablet: isTablet(),
    isSmallDevice: isSmallDevice(),
    isLargeDevice: isLargeDevice(),
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    deviceAdjustments: getCurrentDeviceAdjustments(),
    getResponsiveValue,
  };
};