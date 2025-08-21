import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings } from '../../hooks/useSettings';
import { useEASUpdate } from '../../hooks/useEASUpdate';
import { useArretsRefresh } from '../../hooks/useArretsRefresh';
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
  const { handleRefresh, isRefreshing } = useArretsRefresh();

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

  const handleRefreshPress = async () => {
    if (isRefreshing) {
      return;
    }

    Alert.alert(
      language === 'en' ? 'Refresh Stops Data' : 'Actualiser les Données d\'Arrêts',
      language === 'en'
        ? 'Download the latest stops data from the server?'
        : 'Télécharger les dernières données d\'arrêts depuis le serveur ?',
      [
        {
          text: language === 'en' ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: language === 'en' ? 'Refresh' : 'Actualiser',
          onPress: async () => {
            try {
              await handleRefresh();
              Alert.alert(
                language === 'en' ? 'Success' : 'Succès',
                language === 'en'
                  ? 'Stops data has been refreshed successfully.'
                  : 'Les données d\'arrêts ont été actualisées avec succès.'
              );
            } catch {
              Alert.alert(
                language === 'en' ? 'Error' : 'Erreur',
                language === 'en'
                  ? 'Failed to refresh stops data. Please try again later.'
                  : 'Échec de l\'actualisation des données d\'arrêts. Veuillez réessayer plus tard.'
              );
            }
          },
        },
      ]
    );
  };

  const handleResetPress = async () => {
    Alert.alert(
      language === 'en' ? 'Reset App' : 'Réinitialiser l\'App',
      language === 'en'
        ? 'This will clear all app data and reset the app to its initial state. This action cannot be undone.'
        : 'Cela effacera toutes les données de l\'application et réinitialisera l\'application à son état initial. Cette action ne peut pas être annulée.',
      [
        {
          text: language === 'en' ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: language === 'en' ? 'Reset' : 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              await AsyncStorage.clear();

              Alert.alert(
                language === 'en' ? 'Reset Complete' : 'Réinitialisation Terminée',
                language === 'en'
                  ? 'App has been reset. Please restart the app to complete the reset.'
                  : 'L\'application a été réinitialisée. Veuillez redémarrer l\'application pour terminer la réinitialisation.',
                [
                  {
                    text: language === 'en' ? 'OK' : 'OK',
                    onPress: () => {
                      // Optionally close the app or restart
                      // For now, just show the message
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error resetting app:', error);
              Alert.alert(
                language === 'en' ? 'Error' : 'Erreur',
                language === 'en'
                  ? 'Failed to reset the app. Please try again.'
                  : 'Échec de la réinitialisation de l\'application. Veuillez réessayer.'
              );
            }
          },
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
          type: 'icon',
          onPress: handleUpdatePress,
          disabled: updateState.isUpdating,
          icon: (
            <MaterialIcons
              name="download"
              size={20}
              color={theme.colors.secondaryLabel}
            />
          ),
          accessibilityLabel: language === 'en' ? 'Update application' : 'Mettre à jour l\'application',
        },
        {
          id: 'refresh-stops',
          title: language === 'en' ? 'Refresh Stops Data' : 'Actualiser les Données d\'Arrêts',
          subtitle: isRefreshing
            ? (language === 'en' ? 'Refreshing...' : 'Actualisation...')
            : (language === 'en' ? 'Manually refresh stops data' : 'Actualiser manuellement les données d\'arrêts'),
          type: 'icon',
          onPress: handleRefreshPress,
          disabled: isRefreshing,
          icon: (
            <MaterialIcons
              name="refresh"
              size={20}
              color={theme.colors.secondaryLabel}
            />
          ),
          accessibilityLabel: language === 'en' ? 'Refresh stops data' : 'Actualiser les données d\'arrêts',
        },
        {
          id: 'reset-app',
          title: language === 'en' ? 'Reset App' : 'Réinitialiser l\'App',
          subtitle: language === 'en' ? 'Clear all data and reset to initial state' : 'Effacer toutes les données et réinitialiser à l\'état initial',
          type: 'icon',
          onPress: handleResetPress,
          icon: (
            <MaterialIcons
              name="delete-forever"
              size={20}
              color={theme.colors.systemRed}
            />
          ),
          accessibilityLabel: language === 'en' ? 'Reset application' : 'Réinitialiser l\'application',
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
