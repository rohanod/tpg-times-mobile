import React from 'react';
import { FlatList, StyleSheet, StyleProp, ViewStyle, Platform, ScrollView } from 'react-native';
import { StopSuggestion } from '../molecules/StopSuggestion';
import { SuggestionsContainer } from './SuggestionsContainer';
import type { Stop } from '~/services/DepartureService';

interface SuggestionsListProps {
  suggestions: Stop[];
  onStopSelect: (stop: Stop) => void;
  visible: boolean;
  animatedStyle?: StyleProp<ViewStyle>;
}

const SuggestionsListNative: React.FC<SuggestionsListProps> = ({
  suggestions,
  onStopSelect,
  visible,
  animatedStyle,
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  const renderSuggestion = ({ item }: { item: Stop }) => (
    <StopSuggestion stop={item} onPress={onStopSelect} />
  );

  return (
    <SuggestionsContainer isVisible={visible} animatedStyle={animatedStyle}>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item, index) => `${item.id || item.rawName}-${index}`}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
    </SuggestionsContainer>
  );
};

const SuggestionsListWeb: React.FC<SuggestionsListProps> = ({
  suggestions,
  onStopSelect,
  visible,
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  console.log('🌐 SuggestionsListWeb rendering with', suggestions.length, 'suggestions');
  console.log('🌐 onStopSelect function:', typeof onStopSelect);

  return (
    <SuggestionsContainer isVisible={visible}>
      <ScrollView
        style={styles.listWeb}
        showsVerticalScrollIndicator={false}
        bounces={false}
        // Re-add keyboardShouldPersistTaps to prevent blur from consuming touch events
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {suggestions.map((stop, index) => (
          <StopSuggestion
            key={`${stop.id || stop.rawName}-${index}`}
            stop={stop}
            onPress={(selectedStop) => {
              console.log('🌐 SuggestionsList onPress called with:', selectedStop.rawName);
              onStopSelect(selectedStop);
            }}
          />
        ))}
      </ScrollView>
    </SuggestionsContainer>
  );
};

// Platform-specific export
export const SuggestionsList = Platform.OS === 'web' ? SuggestionsListWeb : SuggestionsListNative;

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
  },
  listWeb: {
    maxHeight: 300,
    // Web-specific scroll optimizations
    overflow: 'auto' as any,
  },
});
