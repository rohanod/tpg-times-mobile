import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ExtensionStorage } from '@bacons/apple-targets';

import { useSettings } from '../hooks/useSettings';
import DepartureService, { Stop } from '../services/DepartureService';
import { getResponsiveTheme } from '../utils/responsiveTheme';
import { scaleHeight, scaleWidth } from '../utils/responsive';

import { SectionHeader, Button, Input, SearchBar } from '~/components/ui';
import SuggestionsList from '~/components/organisms/SuggestionsList';

export default function WidgetSettingsScreen() {
  const router = useRouter();
  const {
    darkMode,
    widgetStop,
    widgetLine,
    widgetDirection,
    setWidgetStop,
    setWidgetLine,
    setWidgetDirection,
  } = useSettings();

  const theme = getResponsiveTheme(darkMode);

  const [stopSearch, setStopSearch] = useState(widgetStop?.name || '');
  const [selectedStop, setSelectedStop] = useState<Stop | null>(widgetStop);
  const [line, setLine] = useState(widgetLine || '');
  const [direction, setDirection] = useState(widgetDirection || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectStop = (stop: Stop) => {
    setSelectedStop(stop);
    setStopSearch(stop.rawName || '');
  };

  const handleSave = useCallback(async () => {
    if (!selectedStop) {
      Alert.alert('Error', 'Please select a stop.');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Save settings to Zustand store
      setWidgetStop({ id: selectedStop.id, name: selectedStop.rawName || '' });
      setWidgetLine(line);
      setWidgetDirection(direction);

      // 2. Fetch departure data
      const departureService = DepartureService.getInstance();
      const result = await departureService.getDepartures(selectedStop, line ? [line] : []);

      // 3. Process data for widget
      const widgetData = result.departures.flatMap(grouped => {
        const departures = grouped.destinations[direction];
        if (!departures) return [];

        return departures.map(dep => ({
          line: grouped.number,
          destination: dep.destination.split(',').pop()?.trim() || dep.destination,
          minutes: dep.minutes,
          color: grouped.color,
        }));
      }).slice(0, 5); // Limit to 5 departures for the widget

      // 4. Save data to ExtensionStorage
      const storage = new ExtensionStorage('group.com.rohanodwyer.tpgtimes');
      await storage.set('widgetData', widgetData);

      // 5. Reload widget
      await ExtensionStorage.reloadWidget();

      Alert.alert('Success', 'Widget settings saved successfully.');
      router.back();
    } catch (error) {
      console.error('Failed to save widget settings:', error);
      Alert.alert('Error', 'Failed to save widget settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedStop, line, direction, router]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.systemGroupedBackground }]}
      edges={['top', 'bottom']}
    >
      <SectionHeader
        title="Configure Widget"
        style={styles.header}
        onBackPress={() => router.back()}
      />
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.colors.label }]}>Stop</Text>
        <SearchBar
          placeholder="Search for a stop..."
          value={stopSearch}
          onChangeText={setStopSearch}
        />
        {stopSearch.length > 1 && (
          <SuggestionsList
            query={stopSearch}
            onSelectStop={handleSelectStop}
            limit={3}
          />
        )}

        <Text style={[styles.label, { color: theme.colors.label }]}>Line Number (Optional)</Text>
        <Input
          placeholder="e.g., 14, 18"
          value={line}
          onChangeText={setLine}
        />

        <Text style={[styles.label, { color: theme.colors.label }]}>Direction (Final Destination)</Text>
        <Input
          placeholder="e.g., Bernex, Vailly"
          value={direction}
          onChangeText={setDirection}
        />

        <Button
          title={isSaving ? "Saving..." : "Save Settings"}
          onPress={handleSave}
          disabled={isSaving}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scaleWidth(20),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(20),
  },
  formContainer: {
    paddingHorizontal: scaleWidth(20),
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: scaleHeight(8),
    marginTop: scaleHeight(16),
  },
  saveButton: {
    marginTop: scaleHeight(32),
  },
});
