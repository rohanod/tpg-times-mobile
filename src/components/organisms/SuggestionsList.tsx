import React from 'react';
import { FlatList, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { StopSuggestion } from '../molecules/StopSuggestion';
import { borderRadius, scaleHeight } from '~/utils/responsive';
import { LAYOUT } from '~/utils/layout';
import type { Stop } from '~/services/DepartureService';

interface SuggestionsListProps {
  suggestions: Stop[];
  onStopSelect: (stop: Stop) => void;
  visible: boolean;
  animatedStyle?: StyleProp<ViewStyle>;
}

const SuggestionsListComponent: React.FC<SuggestionsListProps> = ({
  suggestions,
  onStopSelect,
  visible,
  animatedStyle,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

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

export const SuggestionsList = React.memo(SuggestionsListComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: LAYOUT.SUGGESTIONS_TOP,
    left: LAYOUT.CONTAINER_PADDING,
    right: LAYOUT.CONTAINER_PADDING,
    zIndex: 1000,
    borderRadius: borderRadius.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    maxHeight: scaleHeight(250),
  },
  list: {
    flexGrow: 0,
  },
});
