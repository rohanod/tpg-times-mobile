import React from 'react';
import { FlatList, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { DepartureCard } from '../molecules/DepartureCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { spacing, borderRadius } from '~/utils/responsive';
import { LAYOUT } from '~/utils/layout';
import type { GroupedDeparture } from '~/services/DepartureService';

interface DeparturesListProps {
  departures: GroupedDeparture[];
  vehicleOrder: string[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  animatedStyle?: StyleProp<ViewStyle>;
}

const DeparturesListComponent: React.FC<DeparturesListProps> = ({
  departures,
  vehicleOrder,
  loading,
  refreshing,
  onRefresh,
  animatedStyle,
}) => {
  const { darkMode, language } = useSettings();
  const departureCardsVisible = useSharedValue(true);

  const sortedDepartures = departures.sort((a, b) => {
    const aKey = `${a.vehicleType}-${a.number}`;
    const bKey = `${b.vehicleType}-${b.number}`;
    const aIndex = vehicleOrder.indexOf(aKey);
    const bIndex = vehicleOrder.indexOf(bKey);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  const renderDeparture = ({ item, index }: { item: GroupedDeparture; index: number }) => (
    <DepartureCard
      departure={item}
      index={index}
      isVisible={departureCardsVisible}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner
            text={language === 'en' ? 'Loading departures...' : 'Chargement des départs...'}
          />
        </View>
      );
    }

    if (departures.length === 0) {
      // Blank content when no timings
      return <View style={styles.blank} />;
    }

    return (
      <FlatList
        data={sortedDepartures}
        renderItem={renderDeparture}
        keyExtractor={(item) => `${item.vehicleType}-${item.number}`}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardDismissMode="on-drag"
        ListHeaderComponent={<View style={{ height: spacing.lg }} />}
      />
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: darkMode
            ? 'rgba(28, 28, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          shadowColor: darkMode ? '#000' : '#000',
          // Maintain required 10px gaps above and below
          marginTop: 10,
          marginBottom: 10,
        },
        animatedStyle,
      ]}
    >
      {renderContent()}
    </Animated.View>
  );
};

export const DeparturesList = React.memo(DeparturesListComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: LAYOUT.CONTAINER_PADDING,
    borderRadius: borderRadius.xl,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  blank: {
    flex: 1,
  },
});
