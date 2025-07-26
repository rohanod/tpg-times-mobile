import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';
import { StopSuggestion } from '../molecules/StopSuggestion';
import type { Stop } from '~/services/DepartureService';

interface SuggestionsListProps {
  suggestions: Stop[];
  onStopSelect: (stop: Stop) => void;
  visible: boolean;
  animatedStyle?: any;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  onStopSelect,
  visible,
  animatedStyle,
}) => {
  const { darkMode } = useSettings();
  const theme = getThemeColors(darkMode);

  if (!visible || suggestions.length === 0) {
    return null;
  }

  const renderSuggestion = ({ item }: { item: Stop }) => (
    <StopSuggestion stop={item} onPress={onStopSelect} />
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item, index) => `${item.id || item.rawName}-${index}`}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    maxHeight: 250,
  },
  list: {
    flexGrow: 0,
  },
});