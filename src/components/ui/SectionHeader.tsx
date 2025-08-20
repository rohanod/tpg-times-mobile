import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '~/utils/responsive';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { useSettings } from '~/hooks/useSettings';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  style,
  leftElement,
  rightElement,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContent}>
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.label }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.secondaryLabel }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(8),
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftElement: {
    marginRight: scaleWidth(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: scaleFont(22),
    fontWeight: '700',
    letterSpacing: 0.35,
    lineHeight: scaleHeight(28),
  },
  subtitle: {
    fontSize: scaleFont(15),
    fontWeight: '400',
    lineHeight: scaleHeight(20),
    marginTop: scaleHeight(2),
  },
  rightElement: {
    marginLeft: scaleWidth(12),
  },
});