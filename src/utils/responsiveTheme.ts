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

export const getResponsiveTheme = (darkMode: boolean) => {
  const baseTheme = getThemeColors(darkMode);
  const deviceAdjustments = getCurrentDeviceAdjustments();

  return {
    ...baseTheme,
    
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