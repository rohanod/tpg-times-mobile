# Requirements Document

## Introduction

This feature fixes the current departures container behavior when the keyboard appears for stop name input. Currently, the container moves up to the correct size but then incorrectly moves down. The fix will remove the downward movement and make the container slightly larger when the number filter section is hidden, while integrating stop name suggestions directly within the departures container area.

## Requirements

### Requirement 1

**User Story:** As a user searching for a transit stop, I want the departures container to stay in its upward position when the keyboard appears for stop name input, so that I can see both my search input and relevant information without the container moving down unnecessarily.

#### Acceptance Criteria

1. WHEN the keyboard appears for stop name input THEN the departures container SHALL move upward to fit between the keyboard and stop text box
2. WHEN the departures container reaches its upward position THEN it SHALL NOT move downward again
3. WHEN the number filter section is hidden due to keyboard focus THEN the departures container SHALL expand slightly to use the additional available space
4. WHEN the keyboard appears for number filters THEN the departures container SHALL maintain its current behavior (moving down)
5. WHEN the keyboard disappears from stop name input THEN the departures container SHALL return to its original position and size
6. WHEN the keyboard state changes for stop name input THEN the transition SHALL be smooth and animated

### Requirement 2

**User Story:** As a user typing in the stop search box, I want to see stop name suggestions in the departures container area, so that I can quickly select the stop I'm looking for without having to type the complete name.

#### Acceptance Criteria

1. WHEN the user starts typing in the stop search box THEN the departures container SHALL display stop name suggestions instead of departure times
2. WHEN the user types at least 2 characters THEN the system SHALL show filtered stop suggestions based on the input
3. WHEN the user taps on a stop suggestion THEN the system SHALL select that stop and dismiss the keyboard
4. WHEN the user clears the search input THEN the system SHALL return to showing departure times
5. WHEN no stops match the search criteria THEN the system SHALL display a "No stops found" message

### Requirement 3

**User Story:** As a user on different device sizes, I want the keyboard-aware behavior to work consistently across all screen sizes, so that I have a reliable experience regardless of my device.

#### Acceptance Criteria

1. WHEN the keyboard appears on any device size THEN the departures container SHALL properly calculate the available space
2. WHEN the available space is too small THEN the departures container SHALL show a minimum viable height with scrollable content
3. WHEN the device orientation changes THEN the container SHALL recalculate its dimensions appropriately
4. WHEN using different keyboard types THEN the container SHALL adapt to the actual keyboard height

### Requirement 4

**User Story:** As a user with accessibility needs, I want the keyboard-aware departures container to maintain proper accessibility support, so that I can navigate the interface using assistive technologies.

#### Acceptance Criteria

1. WHEN the departures container changes size or position THEN all accessibility labels SHALL remain properly associated
2. WHEN stop suggestions are displayed THEN each suggestion SHALL be accessible via screen readers
3. WHEN the keyboard appears THEN the focus management SHALL work correctly for keyboard navigation
4. WHEN using VoiceOver or TalkBack THEN the container state changes SHALL be announced appropriately

### Requirement 5

**User Story:** As a user, I want the stop suggestions to be intelligently ordered and relevant, so that I can find my desired stop quickly.

#### Acceptance Criteria

1. WHEN displaying stop suggestions THEN the system SHALL prioritize exact matches at the beginning
2. WHEN multiple stops match the search THEN the system SHALL order results by relevance and proximity if location is available
3. WHEN the user has previously selected stops THEN the system SHALL prioritize recently used stops in suggestions
4. WHEN displaying suggestions THEN each suggestion SHALL show the stop name and relevant identifiers (stop code, line numbers)
5. WHEN the suggestion list is long THEN the container SHALL be scrollable to show all results