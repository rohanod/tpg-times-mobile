# Component Migration Guide

This guide helps you migrate your existing React Native app to use the new componentized architecture following atomic design principles.

## ✅ What's Been Completed

### 1. Core UI Components (Atoms)
- ✅ Button - Configurable button with variants and states
- ✅ Input - Text input with validation and icons
- ✅ LoadingSpinner - Loading indicator
- ✅ EmptyState - Empty state display
- ✅ ErrorMessage - Error handling component
- ✅ SearchBar - Search interface
- ✅ FilterChip - Removable filter tags

### 2. Molecule Components
- ✅ StopSuggestion - Individual suggestion items
- ✅ VehicleFilterInput - Filter input interface
- ✅ DepartureCard - Departure information display

### 3. Organism Components
- ✅ SearchSection - Complete search interface
- ✅ SuggestionsList - Suggestions display
- ✅ VehicleFilters - Filter management
- ✅ DeparturesList - Departures display

### 4. Page Components
- ✅ StopsPage - Main screen implementation

### 5. Updated Main Screen
- ✅ `app/(tabs)/index.tsx` - Now uses StopsPage component

## 🔄 Next Steps for Full Migration

### 1. Settings Screen Migration
```tsx
// Current: app/(tabs)/settings.tsx
// TODO: Create components/pages/SettingsPage.tsx

// Suggested structure:
components/
├── organisms/
│   ├── SettingsSection.tsx
│   ├── LanguageSelector.tsx
│   ├── ThemeToggle.tsx
│   └── TimeFormatSelector.tsx
└── pages/
    └── SettingsPage.tsx
```

### 2. Additional UI Components Needed
```tsx
// components/ui/
├── Switch.tsx          // For settings toggles
├── Picker.tsx          // For dropdowns/selectors
├── Card.tsx            // For grouped content
├── Divider.tsx         // For visual separation
├── Badge.tsx           // For status indicators
└── IconButton.tsx      // For icon-only buttons
```

### 3. Layout Components
```tsx
// components/layout/
├── Screen.tsx          // Screen wrapper with safe area
├── Header.tsx          // Reusable header component
├── TabBar.tsx          // Custom tab bar if needed
└── Modal.tsx           // Modal wrapper
```

## 📋 Migration Checklist

### Phase 1: Core Components ✅
- [x] Create atomic UI components
- [x] Build molecule components
- [x] Develop organism components
- [x] Implement page components
- [x] Update main screen

### Phase 2: Settings Screen
- [ ] Extract settings UI elements
- [ ] Create SettingsSection organism
- [ ] Build SettingsPage component
- [ ] Update settings route

### Phase 3: Additional Screens
- [ ] Create NotFoundPage component
- [ ] Add any modal/overlay components
- [ ] Implement loading screens

### Phase 4: Layout Standardization
- [ ] Create Screen layout component
- [ ] Standardize header implementation
- [ ] Optimize navigation structure

### Phase 5: Testing & Polish
- [ ] Add component tests
- [ ] Implement error boundaries
- [ ] Performance optimization
- [ ] Accessibility improvements

## 🛠 Implementation Examples

### Settings Screen Migration

#### Before (Monolithic):
```tsx
// app/(tabs)/settings.tsx
export default function SettingsScreen() {
  // 200+ lines of mixed logic and UI
  return (
    <View>
      {/* All settings UI inline */}
    </View>
  );
}
```

#### After (Componentized):
```tsx
// components/pages/SettingsPage.tsx
export const SettingsPage = () => {
  return (
    <Screen>
      <Header title="Settings" />
      <SettingsSection title="Appearance">
        <ThemeToggle />
        <LanguageSelector />
      </SettingsSection>
      <SettingsSection title="Display">
        <TimeFormatSelector />
      </SettingsSection>
    </Screen>
  );
};

// app/(tabs)/settings.tsx
export default function SettingsScreen() {
  return <SettingsPage />;
}
```

### Creating New Components

#### 1. UI Component (Atom)
```tsx
// components/ui/Switch.tsx
interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled
}) => {
  // Implementation
};
```

#### 2. Molecule Component
```tsx
// components/molecules/SettingItem.tsx
interface SettingItemProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  children
}) => {
  // Implementation
};
```

#### 3. Organism Component
```tsx
// components/organisms/SettingsSection.tsx
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children
}) => {
  // Implementation
};
```

## 🎯 Benefits After Migration

### Developer Experience
- **Faster Development**: Reusable components speed up feature development
- **Easier Maintenance**: Changes in one place affect all instances
- **Better Testing**: Isolated components are easier to test
- **Type Safety**: Full TypeScript support with proper interfaces

### Code Quality
- **Separation of Concerns**: Business logic separated from presentation
- **Consistent UI**: Standardized components ensure visual consistency
- **Reduced Duplication**: Shared components eliminate code repetition
- **Better Performance**: Optimized components with proper memoization

### Team Collaboration
- **Clear Structure**: Easy to understand component hierarchy
- **Reusable Patterns**: Consistent patterns across the codebase
- **Documentation**: Self-documenting component interfaces
- **Scalability**: Easy to add new features and screens

## 🚀 Quick Start for New Components

1. **Identify the Component Type**:
   - Atom: Basic UI element (Button, Input)
   - Molecule: Simple combination (SearchBar, Card)
   - Organism: Complex section (Header, List)
   - Page: Complete screen

2. **Create the Component**:
   ```bash
   # Create in appropriate directory
   touch components/ui/NewComponent.tsx
   ```

3. **Follow the Pattern**:
   - TypeScript interface for props
   - Theme integration
   - Proper styling
   - Export in index.ts

4. **Test and Document**:
   - Add to Storybook if available
   - Write unit tests
   - Update documentation

## 📚 Resources

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [React Native Component Best Practices](https://reactnative.dev/docs/components-and-apis)
- [TypeScript with React Native](https://reactnative.dev/docs/typescript)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

This migration approach ensures a smooth transition while maintaining app functionality and improving code quality.