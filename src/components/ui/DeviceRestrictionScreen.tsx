import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '~/utils/responsive';
import { COLORS, getThemeColors } from '~/config/theme';
import { useLanguageDetection } from '~/hooks/useLanguageDetection';
import { getDeviceRestrictionTranslations } from '~/translations/deviceRestriction';

interface DeviceRestrictionScreenProps {
  darkMode: boolean;
}

export const DeviceRestrictionScreen: React.FC<DeviceRestrictionScreenProps> = ({ darkMode }) => {
  const { width, height } = Dimensions.get('window');
  const language = useLanguageDetection();
  const translations = getDeviceRestrictionTranslations(language);
  const theme = getThemeColors(darkMode);

  // Calculate responsive scaling based on screen size
  const isLargeScreen = width > 1200;
  const isMediumScreen = width > 768 && width <= 1200;
  const isSmallScreen = width <= 768;

  // Scale factors for different screen sizes
  const scaleFactor = isLargeScreen ? 0.6 : isMediumScreen ? 0.8 : 1;
  const qrScaleFactor = isLargeScreen ? 0.5 : isMediumScreen ? 0.65 : 1;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: scaleWidth(Math.max(16, 24 * scaleFactor)),
    },
    mainCard: {
      backgroundColor: theme.surface,
      borderRadius: scaleWidth(Math.max(12, 20 * scaleFactor)),
      padding: scaleWidth(Math.max(20, 32 * scaleFactor)),
      paddingTop: scaleHeight(Math.max(24, 40 * scaleFactor)),
      alignItems: 'center',
      maxWidth: scaleWidth(Math.max(320, 420 * scaleFactor)),
      width: '100%',
      shadowColor: theme.primary,
      shadowOffset: {
        width: 0,
        height: scaleHeight(Math.max(4, 8 * scaleFactor)),
      },
      shadowOpacity: 0.15,
      shadowRadius: scaleWidth(Math.max(8, 16 * scaleFactor)),
      elevation: Math.max(6, 12 * scaleFactor),
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      fontSize: scaleFont(Math.max(24, 32 * scaleFactor)),
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: scaleHeight(Math.max(12, 16 * scaleFactor)),
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: scaleFont(Math.max(16, 18 * scaleFactor)),
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: scaleHeight(Math.max(20, 32 * scaleFactor)),
      lineHeight: scaleFont(Math.max(22, 26 * scaleFactor)),
      fontWeight: '400',
    },
    qrSection: {
      alignItems: 'center',
      marginBottom: scaleHeight(Math.max(20, 32 * scaleFactor)),
      padding: scaleWidth(Math.max(12, 20 * scaleFactor)),
      backgroundColor: theme.surface,
      borderRadius: scaleWidth(Math.max(8, 16 * scaleFactor)),
      borderWidth: 1,
      borderColor: theme.borderDivider,
      width: '100%',
    },
    qrCode: {
      width: Math.min(scaleWidth(Math.max(80, 120 * qrScaleFactor)), width * Math.max(0.15, 0.25 * qrScaleFactor)),
      height: Math.min(scaleWidth(Math.max(80, 120 * qrScaleFactor)), width * Math.max(0.15, 0.25 * qrScaleFactor)),
      resizeMode: 'contain',
      marginBottom: scaleHeight(Math.max(8, 16 * scaleFactor)),
    },
    qrLabel: {
      fontSize: scaleFont(Math.max(14, 16 * scaleFactor)),
      color: theme.text,
      textAlign: 'center',
      fontWeight: '600',
    },
    instructionCard: {
      backgroundColor: darkMode ? 'rgba(255, 102, 0, 0.08)' : 'rgba(255, 102, 0, 0.04)',
      borderRadius: scaleWidth(Math.max(8, 12 * scaleFactor)),
      padding: scaleWidth(Math.max(12, 20 * scaleFactor)),
      borderWidth: 1,
      borderColor: darkMode ? 'rgba(255, 102, 0, 0.2)' : 'rgba(255, 102, 0, 0.15)',
      width: '100%',
    },
    instructionTitle: {
      fontSize: scaleFont(Math.max(14, 16 * scaleFactor)),
      fontWeight: '600',
      color: theme.primary,
      textAlign: 'center',
      marginBottom: scaleHeight(Math.max(6, 8 * scaleFactor)),
    },
    instruction: {
      fontSize: scaleFont(Math.max(12, 14 * scaleFactor)),
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: scaleFont(Math.max(18, 22 * scaleFactor)),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        {/* Main Title */}
        <Text style={styles.title}>{translations.title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {translations.subtitle}
        </Text>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Image
            source={require('../../../public/qr-code.svg')}
            style={styles.qrCode}
          />
          <Text style={styles.qrLabel}>{translations.qrLabel}</Text>
        </View>

        {/* Instructions Card */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>{translations.instructionTitle}</Text>
          <Text style={styles.instruction}>
            {translations.instructionText}
          </Text>
        </View>
      </View>
    </View>
  );
};
