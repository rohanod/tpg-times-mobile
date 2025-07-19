# Implementation Plan

- [ ] 1. Remove problematic animation logic and replace with precise positioning
  - Remove the `animationProgress` shared value and its associated `useEffect` that causes downward movement
  - Replace `animatedDeparturesStyle` with new positioning logic that only moves up when keyboard appears
  - Update the departures container to use `transform: [{ translateY: -containerPosition.value }]` instead of downward translation
  - Note: The departures container already moves up to the correct height initially but then incorrectly slides down. We need to prevent this downward sliding while maintaining the correct upward positioning.
  - _Requirements: 1.1, 1.2_

- [ ] 2. Implement keyboard-aware container positioning
  - Add `useReanimatedKeyboardAnimation` hook to get accurate keyboard height (already imported but needs implementation)
  - Create `calculateContainerDimensions` function to compute optimal container position and height
  - Implement logic to hide filter section when stop name input is focused and expand container accordingly
  - Add minimum height constraint (200px) to ensure usable container size
  - _Requirements: 1.1, 1.3, 3.1, 3.2_

- [ ] 3. Create smooth container transitions
  - Implement `animateContainerChanges` function with Material Design easing curves
  - Add proper timing and duration for container position and height changes
  - Ensure transitions are smooth when switching between keyboard states
  - Test transition performance on different device sizes
  - _Requirements: 1.6, 3.4_

- [ ] 4. Implement content switching between departures and suggestions
  - Create `containerContent` computed value to determine what content to show
  - Modify the departures container to render suggestions when `inputFocused` and `searchQuery.length >= 2`
  - Implement conditional rendering logic for departures vs suggestions within the same container
  - Add proper loading and empty states for both content types
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 5. Enhance suggestion rendering with better UX
  - Create `renderSuggestionItem` component with proper styling and layout
  - Add stop codes, line numbers, and recent usage indicators to suggestions
  - Implement suggestion prioritization logic (exact matches first, then by relevance)
  - Add proper accessibility labels and touch targets for suggestions
  - _Requirements: 2.3, 4.2, 5.1, 5.2, 5.4_

- [ ] 6. Fix input focus detection to distinguish between search and filter inputs
  - Modify focus handlers to track which input is focused (search vs number filter)
  - Ensure keyboard behavior only applies to stop name search input, not number filter input
  - Update state management to handle different input focus states correctly
  - Test that number filter input maintains current behavior (moving container down)
  - _Requirements: 1.4_

- [ ] 7. Add proper cleanup and error handling
  - Implement animation cleanup in component unmount
  - Add fallback positioning for edge cases (very small screens, keyboard detection failures)
  - Add error boundaries for animation failures
  - Implement timeout handling for long-running animations
  - _Requirements: 3.3, 4.1_

- [ ] 8. Optimize performance and add accessibility features
  - Use `React.memo` for suggestion items to prevent unnecessary re-renders (already implemented for departure items)
  - Implement proper focus management during container transitions
  - Add screen reader announcements for container state changes
  - Ensure keyboard navigation works correctly in both modes
  - _Requirements: 4.3, 4.4_

- [ ] 9. Test implementation across different scenarios
  - Test on various device sizes (iPhone SE, iPhone 14 Pro Max, iPad)
  - Verify behavior with different keyboard types and heights
  - Test rapid switching between search and filter inputs
  - Validate smooth transitions and proper container sizing
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10. Integration testing and bug fixes
  - Test complete user flow: search → select stop → view departures
  - Verify that existing departure functionality remains unchanged
  - Fix any TypeScript errors and ensure type safety
  - Test with real API data and handle edge cases
  - _Requirements: 2.3, 5.3, 5.5_