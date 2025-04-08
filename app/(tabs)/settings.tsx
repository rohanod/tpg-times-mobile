import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../hooks/useSettings';
import { getThemeColors, COLORS } from '../../config/theme';

export default function SettingsScreen() {
  const { 
    darkMode,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    setDarkMode
  } = useSettings();
  
  const theme = getThemeColors(darkMode);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 30,
      textAlign: 'center',
    },
    section: {
      borderRadius: 10,
      padding: 15,
      borderWidth: 1,
    },
    setting: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
      marginBottom: 5,
    },
    settingText: {
      fontSize: 16,
    },
    version: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      textAlign: 'center',
      color: theme.textSecondary,
      alignSelf: 'center',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

      <Text style={styles.title}>
        {language === 'en' ? 'Settings' : 'Paramètres'}
      </Text>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            {language === 'en' ? 'Language' : 'Langue'}: {language.toUpperCase()}
          </Text>
          <Switch
            value={language === 'fr'}
            onValueChange={(value) => setLanguage(value ? 'fr' : 'en')}
            trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
            thumbColor={theme.switchThumb}
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            {language === 'en' ? 'Dark Mode' : 'Mode Sombre'}: {darkMode ? (language === 'en' ? 'On' : 'Activé') : (language === 'en' ? 'Off' : 'Désactivé')}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
            thumbColor={theme.switchThumb}
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            {timeFormat === 'minutes' ? 
              (language === 'en' ? 'Show Minutes' : 'Afficher Minutes') : 
              (language === 'en' ? 'Show Time' : 'Afficher Heure')}
          </Text>
          <Switch
            value={timeFormat === 'minutes'}
            onValueChange={(value) => setTimeFormat(value ? 'minutes' : 'time')}
            trackColor={{ false: theme.switchTrackOff, true: theme.switchTrackOn }}
            thumbColor={theme.switchThumb}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}