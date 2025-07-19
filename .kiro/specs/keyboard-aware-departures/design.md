# Design Document

## Overview

This design addresses the current issue where the departures container moves up correctly when the keyboard appears for stop name input but then incorrectly moves down. The solution involves modifying the existing animation logic to prevent the downward movement and optimizing the container size when the number filter section is hidden.

## Architecture

### Current Implementation Analysis

The current implementation uses:
- `react-native-reanimated` for animations with `useSharedValue` and `useAnimatedStyle`
- `react-native-keyboard-controller` with `KeyboardAvoidingView` wrapper
- Multiple animation states: `animationProgress`, `searchEntranceProgress`, `filtersEntranceProgress`, `departureCardsVisible`
- Complex animation sequencing with delays and timing functions

### Problem Identification

The issue lies in the `useEffect` that handles `inputFocused` state changes:
1. When `inputFocused` becomes true, the container moves up correctly
2. However, the animation logic then triggers a downward movement via `animationProgress.value = withDelay(borderDelay, withTiming(1, ...))`
3. The `animatedDeparturesStyle` applies `translateY: animationProgress.value * screenHeight` which pushes the container down

## Components and Interfaces

### Modified Animation States

```typescript
interface AnimationStates {
  // Keep existing states
  searchEntranceProgress: SharedValue<number>;
  filtersEntranceProgress: SharedValue<number>;
  departureCardsVisible: SharedValue<boolean>;
  
  // Modified state - remove the problematic animationProgress
  // Replace with more specific states
  containerPosition: SharedValue<number>; // For precise positioning
  containerHeight: SharedValue<number>;   // For dynamic sizing
  showSuggestions: SharedValue<boolean>;  // For content switching
}
```

### Container Positioning Logic

```typescript
interface ContainerDimensions {
  searchSectionHeight: number;      // ~64px (search + padding)
  filtersSectionHeight: number;     // ~80px when visible, 0 when hidden
  availableHeight: number;          // screenHeight - keyboard - search - filters
  keyboardHeight: number;           // From keyboard controller
  minContainerHeight: number;       // Minimum viable height (200px)
}
```

### Content State Management

```typescript
interface ContentState {
  mode: 'departures' | 'suggestions';
  suggestions: Stop[];
  departures: GroupedDeparture[];
  loading: boolean;
  error: string | null;
}
```

## Data Models

### Enhanced Stop Suggestion Model

```typescript
interface EnhancedStopSuggestion extends Stop {
  relevanceScore: number;        // For intelligent ordering
  distance?: number;             // If location available
  recentlyUsed: boolean;         // For prioritization
  lineNumbers?: string[];        // Associated transit lines
  stopCode?: string;             // Official stop identifier
}
```

### Container Layout Model

```typescript
interface ContainerLayout {
  position: {
    top: number;
    bottom: number;
    height: number;
  };
  content: {
    type: 'departures' | 'suggestions';
    scrollable: boolean;
    minHeight: number;
  };
  animation: {
    duration: number;
    easing: EasingFunction;
    staggerDelay?: number;
  };
}
```

## Error Handling

### Animation Error Recovery

```typescript
interface AnimationErrorHandling {
  fallbackPositions: {
    keyboard: number;
    noKeyboard: number;
  };
  timeoutHandling: {
    maxAnimationDuration: number;
    fallbackCallback: () => void;
  };
  stateValidation: {
    validateDimensions: () => boolean;
    resetToSafeState: () => void;
  };
}
```

### Keyboard Detection Fallbacks

- Primary: `useReanimatedKeyboardAnimation` from keyboard controller
- Fallback: React Native's `Keyboard` API listeners
- Emergency: Fixed dimensions based on device type

## Testing Strategy

### Animation Testing

```typescript
interface AnimationTests {
  unitTests: {
    containerPositioning: () => void;
    dimensionCalculations: () => void;
    stateTransitions: () => void;
  };
  integrationTests: {
    keyboardInteraction: () => void;
    contentSwitching: () => void;
    deviceRotation: () => void;
  };
  visualTests: {
    animationSmoothness: () => void;
    layoutConsistency: () => void;
    accessibilityCompliance: () => void;
  };
}
```

