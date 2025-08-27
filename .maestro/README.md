# TPG Times Mobile - Maestro Tests

This directory contains E2E tests for the TPG Times mobile application using Maestro.

## Installation

Make sure you have Maestro installed:

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

## Running Tests

To run all tests:

```bash
maestro test .maestro/
```

To run individual tests:

```bash
# App launch test
maestro test .maestro/app-launch.yaml

# Stop search tests
maestro test .maestro/search-bouche-vernier.yaml
maestro test .maestro/search-amand-geneve.yaml
```

## Test Structure

### app-launch.yaml
Basic app launch test that verifies:
- App launches successfully
- Main title is visible
- Search input field is present

### search-bouche-vernier.yaml
Tests searching for "bouche" and selecting VERNIER, Bouchet stop:
- Enters "bouche" in search input (using testID)
- Verifies "VERNIER, Bouchet" appears as topmost suggestion (using testID and text)
- Taps on the topmost suggestion
- Waits for animations to complete
- Verifies search input shows "Vernier, Bouchet" (proper case)
- Verifies transport lines are shown using testIDs (departure-card-bus-10, departure-card-bus-22)

### search-amand-geneve.yaml
Tests searching for "amand" and selecting GENÈVE, Amandolier stop:
- Enters "amand" in search input (using testID)
- Verifies "GENÈVE, Amandolier" appears as topmost suggestion (using testID and text)
- Taps on the topmost suggestion
- Waits for animations to complete
- Verifies search input shows "Genève, Amandolier" (proper case)
- Verifies transport lines are shown using testIDs (departure-card-bus-11, departure-card-tram-17)

## TestIDs Used

The app components have been enhanced with testIDs for reliable testing:

- **search-input**: Main search TextInput field
- **topmost-suggestion**: First suggestion in the suggestions list
- **departure-card-{type}-{number}**: Dynamic testIDs for transport line cards (e.g., departure-card-bus-10, departure-card-tram-17)

## Notes

- Tests use `host.exp.Exponent` as the app ID for Expo development builds
- For production builds, update the `appId` to match the actual bundle identifier from app.config.js
- Tests verify both the capitalization in suggestions and the proper formatting in the search input after selection
- TestIDs are used for precise element targeting instead of relying on text content
- Transport line verification uses dynamic testIDs for each departure card
- Tests include proper wait times for animations to complete