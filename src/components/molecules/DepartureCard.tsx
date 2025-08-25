import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { formatTime } from '~/utils/formatTime';
import { spacing, borderRadius, typography, scaleWidth, scaleFont } from '~/utils/responsive';
import type { GroupedDeparture } from '~/services/DepartureService';

interface DepartureCardProps {
  departure: GroupedDeparture;
  index: number;
  isVisible: Animated.SharedValue<boolean>;
  onPress?: (departure: GroupedDeparture) => void;
  disabled?: boolean;
}

const DepartureCardComponent: React.FC<DepartureCardProps> = ({
  departure,
  index,
  isVisible,
  onPress,
  disabled,
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

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.container,
    { borderColor: theme.border },
    pressed && {
      backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
  ];

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        style={pressableStyle}
        onPress={() => onPress?.(departure)}
        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityHint={language === 'en' ? 'Shows upcoming times' : 'Affiche les prochains horaires'}
      >
        <View style={[styles.vehicleIcon, { backgroundColor: departure.color }]}>
          <Text style={[styles.vehicleNumber, { color: departure.textColor }]}>{departure.number}</Text>
        </View>
        <View style={styles.departureInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.vehicleType, { color: theme.text }]}>
              {departure.vehicleType} {departure.number}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
          {Object.entries(departure.destinations).map(([destination, times]) => (
            <View key={destination} style={styles.destinationRow}>
              <Text
                style={[styles.destinationText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {destination}
              </Text>
              <View style={styles.timesContainer}>
                {times.slice(0, 1).map((time, timeIndex) => {
                  const scheduledISO = time.departure.toISOString();
                  const effectiveISO = time.delay > 0
                    ? new Date(new Date(scheduledISO).getTime() + time.delay * 60000).toISOString()
                    : scheduledISO;
                  const timeValue = formatTime(effectiveISO, timeFormat);
                  const isDelayed = time.delay > 0;
                  return (
                    <View
                      key={timeIndex}
                      style={[
                        styles.timeChip,
                        isDelayed && { backgroundColor: '#FFA500', borderRadius: borderRadius.lg, paddingHorizontal: 8, paddingVertical: 2 }
                      ]}
                    >
                      <Text style={[styles.timeText, { color: isDelayed ? '#000' : theme.text }]}>
                        {timeFormat === 'minutes'
                          ? `${timeValue} ${language === 'en' ? 'min' : 'min'}`
                          : timeValue}
                      </Text>
                       {/* hide explicit delay per requirement */}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
};

DepartureCardComponent.displayName = 'DepartureCard';

export const DepartureCard = React.memo(DepartureCardComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
    overflow: 'hidden',
  },
  vehicleIcon: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleNumber: {
    color: 'white', // overridden dynamically by departure.textColor
    fontSize: scaleFont(14),
    fontWeight: 'bold',
  },
  departureInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  vehicleType: {
    ...typography.body,
    fontWeight: '600',
  },
  destinationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  destinationText: {
    ...typography.caption,
    flex: 1,
    marginRight: spacing.sm,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  timeText: {
    ...typography.caption,
    fontWeight: '500',
  },
  delayText: {
    fontSize: scaleFont(12),
    color: '#FF3B30',
    fontWeight: '500',
  },
});
