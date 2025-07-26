import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';

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
  const theme = getThemeColors(darkMode);

  const displayRetryText = language === 'en' ? retryText : 'Réessayer';

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.content}>
        <AlertCircle size={24} color="#FF3B30" />
        <Text style={[styles.message, { color: '#FF3B30' }]}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: theme.border }]}
          onPress={onRetry}
        >
          <RefreshCw size={16} color={theme.primary} />
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
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});