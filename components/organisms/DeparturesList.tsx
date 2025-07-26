import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';
import { DepartureCard } from '../molecules/DepartureCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { EmptyState } from '../ui/EmptyState';
import type { GroupedDeparture } from '~/services/DepartureService';

interface DeparturesListProps {
  departures: GroupedDeparture[];
  vehicleOrder: string[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onRetryError?: () => void;
  animatedStyle?: any;
}

export const DeparturesList: React.FC<DeparturesListProps> = ({
  departures,
  vehicleOrder,
  loading,
  error,
  refreshing,
  onRefresh,
  onRetryError,
  animatedStyle,
}) => {
  const { darkMode, language } = useSettings();
  const theme = getThemeColors(darkMode);
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

    if (error) {
      return (
        <ErrorMessage
          message={error}
          onRetry={onRetryError}
        />
      );
    }

    if (departures.length === 0) {
      return (
        <EmptyState
          title={language === 'en' ? 'No departures found' : 'Aucun départ trouvé'}
        />
      );
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
        ListHeaderComponent={<View style={{ height: 16 }} />}
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
        },
        animatedStyle,
      ]}
    >
      {renderContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 5,
    top: 250,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
});