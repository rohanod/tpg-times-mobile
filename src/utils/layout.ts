import { 
  spacing, 
  isTablet, 
  isSmallDevice, 
  isLargeDevice,
  getResponsiveValue 
} from './responsive';

// Layout constants for consistent spacing
export const LAYOUT = {
  // Header heights
  HEADER_HEIGHT: getResponsiveValue({
    small: 60,
    regular: 70,
    large: 80,
    tablet: 90,
  }),
  
  // Search section height
  SEARCH_HEIGHT: getResponsiveValue({
    small: 50,
    regular: 60,
    large: 65,
    tablet: 70,
  }),
  
  // Vehicle filters height
  FILTERS_HEIGHT: getResponsiveValue({
    small: 45,
    regular: 55,
    large: 60,
    tablet: 65,
  }),
  
  // Total top section height (header + search + filters + gaps)
  get TOP_SECTION_HEIGHT() {
    return this.HEADER_HEIGHT + this.SEARCH_HEIGHT + this.FILTERS_HEIGHT + (spacing.sm * 3);
  },
  
  // Suggestions list position
  get SUGGESTIONS_TOP() {
    return this.HEADER_HEIGHT + this.SEARCH_HEIGHT + spacing.xs;
  },
  
  // Departures list position
  get DEPARTURES_TOP() {
    return this.TOP_SECTION_HEIGHT + spacing.sm;
  },
  
  // Container padding
  CONTAINER_PADDING: getResponsiveValue({
    small: spacing.md,
    regular: spacing.lg,
    large: spacing.lg,
    tablet: spacing.xl,
  }),
  
  // Section gaps
  SECTION_GAP: getResponsiveValue({
    small: spacing.xs,
    regular: spacing.sm,
    large: spacing.sm,
    tablet: spacing.md,
  }),
};

// Helper function to get consistent page padding
export const getPagePadding = () => ({
  paddingHorizontal: LAYOUT.CONTAINER_PADDING,
  paddingTop: isTablet() ? spacing.md : spacing.xs,
  paddingBottom: spacing.xs,
});

// Helper function to get section spacing
export const getSectionSpacing = () => ({
  marginBottom: LAYOUT.SECTION_GAP,
});