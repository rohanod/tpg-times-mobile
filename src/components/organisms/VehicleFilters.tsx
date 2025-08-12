import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { VehicleFilterInput } from '../molecules/VehicleFilterInput';
import { FilterChip } from '../ui/FilterChip';
import { LAYOUT } from '~/utils/layout';

interface VehicleFiltersProps {
  vehicleNumberInput: string;
  onVehicleNumberInputChange: (text: string) => void;
  onAddFilter: () => void;
  filters: string[];
  onRemoveFilter: (filter: string) => void;
  onVehicleFilterFocus?: () => void;
  onVehicleFilterBlur?: () => void;
  animatedStyle?: any;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  vehicleNumberInput,
  onVehicleNumberInputChange,
  onAddFilter,
  filters,
  onRemoveFilter,
  onVehicleFilterFocus,
  onVehicleFilterBlur,
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
        onFocus={onVehicleFilterFocus}
        onBlur={onVehicleFilterBlur}
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
    paddingHorizontal: LAYOUT.CONTAINER_PADDING,
    paddingTop: 0, // Remove top padding to maximize space
    paddingBottom: 0, // Remove bottom padding so departures can touch it
  },
  filtersRow: {
    marginTop: LAYOUT.SECTION_GAP,
  },
});