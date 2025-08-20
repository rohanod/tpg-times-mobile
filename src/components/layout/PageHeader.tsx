import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { useResponsiveLayout } from '~/hooks/useResponsiveLayout';
import { scaleFont, scaleHeight, scaleWidth } from '~/utils/responsive';
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
        paddingTop: scaleHeight(8),
        paddingBottom: LAYOUT.SECTION_GAP,
        minHeight: LAYOUT.HEADER_HEIGHT,
      }
    ]}>
      <View style={styles.titleContainer}>
        <Text style={[
          styles.title,
          {
            color: theme.colors?.label || theme.text,
            fontSize: layout.isSmallDevice ? scaleFont(28) : scaleFont(32),
          }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[
            styles.subtitle,
            { 
              color: theme.colors?.secondaryLabel || theme.textSecondary,
              marginTop: scaleHeight(2)
            }
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.35,
    lineHeight: scaleHeight(38),
  },
  subtitle: {
    fontSize: scaleFont(15),
    fontWeight: '400',
    lineHeight: scaleHeight(20),
  },
  rightElement: {
    marginLeft: scaleWidth(16),
    alignItems: 'flex-end',
  },
});