import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, borderRadius, scaleFont, scaleWidth } from '~/utils/responsive';

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
  const theme = getResponsiveTheme(darkMode);

  return (
    <View style={[styles.container, { backgroundColor: color || theme.primary }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <MaterialIcons name="close" size={14} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  removeButton: {
    width: scaleWidth(18),
    height: scaleWidth(18),
    borderRadius: scaleWidth(9),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});