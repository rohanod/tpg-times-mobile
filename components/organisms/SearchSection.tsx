import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SearchBar } from '../ui/SearchBar';

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onLocationPress: () => void;
  searchLoading: boolean;
  locationLoading: boolean;
  animatedStyle?: any;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onLocationPress,
  searchLoading,
  locationLoading,
  animatedStyle,
}) => {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1001,
  },
});