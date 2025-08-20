import { getThemeColors } from '~/config/theme';
import { 
  getCurrentDeviceAdjustments, 
  spacing, 
  borderRadius, 
  componentSizes,
  typography,
  isTablet,
  isSmallDevice,
  isLargeDevice
} from './responsive';

// Apple System Colors
const getAppleSystemColors = (darkMode: boolean) => ({
  // Primary colors
  systemBlue: darkMode ? '#0A84FF' : '#007AFF',
  systemGreen: darkMode ? '#30D158' : '#34C759',
  systemIndigo: darkMode ? '#5E5CE6' : '#5856D6',
  systemOrange: darkMode ? '#FF9F0A' : '#FF9500',
  systemPink: darkMode ? '#FF375F' : '#FF2D92',
  systemPurple: darkMode ? '#BF5AF2' : '#AF52DE',
  systemRed: darkMode ? '#FF453A' : '#FF3B30',
  systemTeal: darkMode ? '#40C8E0' : '#5AC8FA',
  systemYellow: darkMode ? '#FFD60A' : '#FFCC00',

  // Grays
  systemGray: darkMode ? '#8E8E93' : '#8E8E93',
  systemGray2: darkMode ? '#636366' : '#AEAEB2',
  systemGray3: darkMode ? '#48484A' : '#C7C7CC',
  systemGray4: darkMode ? '#3A3A3C' : '#D1D1D6',
  systemGray5: darkMode ? '#2C2C2E' : '#E5E5EA',
  systemGray6: darkMode ? '#1C1C1E' : '#F2F2F7',

  // Labels
  label: darkMode ? '#FFFFFF' : '#000000',
  secondaryLabel: darkMode ? '#EBEBF599' : '#3C3C4399',
  tertiaryLabel: darkMode ? '#EBEBF54C' : '#3C3C434C',
  quaternaryLabel: darkMode ? '#EBEBF52D' : '#3C3C432D',

  // Text
  placeholderText: darkMode ? '#EBEBF54C' : '#3C3C434C',

  // Separators
  separator: darkMode ? '#54545899' : '#3C3C434A',
  opaqueSeparator: darkMode ? '#38383A' : '#C6C6C8',

  // Non-adaptive colors
  link: darkMode ? '#0984FF' : '#007AFF',

  // Backgrounds
  systemBackground: darkMode ? '#000000' : '#FFFFFF',
  secondarySystemBackground: darkMode ? '#1C1C1E' : '#F2F2F7',
  tertiarySystemBackground: darkMode ? '#2C2C2E' : '#FFFFFF',
  
  // Grouped backgrounds
  systemGroupedBackground: darkMode ? '#000000' : '#F2F2F7',
  secondarySystemGroupedBackground: darkMode ? '#1C1C1E' : '#FFFFFF',
  tertiarySystemGroupedBackground: darkMode ? '#2C2C2E' : '#F2F2F7',

  // Fills
  systemFill: darkMode ? '#78788033' : '#78788033',
  secondarySystemFill: darkMode ? '#78788028' : '#78788028',
  tertiarySystemFill: darkMode ? '#7676801F' : '#7676801F',
  quaternarySystemFill: darkMode ? '#74748014' : '#74748014',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  clear: 'transparent',
});

export const getResponsiveTheme = (darkMode: boolean) => {
  const baseTheme = getThemeColors(darkMode);
  const deviceAdjustments = getCurrentDeviceAdjustments();
  const appleColors = getAppleSystemColors(darkMode);

  return {
    ...baseTheme,
    
    // Add Apple system colors
    colors: {
      ...baseTheme,
      ...appleColors,
    },
    
    // Responsive spacing
    spacing: {
      ...spacing,
      container: deviceAdjustments.spacing.container,
      section: deviceAdjustments.spacing.section,
    },

    // Responsive typography
    typography: {
      ...typography,
      title: {
        ...typography.title,
        fontSize: deviceAdjustments.fontSize.title,
      },
      subtitle: {
        ...typography.subtitle,
        fontSize: deviceAdjustments.fontSize.subtitle,
      },
      body: {
        ...typography.body,
        fontSize: deviceAdjustments.fontSize.body,
      },
      caption: {
        ...typography.caption,
        fontSize: deviceAdjustments.fontSize.caption,
      },
    },

    // Responsive component sizes
    components: {
      ...componentSizes,
      // Adjust button sizes for tablets
      button: {
        ...componentSizes.button,
        ...(isTablet() && {
          small: {
            ...componentSizes.button.small,
            height: componentSizes.button.small.height * 1.1,
          },
          medium: {
            ...componentSizes.button.medium,
            height: componentSizes.button.medium.height * 1.1,
          },
          large: {
            ...componentSizes.button.large,
            height: componentSizes.button.large.height * 1.1,
          },
        }),
      },
      // Adjust input sizes for small devices
      input: {
        ...componentSizes.input,
        ...(isSmallDevice() && {
          height: componentSizes.input.height * 0.9,
        }),
      },
    },

    // Responsive border radius
    borderRadius: {
      ...borderRadius,
      // Slightly larger radius on tablets
      ...(isTablet() && {
        sm: borderRadius.sm * 1.2,
        md: borderRadius.md * 1.2,
        lg: borderRadius.lg * 1.2,
        xl: borderRadius.xl * 1.2,
        xxl: borderRadius.xxl * 1.2,
      }),
    },

    // Device type flags
    device: {
      isTablet: isTablet(),
      isSmallDevice: isSmallDevice(),
      isLargeDevice: isLargeDevice(),
    },
  };
};

export type ResponsiveTheme = ReturnType<typeof getResponsiveTheme>;