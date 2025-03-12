import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Trash2, MapPin } from 'lucide-react-native';
import { useSettings } from '../../hooks/useSettings';
import { useFavorites } from '../../hooks/useFavorites';
import { useCurrentStop } from '../../hooks/useCurrentStop';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

export default function FavoritesScreen() {
  const { language, darkMode } = useSettings();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { currentStop: globalCurrentStop, vehicleNumberFilters: globalFilters } = useCurrentStop();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentStop, setCurrentStop] = useState(null);
  const [currentFilters, setCurrentFilters] = useState([]);

  // Get current stop and filters from route params or global state
  useEffect(() => {
    console.log('Favorites screen - Received params:', params);
    console.log('Favorites screen - Global current stop:', globalCurrentStop);
    
    // First try to get stop from params
    if (params && typeof params === 'object') {
      const stopName = params.stop;
      const numbers = params.numbers;
      
      console.log('Favorites screen - Extracted params:', { stopName, numbers });
      
      if (stopName) {
        setCurrentStop({
          name: stopName,
        });
        
        if (numbers) {
          // Ensure numbers is converted to string before splitting
          const numbersStr = numbers.toString();
          const filtersArray = numbersStr.split(',');
          console.log('Favorites screen - Parsed filters:', filtersArray);
          setCurrentFilters(filtersArray);
        } else {
          setCurrentFilters([]);
        }
        return; // We have stop from params, no need to check global state
      }
    }
    
    // If no params, try to get from global state
    if (globalCurrentStop) {
      console.log('Favorites screen - Using global current stop:', globalCurrentStop);
      setCurrentStop(globalCurrentStop);
      setCurrentFilters(globalFilters || []);
    }
  }, [params, globalCurrentStop, globalFilters]);

  const handleAddCurrentStop = () => {
    console.log('Favorites screen - Adding current stop:', { currentStop, currentFilters });
    
    if (!currentStop) {
      console.log('Favorites screen - No stop selected, showing alert');
      Alert.alert(
        language === 'en' ? 'No Stop Selected' : 'Aucun arrêt sélectionné',
        language === 'en' 
          ? 'Please select a stop first from the home page' 
          : 'Veuillez d\'abord sélectionner un arrêt depuis la page d\'accueil',
        [
          {
            text: language === 'en' ? 'Go to Home' : 'Aller à l\'accueil',
            onPress: () => router.push('/')
          },
          {
            text: language === 'en' ? 'Cancel' : 'Annuler',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    const favoriteToAdd = {
      name: currentStop.name,
      vehicleNumberFilters: currentFilters,
    };
    
    console.log('Favorites screen - Adding favorite:', favoriteToAdd);
    addFavorite(favoriteToAdd);

    Alert.alert(
      language === 'en' ? 'Success' : 'Succès',
      language === 'en' 
        ? 'Stop added to favorites' 
        : 'Arrêt ajouté aux favoris'
    );
  };

  const handleSelectFavorite = (favorite) => {
    console.log('Favorites screen - Selecting favorite:', favorite);
    
    // Navigate to home page with the selected favorite
    if (favorite.vehicleNumberFilters.length > 0) {
      const params = {
        stop: favorite.name,
        numbers: favorite.vehicleNumberFilters.join(',')
      };
      console.log('Favorites screen - Navigating to home with params:', params);
      router.push({
        pathname: '/',
        params
      });
    } else {
      const params = {
        stop: favorite.name
      };
      console.log('Favorites screen - Navigating to home with params:', params);
      router.push({
        pathname: '/',
        params
      });
    }
  };

  const handleRemoveFavorite = (id) => {
    Alert.alert(
      language === 'en' ? 'Remove Favorite' : 'Supprimer le favori',
      language === 'en' 
        ? 'Are you sure you want to remove this stop from favorites?' 
        : 'Êtes-vous sûr de vouloir supprimer cet arrêt des favoris ?',
      [
        {
          text: language === 'en' ? 'Cancel' : 'Annuler',
          style: 'cancel',
        },
        {
          text: language === 'en' ? 'Remove' : 'Supprimer',
          onPress: () => removeFavorite(id),
          style: 'destructive',
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.favoriteItem, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5' }]}
      onPress={() => handleSelectFavorite(item)}
    >
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <MapPin size={20} color="#FF6600" style={styles.favoriteIcon} />
          <Text style={[styles.favoriteName, { color: darkMode ? '#FFFFFF' : '#333' }]}>
            {item.name}
          </Text>
        </View>
        
        {item.vehicleNumberFilters.length > 0 && (
          <View style={styles.filterChips}>
            {item.vehicleNumberFilters.map((filter) => (
              <View 
                key={filter} 
                style={[styles.filterChip, { backgroundColor: darkMode ? '#333333' : '#DDDDDD' }]}
              >
                <Text style={[styles.filterChipText, { color: darkMode ? '#FFFFFF' : '#333333' }]}>
                  {filter}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Trash2 size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
      <Text style={[styles.title, { color: '#FF6600' }]}>
        {language === 'en' ? 'Saved Stops' : 'Arrêts Enregistrés'}
      </Text>

      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: '#FF6600', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }]}
        onPress={handleAddCurrentStop}
      >
        <View style={styles.addButtonContent}>
          <Star size={18} color="#FFFFFF" style={{marginRight: 8}} />
          <Text style={styles.addButtonText}>
            {language === 'en' ? 'Add current stop to favorites' : 'Ajouter l\'arrêt actuel aux favoris'}
          </Text>
        </View>
      </TouchableOpacity>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.favoritesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Star size={48} color="#FF6600" />
          <Text style={[styles.emptyText, { color: darkMode ? '#FFFFFF' : '#333' }]}>
            {language === 'en'
              ? 'No saved stops yet'
              : "Pas encore d'arrêts enregistrés"}
          </Text>
          <Text style={[styles.emptySubtext, { color: darkMode ? '#999999' : '#666' }]}>
            {language === 'en'
              ? 'Add stops to your favorites for quick access'
              : 'Ajoutez des arrêts à vos favoris pour un accès rapide'}
          </Text>
        </View>
      )}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#FF6600',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoritesList: {
    paddingBottom: 20,
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIcon: {
    marginRight: 10,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  filterChip: {
    backgroundColor: '#DDDDDD',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  filterChipText: {
    fontSize: 12,
    color: '#333333',
  },
  deleteButton: {
    padding: 10,
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
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});