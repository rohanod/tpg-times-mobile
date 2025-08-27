import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { Input } from '../ui/Input';
import { borderRadius, scaleWidth } from '~/utils/responsive';

interface VehicleFilterInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

const VehicleFilterInputComponent: React.FC<VehicleFilterInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  placeholder,
}) => {
  const { language, darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  const defaultPlaceholder = language === 'en'
    ? 'Filter by vehicle number...'
    : 'Filtrer par numéro...';

  return (
    <Input
      testID="vehicle-filter-input"
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={() => onSubmit()}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder || defaultPlaceholder}
      keyboardType="number-pad"
      returnKeyType="done"
      containerStyle={styles.inputContainerStyle}
      rightIcon={(
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="Add vehicle filter"
          testID="add-vehicle-filter-button"
        >
          <MaterialIcons name="add" size={scaleWidth(16)} color="white" />
        </TouchableOpacity>
      )}
    />
  );
};

export const VehicleFilterInput = React.memo(VehicleFilterInputComponent);

const styles = StyleSheet.create({
  inputContainerStyle: {
    marginBottom: 0, // Avoid extra spacing to preserve vertical room
  },
  addButton: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