### Device Compatibility Testing

- iPhone SE (small screen)
- iPhone 14 Pro Max (large screen)
- iPad (tablet layout)
- Android devices with different keyboard heights
- Landscape orientation handling

## Implementation Details

### Step 1: Replace Animation Logic

Remove the problematic `animationProgress` logic and replace with:

```typescript
// Replace this problematic logic:
const animatedDeparturesStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: animationProgress.value * screenHeight }],
}));

// With precise positioning:
const animatedDeparturesStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: -containerPosition.value }],
  height: containerHeight.value,
}));
```

### Step 2: Implement Keyboard-Aware Positioning

```typescript
const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

const calculateContainerDimensions = useCallback(() => {
  const searchHeight = 64;
  const filtersHeight = inputFocused ? 0 : 80; // Hide filters when searching
  const availableHeight = screenHeight - keyboardHeight.value - searchHeight - filtersHeight;
  const targetHeight = Math.max(availableHeight, 200); // Minimum 200px
  
  return {
    position: keyboardHeight.value > 0 ? keyboardHeight.value + 20 : 0,
    height: targetHeight,
  };
}, [keyboardHeight.value, inputFocused, screenHeight]);
```

### Step 3: Content Switching Logic

```typescript
const containerContent = useMemo(() => {
  if (inputFocused && searchQuery.length >= 2) {
    return {
      type: 'suggestions' as const,
      data: suggestions,
      emptyMessage: language === 'en' ? 'No stops found' : 'Aucun arrêt trouvé',
    };
  }
  return {
    type: 'departures' as const,
    data: departures,
    emptyMessage: language === 'en' ? 'No departures found' : 'Aucun départ trouvé',
  };
}, [inputFocused, searchQuery, suggestions, departures, language]);
```

### Step 4: Smooth Transitions

```typescript
const animateContainerChanges = useCallback((newDimensions: ContainerDimensions) => {
  const duration = 400;
  const easing = Easing.bezier(0.25, 0.1, 0.25, 1); // Material Design easing
  
  containerPosition.value = withTiming(newDimensions.position, { duration, easing });
  containerHeight.value = withTiming(newDimensions.height, { duration, easing });
}, [containerPosition, containerHeight]);
```

### Step 5: Enhanced Suggestion Rendering

```typescript
const renderSuggestionItem = ({ item, index }: { item: EnhancedStopSuggestion; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 50).duration(300)}
    exiting={FadeOutUp.duration(200)}
    style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
  >
    <TouchableOpacity
      onPress={() => handleStopSelect(item)}
      style={styles.suggestionContent}
    >
      <MapPin size={16} color={theme.textSecondary} />
      <View style={styles.suggestionTextContainer}>
        <Text style={[styles.suggestionText, { color: theme.text }]}>{item.name}</Text>
        {item.stopCode && (
          <Text style={[styles.suggestionCode, { color: theme.textSecondary }]}>
            {item.stopCode}
          </Text>
        )}
        {item.lineNumbers && item.lineNumbers.length > 0 && (
          <View style={styles.lineNumbersContainer}>
            {item.lineNumbers.slice(0, 3).map((line, idx) => (
              <Text key={idx} style={[styles.lineNumber, { color: theme.primary }]}>
                {line}
              </Text>
            ))}
          </View>
        )}
      </View>
      {item.recentlyUsed && (
        <Text style={[styles.recentBadge, { color: theme.primary }]}>Recent</Text>
      )}
    </TouchableOpacity>
  </Animated.View>
);
```

## Performance Considerations

### Animation Optimization

- Use `runOnUI` for complex calculations
- Implement animation cancellation for rapid state changes
- Cache dimension calculations to avoid repeated computations
- Use `useAnimatedReaction` for efficient state monitoring

### Memory Management

- Implement proper cleanup for animation listeners
- Use `React.memo` for suggestion items to prevent unnecessary re-renders
- Debounce search input to reduce API calls
- Implement virtual scrolling for large suggestion lists

### Accessibility Enhancements

- Maintain proper focus management during transitions
- Announce container state changes to screen readers
- Ensure keyboard navigation works correctly
- Provide haptic feedback for important interactions