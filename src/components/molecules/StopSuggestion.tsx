import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, typography, scaleWidth } from '~/utils/responsive';
import type { Stop } from '~/services/DepartureService';

interface StopSuggestionProps {
  stop: Stop;
  onPress: (stop: Stop) => void;
  testID?: string;
}

const StopSuggestionNative: React.FC<StopSuggestionProps> = ({ stop, onPress, testID }) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.container, { borderBottomColor: theme.border }]}
      onPress={() => {
        console.log('📱 Native suggestion clicked:', stop.rawName);
        onPress(stop);
      }}
      activeOpacity={0.7}
    >
      <MaterialIcons name="location-pin" size={scaleWidth(16)} color={theme.textSecondary} />
      <Text style={[styles.text, { color: theme.text }]}>{stop.rawName}</Text>
    </TouchableOpacity>
  );
};

const StopSuggestionWeb: React.FC<StopSuggestionProps> = ({ stop, onPress, testID }) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    console.log('🌐 Web suggestion clicked:', stop.rawName);
    console.log('🌐 Stop object:', stop);
    console.log('🌐 onPress function:', typeof onPress);
    onPress(stop);
  };

  // Use onPressIn for web to fire before onBlur
  const handlePressIn = () => {
    console.log('🌐 Press IN (early):', stop.rawName);
    setIsPressed(true);
    // Fire the selection immediately on press in to beat the blur timing
    handlePress();
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.containerWeb,
        { 
          borderBottomColor: theme.border,
          backgroundColor: isPressed 
            ? (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
            : 'transparent'
        }
      ]}
      onPress={handlePress} // Keep this as backup
      onPressIn={handlePressIn} // Primary handler that fires earlier
      onPressOut={() => {
        console.log('🌐 Press OUT:', stop.rawName);
        setIsPressed(false);
      }}
      activeOpacity={1} // Disable default opacity since we're using custom styling
    >
      <MaterialIcons name="location-pin" size={scaleWidth(16)} color={theme.textSecondary} />
      <Text style={[styles.text, { color: theme.text }]}>{stop.rawName}</Text>
    </TouchableOpacity>
  );
};

export const StopSuggestion = Platform.OS === 'web' ? StopSuggestionWeb : StopSuggestionNative;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  containerWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
    cursor: 'pointer' as any,
    userSelect: 'none' as any,
    // Ensure this captures pointer events
    pointerEvents: 'auto' as any,
  },
  text: {
    ...typography.body,
    flex: 1,
  },
});