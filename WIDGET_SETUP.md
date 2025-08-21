# TPG Times Widget Setup

This document explains how to set up and use the TPG Times iOS widget for displaying real-time departure information on your home screen.

## Features

The TPG Times widget provides:
- **Real-time departure information** for any TPG stop
- **Configurable stop selection** with free text search
- **Optional vehicle filtering** by line number (e.g., "12", "1", "18")
- **Multiple widget sizes** (Small, Medium, Large)
- **Automatic updates** every 30 seconds
- **Dark mode support** matching system preferences

## Setup Instructions

### 1. Build and Install the App

The widget is included when you build the app with the existing scripts:

```bash
# For development builds
pnpm run run:iphone

# For release builds  
pnpm run deploy:iphone
```

### 2. Configure Your Widget

1. Open the TPG Times app
2. Go to **Settings** (bottom tab)
3. Tap **"Configure Widget"** in the Widgets section
4. Search for and select your desired TPG stop
5. (Optional) Add a vehicle filter (e.g., "12" for Tram 12 only)
6. Tap **"Test Widget Data"** to preview the data
7. Tap **"Configure Widget"** to save your settings

### 3. Add Widget to Home Screen

1. **Long press** on your iOS home screen
2. Tap the **"+"** button in the top left corner
3. Search for **"TPG Times"**
4. Select your preferred widget size:
   - **Small**: Shows 3 next departures with minimal info
   - **Medium**: Shows 4 departures with vehicle type and destination
   - **Large**: Shows up to 6 departures with full details
5. Tap **"Add Widget"**
6. Configure the widget with your stop details:
   - **Stop Name**: The display name (e.g., "Cornavin")
   - **Stop ID**: The DIDOC code (e.g., "8587057") 
   - **Vehicle Filter**: Optional line numbers (e.g., "12")

## Widget Configuration

### Stop Selection
- Use the search feature in the app to find your stop
- The app will show you the exact Stop ID and Name to use
- All active TPG stops are supported

### Vehicle Filtering
- Leave empty to show all vehicles
- Enter specific line numbers to filter (e.g., "12" for Tram 12)
- Multiple filters can be comma-separated (e.g., "12,1,18")

### Update Frequency
- Widgets automatically update every 30 seconds
- Data is fetched from the official TPG/Swiss transport API
- Network connectivity is required for real-time data

## Widget Layouts

### Small Widget (2x2)
- TPG logo and current time
- Stop name
- Up to 3 next departures with line number and minutes

### Medium Widget (4x2)  
- TPG logo and current time
- Stop name and active filter
- Up to 4 departures with vehicle type, line, destination, and minutes

### Large Widget (4x4)
- TPG logo and current time
- Stop name and active filter
- Up to 6 departures with full details
- Last updated timestamp

## Troubleshooting

### Widget Shows "No Departures"
- Check if the stop ID is correct
- Verify network connectivity
- Some stops may have no departures at certain times
- Try removing vehicle filters if too restrictive

### Widget Not Updating
- Ensure the app has network permissions
- Check if iOS has disabled background refresh for widgets
- Try removing and re-adding the widget

### Configuration Issues
- Use the "Test Widget Data" feature in the app to verify your settings
- Make sure the Stop ID matches exactly what's shown in the app
- Vehicle filters are case-sensitive and should match line numbers exactly

## Technical Details

### Data Source
- Uses the official Swiss public transport API (transport.opendata.ch)
- Same data source as the main TPG Times app
- Real-time departure information with delay data

### Privacy
- No personal data is collected
- Network requests only for departure information
- All configuration stored locally on device

### Compatibility
- Requires iOS 14.0 or later
- Works with all iPhone models supporting widgets
- Supports both light and dark mode

## Development Notes

The widget is built using:
- **SwiftUI** for the widget interface
- **WidgetKit** for iOS widget functionality
- **@bacons/apple-targets** for Expo integration
- **Intents** for widget configuration

Widget files are located in `targets/tpg-widget/` and include:
- `TPGStopWidget.swift` - Main widget implementation
- `TPGStopIntent.intentdefinition` - Configuration interface
- `expo-target.config.js` - Build configuration
- `Info.plist` and `PrivacyInfo.xcprivacy` - Metadata

The React Native configuration screen is at `src/app/widget-config.tsx` and integrates with the existing app architecture.