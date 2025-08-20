import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '~/utils/responsive';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { useSettings } from '~/hooks/useSettings';

interface AppleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'tinted' | 'plain' | 'gray';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  const getVariantStyles = () => {
    const baseColor = theme.colors.systemBlue;
    
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: disabled ? theme.colors.systemGray4 : baseColor,
          borderWidth: 0,
        };
      case 'tinted':
        return {
          backgroundColor: disabled 
            ? theme.colors.systemGray6 
            : `${baseColor}1A`, // 10% opacity
          borderWidth: 0,
        };
      case 'gray':
        return {
          backgroundColor: disabled 
            ? theme.colors.systemGray6 
            : theme.colors.systemGray5,
          borderWidth: 0,
        };
      case 'plain':
      default:
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.systemGray3;
    }
    
    switch (variant) {
      case 'filled':
        return theme.colors.white;
      case 'tinted':
      case 'plain':
        return theme.colors.systemBlue;
      case 'gray':
        return theme.colors.label;
      default:
        return theme.colors.systemBlue;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: scaleWidth(16),
          paddingVertical: scaleHeight(6),
          minHeight: scaleHeight(30),
          borderRadius: scaleWidth(8),
        };
      case 'large':
        return {
          paddingHorizontal: scaleWidth(24),
          paddingVertical: scaleHeight(14),
          minHeight: scaleHeight(50),
          borderRadius: scaleWidth(12),
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: scaleWidth(20),
          paddingVertical: scaleHeight(10),
          minHeight: scaleHeight(38),
          borderRadius: scaleWidth(10),
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return scaleFont(15);
      case 'large':
        return scaleFont(17);
      case 'medium':
      default:
        return scaleFont(16);
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  const buttonStyle = [
    styles.base,
    variantStyles,
    sizeStyles,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: textColor,
      fontSize: getFontSize(),
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={icon ? { marginRight: scaleWidth(8) } : undefined}
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.24,
  },
  iconContainer: {
    marginRight: scaleWidth(8),
  },
});