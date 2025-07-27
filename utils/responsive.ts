import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro as reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  
  return (
    (SCREEN_WIDTH >= 768 && SCREEN_HEIGHT >= 1024) ||
    (SCREEN_WIDTH >= 1024 && SCREEN_HEIGHT >= 768)
  );
};

export const isSmallDevice = () => SCREEN_WIDTH < 375;
export const isLargeDevice = () => SCREEN_WIDTH > 414;

// Responsive scaling functions
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const scaleFont = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
  const newSize = size * scale;
  
  // Ensure minimum readable font size
  if (Platform.OS === 'ios') {
    return Math.max(newSize, 12);
  }
  return Math.max(newSize, 14);
};

// Responsive spacing
export const spacing = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(12),
  lg: scaleWidth(16),
  xl: scaleWidth(20),
  xxl: scaleWidth(24),
  xxxl: scaleWidth(32),
};

// Responsive border radius
export const borderRadius = {
  sm: scaleWidth(4),
  md: scaleWidth(8),
  lg: scaleWidth(12),
  xl: scaleWidth(16),
  xxl: scaleWidth(20),
  round: scaleWidth(50),
};

// Responsive component sizes
export const componentSizes = {
  button: {
    small: {
      height: scaleHeight(32),
      paddingHorizontal: scaleWidth(12),
      fontSize: scaleFont(14),
    },
    medium: {
      height: scaleHeight(44),
      paddingHorizontal: scaleWidth(16),
      fontSize: scaleFont(16),
    },
    large: {
      height: scaleHeight(52),
      paddingHorizontal: scaleWidth(20),
      fontSize: scaleFont(18),
    },
  },
  input: {
    height: scaleHeight(44),
    paddingHorizontal: scaleWidth(12),
    fontSize: scaleFont(16),
  },
  searchBar: {
    height: scaleHeight(44),
    paddingHorizontal: scaleWidth(12),
    fontSize: scaleFont(16),
    iconSize: scaleWidth(20),
  },
  card: {
    padding: scaleWidth(16),
    borderRadius: borderRadius.lg,
    minHeight: scaleHeight(80),
  },
  header: {
    height: scaleHeight(60),
    fontSize: scaleFont(28),
  },
};

// Responsive layout helpers
export const layout = {
  containerPadding: spacing.lg,
  sectionSpacing: spacing.xl,
  cardSpacing: spacing.md,
  listItemSpacing: spacing.sm,
};

// Device-specific adjustments
export const deviceAdjustments = {
  // Small devices (iPhone SE, etc.)
  small: {
    fontSize: {
      title: scaleFont(24),
      subtitle: scaleFont(18),
      body: scaleFont(14),
      caption: scaleFont(12),
    },
    spacing: {
      container: scaleWidth(12),
      section: scaleWidth(16),
    },
  },
  // Regular devices
  regular: {
    fontSize: {
      title: scaleFont(28),
      subtitle: scaleFont(20),
      body: scaleFont(16),
      caption: scaleFont(14),
    },
    spacing: {
      container: scaleWidth(16),
      section: scaleWidth(20),
    },
  },
  // Large devices (iPhone Pro Max, etc.)
  large: {
    fontSize: {
      title: scaleFont(32),
      subtitle: scaleFont(22),
      body: scaleFont(18),
      caption: scaleFont(16),
    },
    spacing: {
      container: scaleWidth(20),
      section: scaleWidth(24),
    },
  },
  // Tablets
  tablet: {
    fontSize: {
      title: scaleFont(36),
      subtitle: scaleFont(24),
      body: scaleFont(20),
      caption: scaleFont(18),
    },
    spacing: {
      container: scaleWidth(24),
      section: scaleWidth(32),
    },
  },
};

// Get current device adjustments
export const getCurrentDeviceAdjustments = () => {
  if (isTablet()) return deviceAdjustments.tablet;
  if (isSmallDevice()) return deviceAdjustments.small;
  if (isLargeDevice()) return deviceAdjustments.large;
  return deviceAdjustments.regular;
};

// Responsive typography
export const typography = {
  title: {
    fontSize: getCurrentDeviceAdjustments().fontSize.title,
    fontWeight: 'bold' as const,
    lineHeight: getCurrentDeviceAdjustments().fontSize.title * 1.2,
  },
  subtitle: {
    fontSize: getCurrentDeviceAdjustments().fontSize.subtitle,
    fontWeight: '600' as const,
    lineHeight: getCurrentDeviceAdjustments().fontSize.subtitle * 1.3,
  },
  body: {
    fontSize: getCurrentDeviceAdjustments().fontSize.body,
    fontWeight: '400' as const,
    lineHeight: getCurrentDeviceAdjustments().fontSize.body * 1.4,
  },
  caption: {
    fontSize: getCurrentDeviceAdjustments().fontSize.caption,
    fontWeight: '400' as const,
    lineHeight: getCurrentDeviceAdjustments().fontSize.caption * 1.3,
  },
};

// Animation values that scale with device
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  translate: {
    small: scaleWidth(10),
    medium: scaleWidth(20),
    large: scaleWidth(50),
    screen: SCREEN_WIDTH,
  },
};

// Export screen dimensions for components that need them
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

// Utility function to get responsive value based on screen size
export const getResponsiveValue = <T>(values: {
  small?: T;
  regular: T;
  large?: T;
  tablet?: T;
}): T => {
  if (isTablet() && values.tablet) return values.tablet;
  if (isLargeDevice() && values.large) return values.large;
  if (isSmallDevice() && values.small) return values.small;
  return values.regular;
};

// Safe area helpers
export const getSafeAreaPadding = (insets: { top: number; bottom: number; left: number; right: number }) => ({
  paddingTop: spacing.sm, // Minimal top padding since we're in SafeAreaView
  paddingBottom: Math.max(insets.bottom, spacing.sm),
  paddingLeft: Math.max(insets.left, spacing.lg),
  paddingRight: Math.max(insets.right, spacing.lg),
});

// Better safe area helper that respects SafeAreaView
export const getContentPadding = () => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
});