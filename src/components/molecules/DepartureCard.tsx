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
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { formatTime } from '~/utils/formatTime';
import { spacing, borderRadius, typography, scaleWidth, scaleFont, scaleHeight } from '~/utils/responsive';
import type { GroupedDeparture } from '~/services/DepartureService';

interface DepartureCardProps {
  departure: GroupedDeparture;
  index: number;
  isVisible: Animated.SharedValue<boolean>;
}

const DepartureCardComponent: React.FC<DepartureCardProps> = ({
  departure,
  index,
  isVisible,
}) => {
  const { language, timeFormat, darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

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
};

DepartureCardComponent.displayName = 'DepartureCard';

export const DepartureCard = React.memo(DepartureCardComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
    minHeight: scaleHeight(100),
  },
  vehicleIcon: {
    width: scaleWidth(52),
    height: scaleWidth(52),
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleNumber: {
    color: 'white',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
  },
  departureInfo: {
    flex: 1,
  },
  vehicleType: {
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  destinationText: {
    ...typography.body,
    flex: 1,
    marginRight: spacing.sm,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    ...typography.body,
    fontWeight: '500',
  },
  delayText: {
    fontSize: scaleFont(14),
    color: '#FF3B30',
    fontWeight: '500',
  },
});