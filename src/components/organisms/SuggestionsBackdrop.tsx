import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View, Platform } from 'react-native';

interface SuggestionsBackdropProps {
  visible: boolean;
  onClose: () => void;
}

const SuggestionsBackdropNative: React.FC<SuggestionsBackdropProps> = () => {
  // No backdrop needed for native
  return null;
};

const SuggestionsBackdropWeb: React.FC<SuggestionsBackdropProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.backdrop} />
    </TouchableWithoutFeedback>
  );
};

export const SuggestionsBackdrop = Platform.OS === 'web' ? SuggestionsBackdropWeb : SuggestionsBackdropNative;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999, // Below suggestions but above other content
    backgroundColor: 'transparent', // Invisible but captures touches
    pointerEvents: 'auto' as any,
  },
});