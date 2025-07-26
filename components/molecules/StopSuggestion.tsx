import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';
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
  const theme = getThemeColors(darkMode);

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.border }]}
      onPress={() => onPress(stop)}
    >
      <MapPin size={16} color={theme.textSecondary} />
      <Text style={[styles.text, { color: theme.text }]}>{stop.rawName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
});