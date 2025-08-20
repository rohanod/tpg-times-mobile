import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ViewStyle,
} from 'react-native';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { scaleHeight, scaleWidth, scaleFont } from '~/utils/responsive';

export interface SettingsSection {
  id: string;
  title?: string;
  items: SettingsItem[];
}

export interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'disclosure' | 'destructive' | 'value';
  value?: boolean | string;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  disabled?: boolean;
}

interface SettingsListProps {
  sections: SettingsSection[];
  style?: ViewStyle;
  darkMode?: boolean;
}

export const SettingsList: React.FC<SettingsListProps> = ({ sections, style, darkMode = false }) => {
  const theme = getResponsiveTheme(darkMode);

  const renderItem = (item: SettingsItem, isFirst: boolean, isLast: boolean) => {
    const itemStyles = [
      styles.settingItem,
      {
        backgroundColor: theme.colors.secondarySystemGroupedBackground,
        borderTopWidth: isFirst ? 0 : StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.separator,
        borderTopLeftRadius: isFirst ? theme.borderRadius.lg : 0,
        borderTopRightRadius: isFirst ? theme.borderRadius.lg : 0,
        borderBottomLeftRadius: isLast ? theme.borderRadius.lg : 0,
        borderBottomRightRadius: isLast ? theme.borderRadius.lg : 0,
      },
    ];

    const renderRightElement = () => {
      switch (item.type) {
        case 'toggle':
          return (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onValueChange}
              disabled={item.disabled}
              trackColor={{
                false: theme.colors.systemGray5,
                true: theme.colors.systemBlue,
              }}
              thumbColor={theme.colors.white}
              ios_backgroundColor={theme.colors.systemGray5}
            />
          );
        case 'disclosure':
          return (
            <View style={styles.disclosureIndicator}>
              <Text style={[styles.disclosureText, { color: theme.colors.systemGray2 }]}>
                ›
              </Text>
            </View>
          );
        case 'value':
          return (
            <Text style={[styles.valueText, { color: theme.colors.systemGray }]}>
              {item.value as string}
            </Text>
          );
        default:
          return null;
      }
    };

    const isInteractive = item.type === 'disclosure' || item.type === 'destructive';
    const ItemWrapper = isInteractive ? TouchableOpacity : View;

    return (
      <ItemWrapper
        key={item.id}
        style={itemStyles}
        onPress={isInteractive ? item.onPress : undefined}
        disabled={item.disabled}
        activeOpacity={0.6}
        accessibilityLabel={item.accessibilityLabel || item.title}
        accessibilityRole={item.type === 'toggle' ? 'switch' : 'button'}
      >
        <View style={styles.itemContent}>
          {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: item.type === 'destructive'
                    ? theme.colors.systemRed
                    : theme.colors.label,
                },
                item.disabled && { opacity: 0.5 },
              ]}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text
                style={[
                  styles.itemSubtitle,
                  { color: theme.colors.secondaryLabel },
                  item.disabled && { opacity: 0.5 },
                ]}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightElement}>{renderRightElement()}</View>
      </ItemWrapper>
    );
  };

  const renderSection = (section: SettingsSection, sectionIndex: number) => (
    <View key={section.id} style={styles.section}>
      {section.title && (
        <Text style={[styles.sectionTitle, { color: theme.colors.secondaryLabel }]}>
          {section.title.toUpperCase()}
        </Text>
      )}
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.systemGroupedBackground }]}>
        {section.items.map((item, index) =>
          renderItem(
            item,
            index === 0,
            index === section.items.length - 1
          )
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {sections.map(renderSection)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: scaleHeight(35),
  },
  sectionTitle: {
    fontSize: scaleFont(13),
    fontWeight: '400',
    letterSpacing: -0.08,
    marginBottom: scaleHeight(6),
    marginHorizontal: scaleWidth(20),
  },
  sectionContent: {
    marginHorizontal: scaleWidth(20),
    borderRadius: scaleWidth(10),
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scaleHeight(44),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: scaleWidth(29),
    height: scaleHeight(29),
    marginRight: scaleWidth(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleWidth(6),
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: scaleFont(17),
    fontWeight: '400',
    lineHeight: scaleHeight(22),
  },
  itemSubtitle: {
    fontSize: scaleFont(15),
    fontWeight: '400',
    lineHeight: scaleHeight(18),
    marginTop: scaleHeight(2),
  },
  rightElement: {
    marginLeft: scaleWidth(8),
  },
  disclosureIndicator: {
    width: scaleWidth(7),
    height: scaleHeight(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclosureText: {
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  valueText: {
    fontSize: scaleFont(17),
    fontWeight: '400',
  },
});