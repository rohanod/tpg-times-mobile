import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, borderRadius, typography, scaleWidth } from '~/utils/responsive';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Retry',
}) => {
  const { darkMode, language } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  const displayRetryText = language === 'en' ? retryText : 'Réessayer';

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.content}>
        <AlertCircle size={scaleWidth(24)} color="#FF3B30" />
        <Text style={[styles.message, { color: '#FF3B30' }]}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.border }]}
          onPress={onRetry}
        >
          <RefreshCw size={scaleWidth(16)} color={theme.primary} />
          <Text style={[styles.retryText, { color: theme.primary }]}>
            {displayRetryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.caption,
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  retryText: {
    ...typography.caption,
    fontWeight: '500',
  },
});