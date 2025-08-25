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
- Always modify the files yourself, don't ask if you are allowed to start working.

## Research & Tooling Workflow
- DO NOT USE THE FETCH TOOL FOR SEARCH ENGINES EVER.
- Order of precedence for web research:
  1) Context7 docs: Use Context7 to search and read framework/library documentation first (resolve library ID, then fetch docs).
  2) Tavily Search: Use Tavily to search the web (including queries phrased as "google" searches) for broader information and latest context.
  3) Web Fetch: Only after identifying a specific URL, use fetch to retrieve that exact page for detailed reading. Never use fetch to query search engines.
- Prioritize official documentation, release notes, and RFCs. Verify versions and APIs against current sources.
- When fetching a specific page, recursively follow and fetch only directly relevant links as needed to complete the task.