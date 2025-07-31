import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, typography, scaleWidth } from '~/utils/responsive';
import type { Stop } from '~/services/DepartureService';

interface StopSuggestionProps {
  stop: Stop;
  onPress: (stop: Stop) => void;
}

export const StopSuggestion: React.FC<StopSuggestionProps> = ({
  stop,
  onPress,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.border }]}
      onPress={() => onPress(stop)}
    >
      <MaterialIcons name="location-pin" size={scaleWidth(16)} color={theme.textSecondary} />
      <Text style={[styles.text, { color: theme.text }]}>{stop.rawName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  text: {
    ...typography.body,
    flex: 1,
  },
});