import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { borderRadius, spacing } from '~/utils/responsive';
import { LAYOUT } from '~/utils/layout';

interface SuggestionsContainerProps {
  keyboardHeight: Animated.SharedValue<number>;
  searchHeight: number;
  availableHeight: number;
  isVisible: boolean;
  children?: React.ReactNode;
  animatedStyle?: StyleProp<ViewStyle>;
}

const SuggestionsContainerComponent: React.FC<SuggestionsContainerProps> = ({
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
    // Calculate the available space between search bar and keyboard
    const maxHeight = availableHeight - searchHeight - keyboardHeight.value - (LAYOUT.CONTAINER_PADDING * 2) - 20; // 20px total padding (10px top + 10px bottom)
    
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

export const SuggestionsContainer = React.memo(SuggestionsContainerComponent);

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
    zIndex: 100, // Ensure it appears above other elements
  },
});