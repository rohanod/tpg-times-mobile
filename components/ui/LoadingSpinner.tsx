import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  color,
}) => {
  const { darkMode } = useSettings();
  const theme = getThemeColors(darkMode);

  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={color || theme.primary} 
      />
      {text && (
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});