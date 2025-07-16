# Project Structure

## Root Directory Organization
```
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── _layout.tsx    # Tab layout configuration
│   │   ├── index.tsx      # Home screen (main departures view)
│   │   └── settings.tsx   # Settings screen
│   ├── _layout.tsx        # Root layout with providers
│   └── +not-found.tsx     # 404 page
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── services/              # Business logic and API services
├── config/                # Configuration files (theme, constants)
├── utils/                 # Utility functions
├── assets/                # Static assets (images, icons)
└── ios/                   # iOS-specific native code
```

## Architecture Patterns

### File-Based Routing (Expo Router)
- Routes are defined by file structure in `app/` directory
- Grouped routes use parentheses: `(tabs)/`
- Layout files (`_layout.tsx`) define nested navigation structure

### State Management
- **Zustand** for global state (settings, current stop)
- **React hooks** for component-level state
- **Persistent storage** via AsyncStorage for user preferences

### Service Layer Pattern
- **Singleton services** for API communication and business logic
- **DepartureService** - Handles TPG API integration with request deduplication
- **LocationService** - Manages device location functionality
- **ResponseLogger** - Debug logging for API responses

### Custom Hooks Pattern
- `useSettings` - Global app settings (language, theme, time format)
- `useCurrentStop` - Currently selected transit stop
- `useDepartureService` - Departure data fetching and auto-refresh
- `useArretsCsv` - Stop data and nearest stop calculation
- `useFrameworkReady` - App initialization state

### Component Organization
- **Screens** in `app/` directory following Expo Router conventions
- **Reusable components** in `components/` directory
- **Animated components** using React Native Reanimated for smooth UX

### Configuration Structure
- `config/index.ts` - App constants and API endpoints
- `config/theme.ts` - Centralized theming system with light/dark mode support

### Styling Approach
- **StyleSheet.create()** for component styles
- **Theme-aware styling** using `getThemeColors()` helper
- **Responsive design** with Dimensions API
- **Platform-specific adjustments** where needed