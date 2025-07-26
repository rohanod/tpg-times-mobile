import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { VehicleFilterInput } from '../molecules/VehicleFilterInput';
import { FilterChip } from '../ui/FilterChip';

interface VehicleFiltersProps {
  vehicleNumberInput: string;
  onVehicleNumberInputChange: (text: string) => void;
  onAddFilter: () => void;
  filters: string[];
  onRemoveFilter: (filter: string) => void;
  animatedStyle?: any;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  vehicleNumberInput,
  onVehicleNumberInputChange,
  onAddFilter,
  filters,
  onRemoveFilter,
  animatedStyle,
}) => {
  const renderFilter = ({ item }: { item: string }) => (
    <FilterChip
      label={item}
      onRemove={() => onRemoveFilter(item)}
    />
  );

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <VehicleFilterInput
        value={vehicleNumberInput}
        onChangeText={onVehicleNumberInputChange}
        onSubmit={onAddFilter}
      />

      {filters.length > 0 && (
        <FlatList
          data={filters}
          renderItem={renderFilter}
          keyExtractor={(item) => item}
          horizontal
          style={styles.filtersRow}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  filtersRow: {
    marginTop: 10,
  },
});