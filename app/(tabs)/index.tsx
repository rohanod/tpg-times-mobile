import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Search, X } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useSettings } from '../../hooks/useSettings';
import { useArretsCsv } from '../../hooks/useArretsCsv';
import moment from 'moment-timezone';
import { formatTime } from '../../utils/formatTime';

const API_ENDPOINTS = {
  LOCATIONS: "https://transport.opendata.ch/v1/locations",
  STATIONBOARD: "https://search.ch/timetable/api/stationboard.fr.json",
  ARRETS_CSV: "https://raw.githubusercontent.com/rohanod/arrets/refs/heads/main/arrets.csv"
};

export default function StopsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [vehicleNumbers, setVehicleNumbers] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { language, timeFormat, darkMode } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { filterSuggestions, checkIfTPG, getFullStopName, findNearestStop } = useArretsCsv();

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.LOCATIONS}?query=${encodeURIComponent(text)}&type=station`);
      const data = await response.json();
      if (data.stations) {
        // Use the filterSuggestions function from useArretsCsv hook
        const validSuggestions = await filterSuggestions(data.stations);
        setSuggestions(validSuggestions.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // We're now using the checkIfTPG function from the useArretsCsv hook

  const handleLocationPress = async () => {
    try {
      setLoading(true);
      // Use the findNearestStop function from useArretsCsv hook
      const nearestStop = await findNearestStop();
      
      if (nearestStop) {
        handleStopSelect(nearestStop);
      } else {
        alert(language === 'en' ? 'No TPG stops found nearby' : 'Aucun arrêt TPG trouvé à proximité');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert(language === 'en' ? 'Error getting location' : 'Erreur de localisation');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSelect = async (stop) => {
    setSelectedStop(stop);
    // Get the full stop name (municipality + stop name) for better display
    const fullStopName = await getFullStopName(stop.name);
    setSearchQuery(fullStopName);
    setSuggestions([]);
    await fetchDepartures(stop.name);
  };

  const fetchDepartures = async (stopName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.STATIONBOARD}?stop=${encodeURIComponent(stopName)}&limit=300&show_delays=1&transportation_types=tram,bus&mode=depart`
      );
      const data = await response.json();

      if (data.connections) {
        const now = moment().tz('Europe/Zurich');
        const filteredDepartures = data.connections
          .filter(conn => conn && conn.time && conn.terminal && conn.terminal.name)
          .map(conn => {
            const departure = moment.tz(conn.time, 'Europe/Zurich');
            const minutesUntilDeparture = Math.ceil(moment.duration(departure.diff(now)).asMinutes());
            return {
              vehicleType: conn.type === 'tram' ? 'Tram' : 'Bus',
              number: conn.line,
              destination: conn.terminal.name,
              departure,
              minutes: minutesUntilDeparture,
              color: conn.color ? `#${conn.color.split('~')[0]}` : '#FF6600'
            };
          });

        const groupedDepartures = filteredDepartures.reduce((acc, curr) => {
          const key = `${curr.vehicleType}-${curr.number}`;
          if (!acc[key]) {
            acc[key] = {
              vehicleType: curr.vehicleType,
              number: curr.number,
              color: curr.color,
              destinations: {}
            };
          }
          if (!acc[key].destinations[curr.destination]) {
            acc[key].destinations[curr.destination] = [];
          }
          acc[key].destinations[curr.destination].push(curr);
          return acc;
        }, {});

        setDepartures(Object.values(groupedDepartures));
      }
    } catch (error) {
      console.error('Error fetching departures:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDepartureTime = (departure) => {
    return (
      <Text style={styles.departureTime}>
        {formatTime(departure.departure.format(), timeFormat)}
      </Text>
    );
  };

  const handleVehiclePress = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalVisible(true);
    // Start the fade-in animation when modal opens
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    // Fade out animation before closing the modal
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
      <View style={[styles.header, { backgroundColor: darkMode ? '#000000' : '#FFFFFF' }]}>
        <Text style={[styles.title, { color: '#FF6600' }]}>
          {language === 'en' ? 'TPG Bus and Tram' : 'Bus et Tram TPG'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.inputContainer, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5' }]}>
          <Search size={20} color="#FF6600" style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: darkMode ? '#FFFFFF' : '#333' }]}
            placeholder={language === 'en' ? 'Enter stop name' : 'Nom de l\'arrêt'}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={darkMode ? '#666666' : '#999'}
          />
        </View>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleLocationPress}
          disabled={loading}>
          <MapPin size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.suggestion, { backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF', borderBottomColor: darkMode ? '#333333' : '#EEEEEE' }]}
              onPress={() => handleStopSelect(item)}>
              <Text style={[styles.suggestionText, { color: darkMode ? '#FFFFFF' : '#333' }]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}

      {selectedStop && (
        <View style={styles.filterContainer}>
          <TextInput
            style={[styles.filterInput, { backgroundColor: darkMode ? '#1C1C1E' : '#F5F5F5', color: darkMode ? '#FFFFFF' : '#333' }]}
            placeholder={language === 'en' ? 'Filter by line number (e.g., 12,18)' : 'Filtrer par numéro de ligne (ex: 12,18)'}
            value={vehicleNumbers}
            onChangeText={(text) => {
              setVehicleNumbers(text);
              if (selectedStop) {
                fetchDepartures(selectedStop.name);
              }
            }}
            placeholderTextColor="#999"
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#FF6600" />
      ) : (
        <View style={styles.vehiclesContainer}>
          <FlatList
            data={departures}
            keyExtractor={(item) => `${item.vehicleType}-${item.number}`}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.vehicleButton, { backgroundColor: item.color }]}
                onPress={() => handleVehiclePress(item)}>
                <Text style={styles.vehicleNumber}>{item.number}</Text>
                <Text style={styles.vehicleType}>{item.vehicleType}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.vehiclesGrid}
          />
        </View>
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          closeModal();
        }}>
        <Animated.View 
          style={[styles.modalOverlay, {
            opacity: fadeAnim,
          }]}
        >
          <Pressable 
            style={styles.modalBackdrop}
            onPress={closeModal}
          >
            <Animated.View 
              style={[styles.modalContent, 
                { backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF' },
                {
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    })
                  }]
                }
              ]}
              // This prevents taps on the content from closing the modal
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedVehicle?.vehicleType} {selectedVehicle?.number}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}>
                  <X size={24} color="#FF6600" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                {selectedVehicle && Object.entries(selectedVehicle.destinations).map(([destination, times]) => (
                  <View key={destination} style={styles.destinationSection}>
                    <Text style={[styles.destinationTitle, { color: darkMode ? '#FFFFFF' : '#333' }]}>
                      {language === 'en' ? 'To: ' : 'Vers: '}{destination}
                    </Text>
                    <View style={styles.timesGrid}>
                      {times.slice(0, 4).map((time, index) => (
                        <View
                          key={index}
                          style={[styles.timeBox, { backgroundColor: selectedVehicle.color }]}>
                          <Text style={styles.timeText}>
                            {renderDepartureTime(time)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6600',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FF6600',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  suggestionsList: {
    maxHeight: 200,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  suggestion: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  filterInput: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  vehiclesContainer: {
    flex: 1,
    marginTop: 20,
  },
  vehiclesGrid: {
    padding: 10,
  },
  vehicleButton: {
    width: 100,
    height: 100,
    margin: 8,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  vehicleNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  vehicleType: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6600',
  },
  closeButton: {
    padding: 5,
  },
  modalScroll: {
    flex: 1,
  },
  destinationSection: {
    marginBottom: 20,
  },
  destinationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeBox: {
    padding: 15,
    borderRadius: 10,
    width: '48%',  // Make them slightly wider but keep two per row
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});