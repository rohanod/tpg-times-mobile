import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, typography } from '~/utils/responsive';

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
  const theme = getResponsiveTheme(darkMode);

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
    gap: spacing.sm,
  },
  text: {
    ...typography.body,
    textAlign: 'center',
  },
});