import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear: () => void;
  onLocationPress: () => void;
  placeholder?: string;
  loading?: boolean;
  locationLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  onLocationPress,
  placeholder,
  loading = false,
  locationLoading = false,
}) => {
  const { darkMode, language } = useSettings();
  const theme = getThemeColors(darkMode);

  const defaultPlaceholder = language === 'en' 
    ? 'Search for a stop...' 
    : 'Rechercher un arrêt...';

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { borderColor: theme.border }]}>
        <Search size={20} color={theme.textSecondary} />
        <TextInput
          autoComplete="off"
          autoCorrect={false}
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={placeholder || defaultPlaceholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="done"
        />
        {value.length > 0 && !loading && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: theme.primary }]}
        onPress={onLocationPress}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MapPin size={20} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    // No additional styling needed
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});