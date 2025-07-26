import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  color?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  color,
}) => {
  const { darkMode } = useSettings();
  const theme = getThemeColors(darkMode);

  return (
    <View style={[styles.container, { backgroundColor: color || theme.primary }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <X size={14} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});