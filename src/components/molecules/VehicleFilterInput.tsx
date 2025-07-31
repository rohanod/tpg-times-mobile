import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, borderRadius, typography, scaleWidth } from '~/utils/responsive';

interface VehicleFilterInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export const VehicleFilterInput: React.FC<VehicleFilterInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder,
}) => {
  const { darkMode, language } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  const defaultPlaceholder = language === 'en'
    ? 'Filter by vehicle number...'
    : 'Filtrer par numéro...';

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder || defaultPlaceholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        keyboardType="number-pad"
      />
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={onSubmit}
      >
        <MaterialIcons name="add" size={scaleWidth(16)} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
  },
  addButton: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});