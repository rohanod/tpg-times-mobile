# Agent Guidelines for TPG Times Mobile

## Scripts
- **Lint Only**: `pnpm run lint` - Run ESLint (expo lint). This is the ONLY script you should use.
- **Never Use**: dev, start, ios, android, or any other scripts - ask user to run these

## Code Patterns & Architecture
- **Framework**: React Native + Expo Router + TypeScript with strict mode
- **Component Structure**: Atomic design - UI atoms → molecules → organisms → pages
- **State**: Zustand singleton pattern with AsyncStorage persistence for settings
- **Services**: Singleton pattern (e.g., `DepartureService.getInstance()`) with request deduplication
- **Performance**: Heavy use of `React.memo()`, `useCallback()`, animation with react-native-reanimated

## Code Style
- **Imports**: `~/` alias for src/, order: React → React Native → third-party → local
- **Components**: `React.FC<Props>` with inline interface definitions, PascalCase files
- **Hooks**: Custom hooks follow `useHookName.ts` pattern, return object destructuring
- **Styling**: `StyleSheet.create()` with responsive utilities from `~/utils/responsive`
- **Theming**: `getResponsiveTheme(darkMode)` combines colors + responsive scaling
- **Types**: Interface for props, `type` for unions, export types alongside implementations

## Key Systems
- **Responsive**: Device-first scaling with `scaleWidth()`, `scaleHeight()`, `scaleFont()`
- **Error Handling**: Try-catch with graceful degradation, keep last known data on errors
- **Data Flow**: API → Service processing → Grouped/filtered data → Component state
- **File Organization**: Clear separation by type with barrel exports in index.ts files

## Critical Rules
- NEVER start the app - always ask user first
- Always use existing responsive utilities and theme system
- Follow singleton service patterns for data management
- Use memo for performance on data-heavy components