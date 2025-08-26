import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Platform, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { borderRadius, spacing, componentSizes } from '~/utils/responsive';
import { LAYOUT } from '~/utils/layout';

interface SuggestionsContainerProps {
  keyboardHeight?: Animated.SharedValue<number>;
  searchHeight?: number;
  availableHeight?: number;
  isVisible: boolean;
  children?: React.ReactNode;
  animatedStyle?: StyleProp<ViewStyle>;
}

const SuggestionsContainerNative: React.FC<SuggestionsContainerProps> = ({
  keyboardHeight,
  searchHeight,
  availableHeight,
  isVisible,
  children,
  animatedStyle,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    if (!keyboardHeight || !searchHeight || !availableHeight) return {};
    // Calculate the available space between search bar and keyboard
    const maxHeight = availableHeight - searchHeight - keyboardHeight.value - (LAYOUT.CONTAINER_PADDING * 2) - 20;

    return {
      height: Math.max(0, maxHeight),
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: darkMode
            ? 'rgba(28, 28, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          shadowColor: darkMode ? '#000' : '#000',
          borderColor: theme.border,
          borderWidth: 1,
        },
        containerAnimatedStyle,
        animatedStyle,
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
};

const SuggestionsContainerWeb: React.FC<SuggestionsContainerProps> = ({
  isVisible,
  children,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  if (!isVisible) return null;

  return (
    <View
      style={[
        styles.containerWeb,
        {
          backgroundColor: darkMode
            ? 'rgba(28, 28, 30, 0.98)'
            : 'rgba(255, 255, 255, 0.98)',
          shadowColor: darkMode ? '#000' : '#000',
          borderColor: theme.border,
          borderWidth: 1,
        },
      ]}
    >
      {children}
    </View>
  );
};

// Platform-specific export
export const SuggestionsContainer = Platform.OS === 'web' ? SuggestionsContainerWeb : SuggestionsContainerNative;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, // Will be positioned after search section
    left: LAYOUT.CONTAINER_PADDING,
    right: LAYOUT.CONTAINER_PADDING,
    borderRadius: borderRadius.xl,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    overflow: 'hidden',
    zIndex: 100,
  },
  containerWeb: {
    position: 'absolute',
    // Position exactly under the search bar, accounting for page header
    top: LAYOUT.HEADER_HEIGHT + componentSizes.searchBar.height + 4, // Header + SearchBar + small gap
    left: LAYOUT.CONTAINER_PADDING,
    right: LAYOUT.CONTAINER_PADDING,
    borderRadius: borderRadius.lg,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
    zIndex: 1000, // Above backdrop (999)
    maxHeight: 400, // Allow more height for suggestions
    // Web-specific backdrop for better visibility
    backdropFilter: 'blur(10px)' as any,
    WebkitBackdropFilter: 'blur(10px)' as any,
    // Ensure pointer events work
    pointerEvents: 'auto' as any,
  },
});