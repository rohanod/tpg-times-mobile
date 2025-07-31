# Technology Stack

## Framework & Platform
- **React Native 0.79.4** with **React 19.0.0**
- **Expo SDK ~53.0.7** with Expo Router for navigation
- **New Architecture enabled** (Fabric/TurboModules)
- **TypeScript** with strict mode enabled

## Key Dependencies
- **expo-router** - File-based routing system
- **zustand** - Lightweight state management
- **react-native-reanimated** - High-performance animations
- **@gorhom/bottom-sheet** - Native bottom sheet component
- **expo-location** - Location services
- **moment-timezone** - Date/time handling with timezone support
- **@expo/vector-icons** - Icon library (MaterialIcons)
- **@react-native-async-storage/async-storage** - Local storage

## Build System
- **Metro** bundler with default Expo configuration
- **Babel** with custom plugins for module resolution and transforms
- **EAS Build** for deployment

## Common Commands
```bash
# Development
pnpm dev                    # Start development server
pnpm start                  # Alternative start command

# Platform-specific builds
pnpm ios                    # Run on iOS simulator
pnpm android                # Run on Android emulator

# Deployment
pnpm deploy:web             # Deploy web version
pnpm deploy:iphone          # Deploy to specific iPhone device

# Code quality
pnpm lint                   # Run ESLint
```

## Configuration Files
- **app.json** - Expo configuration with EAS project settings
- **babel.config.js** - Babel transforms and module resolution
- **tsconfig.json** - TypeScript configuration with path aliases
- **eas.json** - EAS Build configuration

## Path Aliases
- `@/*` and `~/*` - Root directory aliases for cleaner imports