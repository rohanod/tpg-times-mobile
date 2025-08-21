import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../hooks/useSettings';
import { useEASUpdate } from '../../hooks/useEASUpdate';
import { getResponsiveTheme } from '../../utils/responsiveTheme';
import { SectionHeader, SettingsList, type SettingsSection } from '~/components/ui';
import { scaleHeight, scaleWidth } from '~/utils/responsive';

export default function SettingsScreen() {
  const {
    darkMode,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    setDarkMode
  } = useSettings();

  const { updateState, performUpdate } = useEASUpdate();

  const theme = getResponsiveTheme(darkMode);

  const handleUpdatePress = async () => {
    if (updateState.isUpdating) {
      return;
    }

    Alert.alert(
      language === 'en' ? 'Update App' : 'Mettre à Jour l\'App',
      language === 'en'
        ? 'Check for and install the latest update?'
        : 'Vérifier et installer la dernière mise à jour ?',
      [
        {
          text: language === 'en' ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: language === 'en' ? 'Update' : 'Mettre à Jour',
          onPress: performUpdate,
        },
      ]
    );
  };



  const settingsSections: SettingsSection[] = [
    {
      id: 'appearance',
      title: language === 'en' ? 'Appearance' : 'Apparence',
      items: [
        {
          id: 'darkMode',
          title: language === 'en' ? 'Dark Mode' : 'Mode Sombre',
          subtitle: language === 'en' ? 
            'Automatically adapts to system settings' : 
            'S\'adapte automatiquement aux paramètres du système',
          type: 'toggle',
          value: darkMode,
          onValueChange: setDarkMode,
        },
      ],
    },
    {
      id: 'display',
      title: language === 'en' ? 'Display' : 'Affichage',
      items: [
        {
          id: 'language',
          title: language === 'en' ? 'Language' : 'Langue',
          subtitle: language === 'en' ? 
            'App interface language' : 
            'Langue de l\'interface de l\'application',
          type: 'toggle',
          value: language === 'fr',
          onValueChange: (value) => setLanguage(value ? 'fr' : 'en'),
        },
        {
          id: 'timeFormat',
          title: timeFormat === 'minutes' ? 
            (language === 'en' ? 'Show Minutes' : 'Afficher les Minutes') : 
            (language === 'en' ? 'Show Time' : 'Afficher l\'Heure'),
          subtitle: language === 'en' ? 
            'Display departure times in minutes or as clock time' : 
            'Afficher les heures de départ en minutes ou en heure d\'horloge',
          type: 'toggle',
          value: timeFormat === 'minutes',
          onValueChange: (value) => setTimeFormat(value ? 'minutes' : 'time'),
        },
      ],
    },
    {
      id: 'app',
      title: language === 'en' ? 'App' : 'Application',
      items: [
        {
          id: 'update',
          title: language === 'en' ? 'Update App' : 'Mettre à Jour l\'App',
          subtitle: updateState.isUpdating
            ? (language === 'en' ? 'Updating...' : 'Mise à jour...')
            : (language === 'en' ? 'Check for and install updates' : 'Vérifier et installer les mises à jour'),
          type: 'disclosure',
          onPress: handleUpdatePress,
          disabled: updateState.isUpdating,
          accessibilityLabel: language === 'en' ? 'Update application' : 'Mettre à jour l\'application',
        },
      ],
    },
  ];

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.systemGroupedBackground }]}
      edges={['top']}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title={language === 'en' ? 'Settings' : 'Paramètres'}
          style={styles.header}
        />
        
        <SettingsList sections={settingsSections} darkMode={darkMode} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleHeight(50),
  },
  header: {
    paddingHorizontal: scaleWidth(20),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(20),
  },
});
