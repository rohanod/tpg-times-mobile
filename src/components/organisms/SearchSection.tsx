import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { SearchBar } from '../ui/SearchBar';
import { LAYOUT } from '~/utils/layout';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLocationPress: () => void;
  searchLoading: boolean;
  locationLoading: boolean;
  animatedStyle?: StyleProp<ViewStyle>;
  suggestionsVisible?: boolean; // Add this prop to control z-index
}

const SearchSectionComponent: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLocationPress,
  searchLoading,
  locationLoading,
  animatedStyle,
  suggestionsVisible = false,
}) => {
  return (
    <Animated.View 
      style={[
        styles.container, 
        // Boost z-index when suggestions are visible on web
        Platform.OS === 'web' && suggestionsVisible && styles.containerWebElevated,
        animatedStyle
      ]}
    >
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        onClear={onClearSearch}
        onLocationPress={onLocationPress}
        loading={searchLoading}
        locationLoading={locationLoading}
      />
    </Animated.View>
  );
};

export const SearchSection = React.memo(SearchSectionComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: LAYOUT.CONTAINER_PADDING,
    paddingTop: 0, // Remove top padding to maximize space
    paddingBottom: LAYOUT.SECTION_GAP,
    zIndex: 1001,
  },
  containerWebElevated: {
    zIndex: 1001, // Above backdrop when suggestions visible
  },
});
