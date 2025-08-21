import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DepartureService, Stop } from '~/services/DepartureService';
import { useArretsCsv } from '~/hooks/useArretsCsv';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { useSettings } from '~/hooks/useSettings';

interface WidgetConfig {
  stopName: string;
  stopId: string;
  vehicleFilter?: string;
}

export default function WidgetConfigScreen() {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);
  const styles = createStyles(theme);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isTestingWidget, setIsTestingWidget] = useState(false);
  
  const { getStopSuggestions } = useArretsCsv();
  const departureService = DepartureService.getInstance();

  const searchStops = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getStopSuggestions(query);
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching stops:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [getStopSuggestions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStops(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStops]);

  const selectStop = useCallback((stop: Stop) => {
    setSelectedStop(stop);
    setSearchQuery(stop.rawName || stop.id);
    setSuggestions([]);
  }, []);

  const testWidgetData = useCallback(async () => {
    if (!selectedStop?.id) {
      Alert.alert('Error', 'Please select a stop first');
      return;
    }

    setIsTestingWidget(true);
    try {
      const result = await departureService.getDepartures(
        selectedStop,
        vehicleFilter ? [vehicleFilter] : []
      );

      if (result.departures.length === 0) {
        Alert.alert(
          'No Departures',
          'No departures found for this stop. The widget will show "No departures" when configured.'
        );
      } else {
        const departuresList = result.departures
          .flatMap(group => Object.values(group.destinations).flat())
          .slice(0, 6)
          .map(dep => `${dep.vehicleType} ${dep.number}: ${dep.destination} (${dep.minutes} min)`)
          .join('\n');

        Alert.alert(
          'Widget Preview',
          `Stop: ${result.formattedStopName}\n\nNext departures:\n${departuresList}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error testing widget:', error);
      Alert.alert('Error', 'Failed to fetch departure data. Please check your internet connection.');
    } finally {
      setIsTestingWidget(false);
    }
  }, [selectedStop, vehicleFilter, departureService]);

  const saveWidgetConfig = useCallback(() => {
    if (!selectedStop?.id) {
      Alert.alert('Error', 'Please select a stop first');
      return;
    }

    const config: WidgetConfig = {
      stopName: selectedStop.rawName || selectedStop.id,
      stopId: selectedStop.id,
      vehicleFilter: vehicleFilter.trim() || undefined,
    };

    // In a real implementation, you would save this to shared app groups
    // so the widget can access it. For now, we'll show instructions.
    Alert.alert(
      'Widget Configuration',
      `Your widget is configured!\n\nStop: ${config.stopName}\nID: ${config.stopId}${config.vehicleFilter ? `\nFilter: ${config.vehicleFilter}` : ''}\n\nTo add the widget:\n1. Long press on your home screen\n2. Tap the + button\n3. Search for "TPG Times"\n4. Add the widget and configure it with:\n   • Stop Name: ${config.stopName}\n   • Stop ID: ${config.stopId}${config.vehicleFilter ? `\n   • Vehicle Filter: ${config.vehicleFilter}` : ''}`,
      [{ text: 'OK' }]
    );
  }, [selectedStop, vehicleFilter]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Widget Configuration',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
        }}
      />
      
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select TPG Stop</Text>
          <Text style={styles.sectionDescription}>
            Search and select the stop you want to display in your widget
          </Text>
          
          <View style={styles.searchContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.colors.textSecondary} 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for a TPG stop..."
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {isSearching && (
              <ActivityIndicator 
                size="small" 
                color={theme.colors.primary} 
                style={styles.searchLoader}
              />
            )}
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((stop, index) => (
                <TouchableOpacity
                  key={`${stop.id}-${index}`}
                  style={styles.suggestionItem}
                  onPress={() => selectStop(stop)}
                >
                  <Ionicons 
                    name="location" 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.suggestionText}>
                    {stop.rawName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedStop && (
            <View style={styles.selectedStop}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={theme.colors.success} 
              />
              <Text style={styles.selectedStopText}>
                Selected: {selectedStop.rawName}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Filter (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Filter by specific vehicle numbers (e.g., "12" for Tram 12, "1" for Bus 1)
          </Text>
          
          <TextInput
            style={styles.filterInput}
            value={vehicleFilter}
            onChangeText={setVehicleFilter}
            placeholder="e.g., 12, 1, 18..."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testWidgetData}
            disabled={!selectedStop || isTestingWidget}
          >
            {isTestingWidget ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Ionicons name="eye" size={20} color={theme.colors.background} />
            )}
            <Text style={styles.testButtonText}>
              {isTestingWidget ? 'Testing...' : 'Test Widget Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveWidgetConfig}
            disabled={!selectedStop}
          >
            <Ionicons name="save" size={20} color={theme.colors.background} />
            <Text style={styles.saveButtonText}>Configure Widget</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>How to add the widget:</Text>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>Long press on your home screen</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>Tap the + button in the top left</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>Search for "TPG Times"</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>4.</Text>
            <Text style={styles.stepText}>Select your preferred widget size</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>5.</Text>
            <Text style={styles.stepText}>Configure with the stop details from above</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  searchLoader: {
    marginLeft: theme.spacing.sm,
  },
  suggestionsContainer: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  selectedStop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.successBackground,
    borderRadius: theme.borderRadius.md,
  },
  selectedStopText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.success,
    fontWeight: '500',
  },
  filterInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  testButton: {
    backgroundColor: theme.colors.secondary,
  },
  testButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.background,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.background,
  },
  instructionsSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.cardBackground,
  },
  instructionsTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  stepNumber: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.primary,
    width: 20,
  },
  stepText: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 20,
  },
});