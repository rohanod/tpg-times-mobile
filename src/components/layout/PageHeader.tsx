import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { useResponsiveLayout } from '~/hooks/useResponsiveLayout';
import { LAYOUT } from '~/utils/layout';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  rightElement,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);
  const layout = useResponsiveLayout();

  return (
    <View style={[
      styles.container,
      {
        paddingHorizontal: LAYOUT.CONTAINER_PADDING,
        paddingTop: LAYOUT.SECTION_GAP,
        paddingBottom: LAYOUT.SECTION_GAP,
        minHeight: LAYOUT.HEADER_HEIGHT,
      }
    ]}>
      <View style={styles.titleContainer}>
        <Text style={[
          theme.typography.title,
          { color: theme.text },
          // Adjust title size for small devices
          layout.isSmallDevice && { fontSize: theme.typography.title.fontSize * 0.9 }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[
            theme.typography.caption,
            { color: theme.textSecondary, marginTop: theme.spacing.xs / 2 }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && (
        <View style={styles.rightElement}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  rightElement: {
    marginLeft: 16,
  },
});