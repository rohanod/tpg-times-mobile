import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';
import { useSettings } from '../../hooks/useSettings';

export default function FavoritesScreen() {
  const { language, darkMode } = useSettings();
  // TODO: Implement favorites functionality

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
      <Text style={[styles.title, { color: '#FF6600' }]}>
        {language === 'en' ? 'Favorite Stops' : 'Arrêts Favoris'}
      </Text>

      <View style={styles.emptyState}>
        <Star size={48} color="#FF6600" />
        <Text style={[styles.emptyText, { color: darkMode ? '#FFFFFF' : '#333' }]}>
          {language === 'en'
            ? 'No favorite stops yet'
            : "Pas encore d'arrêts favoris"}
        </Text>
        <Text style={[styles.emptySubtext, { color: darkMode ? '#999999' : '#666' }]}>
          {language === 'en'
            ? 'Add stops to your favorites for quick access'
            : 'Ajoutez des arrêts à vos favoris pour un accès rapide'}
        </Text>
      </View>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});