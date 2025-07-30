# Component Architecture

This project follows **Atomic Design** principles combined with React Native best practices to create a scalable, maintainable component structure.

## Architecture Overview

```
components/
├── ui/              # Atoms - Basic building blocks
├── molecules/       # Molecules - Simple combinations of atoms
├── organisms/       # Organisms - Complex UI sections
├── pages/          # Pages - Complete screen implementations
└── index.ts        # Main barrel export
```

## Component Hierarchy

### 🔹 UI Components (Atoms)
Basic, reusable building blocks that can't be broken down further:

- **Button** - Configurable button with variants, sizes, and states
- **Input** - Text input with label, error states, and icons
- **LoadingSpinner** - Loading indicator with optional text
- **EmptyState** - Empty state display with icon and action
- **ErrorMessage** - Error display with retry functionality
- **SearchBar** - Search input with location button
- **FilterChip** - Removable filter tag

### 🔸 Molecules
Simple combinations of atoms that form functional units:

- **StopSuggestion** - Individual stop suggestion item
- **VehicleFilterInput** - Input for adding vehicle filters
- **DepartureCard** - Individual departure information card

### 🔷 Organisms
Complex UI sections that combine molecules and atoms:

- **SearchSection** - Complete search interface
- **SuggestionsList** - List of stop suggestions
- **VehicleFilters** - Vehicle filtering interface
- **DeparturesList** - Complete departures display

### 📄 Pages
Complete screen implementations:

- **StopsPage** - Main stops/departures screen

## Key Features

### 🎨 Theme Integration
All components automatically adapt to:
- Light/Dark mode
- Language switching (EN/FR)
- Consistent color scheme

### ⚡ Performance Optimizations
- React.memo for expensive components
- Proper key props for lists
- Optimized re-renders
- Animated components with shared values

### 🔄 Reusability
- Configurable props for different use cases
- Consistent API patterns
- Barrel exports for clean imports
- TypeScript for type safety

## Usage Examples

### Basic UI Components
```tsx
import { Button, Input, LoadingSpinner } from '~/components/ui';

// Button with different variants
<Button title="Primary" onPress={handlePress} />
<Button title="Secondary" variant="secondary" onPress={handlePress} />
<Button title="Loading" loading onPress={handlePress} />

// Input with validation
<Input
  label="Search"
  value={query}
  onChangeText={setQuery}
  error={validationError}
  leftIcon={<SearchIcon />}
/>

// Loading state
<LoadingSpinner text="Loading departures..." />
```

### Complex Components
```tsx
import { SearchSection, DeparturesList } from '~/components/organisms';

// Search with animations
<SearchSection
  searchQuery={query}
  onSearchChange={setQuery}
  onLocationPress={findLocation}
  animatedStyle={slideAnimation}
/>

// Departures with error handling
<DeparturesList
  departures={data}
  loading={isLoading}
  error={error}
  onRefresh={refresh}
/>
```

### Page Components
```tsx
import { StopsPage } from '~/components/pages';

// Complete screen implementation
export default function StopsScreen() {
  return <StopsPage />;
}
```

## Animation Integration

Components support React Native Reanimated v3:
- Shared values for coordinated animations
- Entrance/exit animations
- Gesture-based interactions
- Performance-optimized transforms

## Best Practices

### ✅ Do
- Use barrel exports for clean imports
- Follow the atomic design hierarchy
- Implement proper TypeScript interfaces
- Use theme colors consistently
- Optimize with React.memo when needed
- Handle loading and error states

### ❌ Don't
- Mix business logic with presentation
- Create deeply nested component hierarchies
- Ignore accessibility requirements
- Hardcode colors or dimensions
- Skip error boundaries
- Forget to handle edge cases

## File Structure

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── ErrorMessage.tsx
│   ├── SearchBar.tsx
│   ├── FilterChip.tsx
│   └── index.ts
├── molecules/
│   ├── StopSuggestion.tsx
│   ├── VehicleFilterInput.tsx
│   ├── DepartureCard.tsx
│   └── index.ts
├── organisms/
│   ├── SearchSection.tsx
│   ├── SuggestionsList.tsx
│   ├── VehicleFilters.tsx
│   ├── DeparturesList.tsx
│   └── index.ts
├── pages/
│   ├── StopsPage.tsx
│   └── index.ts
├── Toast.tsx (legacy)
├── index.ts
└── README.md
```

## Migration Guide

### From Monolithic to Atomic

1. **Extract UI Elements**: Move basic elements to `ui/`
2. **Group Related Components**: Combine atoms into `molecules/`
3. **Create Sections**: Build `organisms/` from molecules
4. **Compose Pages**: Use organisms in `pages/`
5. **Update Imports**: Use barrel exports

### Legacy Support

Existing components like `Toast` remain available during transition:
```tsx
import { Toast } from '~/components';
```

## Testing Strategy

- **Unit Tests**: Test individual atoms and molecules
- **Integration Tests**: Test organism behavior
- **E2E Tests**: Test complete page flows
- **Visual Tests**: Ensure consistent theming

This architecture provides a solid foundation for scaling your React Native application while maintaining code quality and developer experience.