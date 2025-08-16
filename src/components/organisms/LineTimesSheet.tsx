import React, { useCallback, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { spacing, borderRadius, typography, scaleFont } from '~/utils/responsive';
import type { GroupedDeparture } from '~/services/DepartureService';
import { formatTime } from '~/utils/formatTime';

export type LineTimesSheetRef = {
  present: () => void;
  dismiss: () => void;
};

interface LineTimesSheetProps {
  selected: GroupedDeparture | null;
  onDismiss?: () => void;
}

const LineTimesSheet = React.forwardRef<LineTimesSheetRef, LineTimesSheetProps>(({ selected, onDismiss }, ref) => {
  const { darkMode, language, timeFormat } = useSettings();
  const theme = getResponsiveTheme(darkMode);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }), []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    []
  );

  const header = useMemo(() => {
    if (!selected) return null;
    return (
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: selected.color }]}>
          <Text style={styles.badgeText}>{selected.number}</Text>
        </View>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {selected.vehicleType} {selected.number}
        </Text>
      </View>
    );
  }, [selected, theme.text]);

  // dynamic snap points: start at 40%, allow pull up only when content exceeds 40%, cap max at 85% of screen height
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [contentHeight, setContentHeight] = useState(0);

  // Reset measured height when selected changes
  useEffect(() => {
    setContentHeight(0);
  }, [selected]);

  const onContentLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height;
    setContentHeight(h);
  }, []);

  const snapPoints = useMemo(() => {
    const minSnap = 0.4; // 40%
    const maxSnap = 0.88; // slightly higher cap to avoid visual cut-off

    // account for safe area top inset and handle height (~24 by default)
    const HANDLE_HEIGHT = 24;
    const SAFE_TOP = insets.top ?? 0;

    // Effective available viewport for content inside the sheet when fully expanded
    const effectiveWindowForContent = Math.max(0, windowHeight - SAFE_TOP);

    // Add a small cushion so content isn't clipped under the rounded corners/handle
    const topCushion = 12; // px

    // compute target snap based on content height plus cushion relative to available height
    const desiredRelativeByContent = effectiveWindowForContent > 0
      ? (contentHeight + topCushion + HANDLE_HEIGHT) / effectiveWindowForContent
      : 0;

    // top snap should be the minimum needed to show content, capped by maxSnap
    const desiredTop = Math.min(maxSnap, desiredRelativeByContent);

    // If content fits within 40%, only provide 40% snap (no pull up needed)
    if (
      desiredRelativeByContent <= minSnap ||
      !Number.isFinite(desiredRelativeByContent) ||
      desiredRelativeByContent === 0
    ) {
      return ['40%'] as (string | number)[];
    }

    // Otherwise allow pulling up to show more, capped at maxSnap or content height
    const topPercent = `${Math.max(minSnap, desiredTop) * 100}%` as string;
    return ['40%', topPercent];
  }, [contentHeight, windowHeight, insets.top]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing={false}
      snapPoints={snapPoints}
      topInset={insets.top}
      enablePanDownToClose
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: theme.border }}
      backgroundStyle={{ backgroundColor: theme.surface, borderRadius: theme.borderRadius.lg }}
    >
      <BottomSheetView style={styles.content} onLayout={onContentLayout}>
        {header}
        {selected && (
          <View style={styles.destinationsContainer}>
            {Object.entries(selected.destinations).map(([destination, times]) => (
              <View key={destination} style={styles.destinationBlock}>
                <Text style={[styles.destinationTitle, { color: theme.text }]} numberOfLines={2}>
                  {destination}
                </Text>
                <View style={styles.timesGrid}>
                  {times.slice(0, 6).map((t, idx) => {
                    const value = formatTime(t.departure.toISOString(), timeFormat);
                    const isDelayed = t.delay > 0;
                    return (
                      <View key={`${destination}-${idx}`} style={[styles.timeCell, { borderColor: theme.border }]}> 
                        <Text style={[styles.timeText, { color: theme.text }]}>
                          {timeFormat === 'minutes' ? `${value} ${language === 'en' ? 'min' : 'min'}` : value}
                        </Text>
                        {isDelayed && (
                          <Text style={styles.delayText}>+{t.delay}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

LineTimesSheet.displayName = 'LineTimesSheet';

export default React.memo(LineTimesSheet);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scaleFont(14),
  },
  headerTitle: {
    ...typography.subtitle,
    fontWeight: '700',
  },
  destinationsContainer: {
    gap: spacing.md,
  },
  destinationBlock: {
    gap: spacing.xs,
  },
  destinationTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 6,
  },
  timeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  delayText: {
    fontSize: scaleFont(12),
    color: '#FF3B30',
    fontWeight: '500',
  },
  // New grid styles for times list (2 columns)
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  timeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 6,
    width: '48%', // two per row
  },
});
