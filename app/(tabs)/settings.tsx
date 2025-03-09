import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../hooks/useSettings';

export default function SettingsScreen() {
  const { 
    darkMode,
    timeFormat,
    setTimeFormat,
    language,
    setLanguage,
    setDarkMode
  } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>

      <Text style={styles.title}>
        {language === 'en' ? 'Settings' : 'Paramètres'}
      </Text>

      <View style={[styles.section, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5' }]}>
        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: darkMode ? '#FFFFFF' : '#333333' }]}>
            {language === 'en' ? 'Language' : 'Langue'}: {language.toUpperCase()}
          </Text>
          <Switch
            value={language === 'fr'}
            onValueChange={(value) => setLanguage(value ? 'fr' : 'en')}
            trackColor={{ false: '#767577', true: '#FF6600' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: darkMode ? '#FFFFFF' : '#333333' }]}>
            {language === 'en' ? 'Dark Mode' : 'Mode Sombre'}: {darkMode ? (language === 'en' ? 'On' : 'Activé') : (language === 'en' ? 'Off' : 'Désactivé')}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#FF6600' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingText, { color: darkMode ? '#FFFFFF' : '#333333' }]}>
            {timeFormat === 'minutes' ? 
              (language === 'en' ? 'Show Minutes' : 'Afficher Minutes') : 
              (language === 'en' ? 'Show Time' : 'Afficher Heure')}
          </Text>
          <Switch
            value={timeFormat === 'minutes'}
            onValueChange={(value) => setTimeFormat(value ? 'minutes' : 'time')}
            trackColor={{ false: '#767577', true: '#FF6600' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <Text style={[styles.version, { color: darkMode ? '#666666' : '#999999' }]}>Version 1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6600',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 5,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    textAlign: 'center',
    color: '#999',
    alignSelf: 'center',
  },
});