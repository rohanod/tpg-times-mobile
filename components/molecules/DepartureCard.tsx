import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSettings } from '~/hooks/useSettings';
import { getThemeColors } from '~/config/theme';
import { formatTime } from '~/utils/formatTime';
import type { GroupedDeparture } from '~/services/DepartureService';

interface DepartureCardProps {
  departure: GroupedDeparture;
  index: number;
  isVisible: Animated.SharedValue<boolean>;
}

export const DepartureCard: React.FC<DepartureCardProps> = React.memo(({
  departure,
  index,
  isVisible,
}) => {
  const { language, timeFormat, darkMode } = useSettings();
  const theme = getThemeColors(darkMode);

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(400);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  useAnimatedReaction(
    () => isVisible.value,
    (visible) => {
      const delay = index * 80;
      const duration = 300;
      const easing = Easing.out(Easing.exp);

      if (visible) {
        opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
        translateX.value = withDelay(delay, withTiming(0, { duration, easing }));
      } else {
        opacity.value = withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) });
        translateX.value = withTiming(400, {
          duration: 100,
          easing: Easing.in(Easing.ease),
        });
      }
    }
  );

  return (
    <Animated.View 
      style={[
        styles.container, 
        { borderColor: theme.border }, 
        animatedStyle
      ]}
    >
      <View style={[styles.vehicleIcon, { backgroundColor: departure.color }]}>
        <Text style={styles.vehicleNumber}>{departure.number}</Text>
      </View>
      <View style={styles.departureInfo}>
        <Text style={[styles.vehicleType, { color: theme.text }]}>
          {departure.vehicleType} {departure.number}
        </Text>
        {Object.entries(departure.destinations).map(([destination, times]) => (
          <View key={destination} style={styles.destinationRow}>
            <Text 
              style={[styles.destinationText, { color: theme.textSecondary }]} 
              numberOfLines={1}
            >
              {destination}
            </Text>
            <View style={styles.timesContainer}>
              {times.slice(0, 3).map((time, timeIndex) => {
                const timeValue = formatTime(time.departure.toISOString(), timeFormat);
                const isDelayed = time.delay > 0;
                return (
                  <View key={timeIndex} style={styles.timeChip}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {timeFormat === 'minutes'
                        ? `${timeValue} ${language === 'en' ? 'min' : 'min'}`
                        : timeValue}
                    </Text>
                    {isDelayed && (
                      <Text style={styles.delayText}>+{time.delay}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  departureInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  destinationText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  delayText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
});