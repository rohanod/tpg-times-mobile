import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';

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
  const theme = getThemeColors(darkMode);

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
        <Plus size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});