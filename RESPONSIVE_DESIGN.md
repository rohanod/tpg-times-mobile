# Responsive Design System

This document explains the comprehensive responsive design system implemented in the TPG Times app. The system ensures perfect compatibility across all devices by dynamically sizing and positioning elements based on screen dimensions.

## Core Principles

1. **Nothing is manually positioned** - All layouts use dynamic sizing and positioning
2. **Device-aware scaling** - Components scale appropriately for phones, tablets, and different screen sizes
3. **Consistent spacing** - Unified spacing system that scales with device size
4. **Readable typography** - Text sizes adjust for optimal readability on each device
5. **Touch-friendly interactions** - Interactive elements scale to maintain usability

## Key Files

### `utils/responsive.ts`
The foundation of the responsive system containing:
- Device detection functions (`isTablet()`, `isSmallDevice()`, `isLargeDevice()`)
- Scaling functions (`scaleWidth()`, `scaleHeight()`, `scaleFont()`)
- Responsive spacing, border radius, and component size definitions
- Device-specific adjustments for different screen categories

### `utils/responsiveTheme.ts`
Extends the base theme with responsive properties:
- Device-aware typography scaling
- Responsive spacing adjustments
- Component size variations
- Border radius scaling for different devices

### `hooks/useResponsiveLayout.ts`
React hook providing:
- Current device type detection
- Screen dimension tracking
- Device-specific adjustments
- Responsive value selection utilities

## Usage Patterns

### 1. Basic Responsive Styling

```typescript
import { spacing, borderRadius, typography } from '~/utils/responsive';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,           // Scales with device
    borderRadius: borderRadius.lg, // Scales with device
  },
  text: {
    ...typography.body,            // Device-appropriate font size
  },
});
```

### 2. Device-Specific Values

```typescript
import { getResponsiveValue } from '~/utils/responsive';

const columnWidth = getResponsiveValue({
  small: '100%',      // 1 column on small devices
  regular: '48%',     // 2 columns on regular devices
  large: '48%',       // 2 columns on large devices  
  tablet: '31%',      // 3 columns on tablets
});
```

### 3. Using the Responsive Theme

```typescript
import { getResponsiveTheme } from '~/utils/responsiveTheme';

const MyComponent = () => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);
  
  return (
    <View style={{ 
      padding: theme.spacing.container,
      borderRadius: theme.borderRadius.lg 
    }}>
      <Text style={theme.typography.title}>
        Responsive Title
      </Text>
    </View>
  );
};
```

### 4. Using the Layout Hook

```typescript
import { useResponsiveLayout } from '~/hooks/useResponsiveLayout';

const MyComponent = () => {
  const layout = useResponsiveLayout();
  
  return (
    <View style={[
      styles.container,
      layout.isTablet && styles.tabletLayout,
      layout.isSmallDevice && styles.compactLayout
    ]}>
      {/* Content */}
    </View>
  );
};
```

## Device Categories

### Small Devices (< 375px width)
- iPhone SE, older Android phones
- Compact layouts with single columns
- Slightly smaller fonts with minimum readability thresholds
- Reduced padding and margins

### Regular Devices (375px - 414px width)
- iPhone 12, 13, 14 standard sizes
- Most Android phones
- Standard layouts with appropriate spacing
- Base font sizes and component dimensions

### Large Devices (> 414px width)
- iPhone Pro Max models
- Large Android phones
- Slightly larger components and fonts
- Increased spacing for better visual hierarchy

### Tablets (> 768px width or specific pixel density)
- iPads, Android tablets
- Multi-column layouts where appropriate
- Larger fonts and components
- Increased spacing and padding
- Enhanced visual hierarchy

## Component Scaling

### Typography
- **Title**: 24px → 36px (small → tablet)
- **Subtitle**: 18px → 24px (small → tablet)
- **Body**: 14px → 20px (small → tablet)
- **Caption**: 12px → 18px (small → tablet)

### Spacing
- **XS**: 4px → 6px (small → tablet)
- **SM**: 8px → 12px (small → tablet)
- **MD**: 12px → 18px (small → tablet)
- **LG**: 16px → 24px (small → tablet)
- **XL**: 20px → 30px (small → tablet)

### Components
- **Buttons**: Height scales from 32px → 52px based on size and device
- **Inputs**: Height scales from 40px → 50px based on device
- **Icons**: Scale proportionally with component sizes
- **Border Radius**: Scales from 4px → 24px based on size and device

## Animation Scaling

Animations also scale with device size:
- Translation distances scale with screen width
- Duration remains consistent for smooth UX
- Easing curves optimized for different screen sizes

## Best Practices

### 1. Always Use Responsive Units
```typescript
// ❌ Don't use fixed values
paddingHorizontal: 20,
fontSize: 16,

// ✅ Use responsive values
paddingHorizontal: spacing.lg,
fontSize: typography.body.fontSize,
```

### 2. Test on Multiple Device Sizes
- Use iOS Simulator with different device types
- Test on physical devices when possible
- Pay attention to edge cases (very small/large screens)

### 3. Consider Touch Targets
- Minimum 44px touch targets on all devices
- Scale interactive elements appropriately
- Ensure adequate spacing between interactive elements

### 4. Use Device-Specific Layouts
```typescript
// ❌ Don't force same layout on all devices
<View style={styles.alwaysTwoColumns}>

// ✅ Adapt layout to device capabilities
<View style={[
  styles.container,
  layout.isTablet ? styles.threeColumns : styles.twoColumns,
  layout.isSmallDevice && styles.singleColumn
]}>
```

### 5. Maintain Visual Hierarchy
- Ensure relative sizes remain consistent across devices
- Scale related elements proportionally
- Maintain appropriate contrast and spacing ratios

## Implementation Examples

See `components/examples/ResponsiveExample.tsx` for a comprehensive example showing:
- Responsive grids that adapt column count
- Forms that stack on small devices
- Device-specific content rendering
- Typography that scales appropriately
- Interactive elements with proper touch targets

## Migration Guide

When updating existing components:

1. Replace fixed dimensions with responsive utilities
2. Use the responsive theme instead of base theme
3. Add device-specific layout variations where beneficial
4. Test thoroughly on different device sizes
5. Ensure animations scale appropriately

This responsive system ensures your TPG Times app provides an optimal experience on every device, from the smallest phones to the largest tablets.