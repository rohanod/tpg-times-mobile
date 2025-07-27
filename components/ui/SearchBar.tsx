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
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { componentSizes, borderRadius, spacing } from '~/utils/responsive';

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
  const theme = getResponsiveTheme(darkMode);

  const defaultPlaceholder = language === 'en' 
    ? 'Search for a stop...' 
    : 'Rechercher un arrêt...';

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { borderColor: theme.border }]}>
        <Search size={componentSizes.searchBar.iconSize} color={theme.textSecondary} />
        <TextInput
          autoComplete="off"
          autoCorrect={false}
          style={[styles.searchInput, { color: theme.text, fontSize: componentSizes.searchBar.fontSize }]}
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
            <X size={componentSizes.searchBar.iconSize * 0.9} color={theme.textSecondary} />
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
          <MapPin size={componentSizes.searchBar.iconSize} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: componentSizes.searchBar.paddingHorizontal,
    height: componentSizes.searchBar.height,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  clearButton: {
    // No additional styling needed
  },
  locationButton: {
    width: componentSizes.searchBar.height,
    height: componentSizes.searchBar.height,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});