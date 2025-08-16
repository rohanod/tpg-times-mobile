import React from 'react';
import { FlatList, StyleSheet, StyleProp, ViewStyle } from 'react-native';
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
  animatedStyle?: StyleProp<ViewStyle>;
}

const VehicleFiltersComponent: React.FC<VehicleFiltersProps> = ({
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

export const VehicleFilters = React.memo(VehicleFiltersComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: LAYOUT.CONTAINER_PADDING,
    paddingTop: 0,
    paddingBottom: 10, // Ensure 10px gap to departures
  },
  filtersRow: {
    marginTop: LAYOUT.SECTION_GAP,
  },
});
