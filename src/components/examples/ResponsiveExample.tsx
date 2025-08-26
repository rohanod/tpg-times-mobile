import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSettings } from '~/hooks/useSettings';
import { useResponsiveLayout } from '~/hooks/useResponsiveLayout';
import { getResponsiveTheme } from '~/utils/responsiveTheme';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/**
 * Example component demonstrating responsive design patterns
 * This shows how to create components that adapt perfectly to all screen sizes
 */
export const ResponsiveExample: React.FC = () => {
  const { darkMode } = useSettings();
  const layout = useResponsiveLayout();
  const theme = getResponsiveTheme(darkMode);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      scrollEnabled={typeof Platform === 'undefined' || Platform.OS !== 'web'}
    >
      {/* Responsive header that scales with device */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.container }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Responsive Design Example
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Device: {layout.isTablet ? 'Tablet' : layout.isSmallDevice ? 'Small' : layout.isLargeDevice ? 'Large' : 'Regular'}
        </Text>
      </View>

      {/* Content that adapts to screen size */}
      <View style={[styles.content, { paddingHorizontal: theme.spacing.container }]}>
        
        {/* Responsive grid that changes columns based on screen size */}
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((item) => (
            <View
              key={item}
              style={[
                styles.gridItem,
                {
                  backgroundColor: theme.surface,
                  borderRadius: theme.borderRadius.lg,
                  // Dynamic width based on device type
                  width: layout.getResponsiveValue({
                    small: '100%',        // 1 column on small devices
                    regular: '48%',       // 2 columns on regular devices
                    large: '48%',         // 2 columns on large devices
                    tablet: '31%',        // 3 columns on tablets
                  }),
                },
              ]}
            >
              <Text style={[styles.gridItemText, { color: theme.text }]}>
                Item {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Responsive form elements */}
        <View style={styles.form}>
          <Input
            label="Responsive Input"
            placeholder="This input scales with screen size"
          />
          
          {/* Buttons that stack on small devices, inline on larger ones */}
          <View style={[
            styles.buttonContainer,
            layout.isSmallDevice && styles.buttonContainerStacked
          ]}>
            <Button
              title="Primary"
              onPress={() => {}}
              size={layout.isTablet ? 'large' : 'medium'}
              style={
                layout.isSmallDevice ? styles.buttonFullWidth : undefined
              }
            />
            <Button
              title="Secondary"
              onPress={() => {}}
              variant="secondary"
              size={layout.isTablet ? 'large' : 'medium'}
              style={
                layout.isSmallDevice ? styles.buttonFullWidth : undefined
              }
            />
          </View>
        </View>

        {/* Responsive text that adjusts size and spacing */}
        <View style={[styles.textSection, { marginTop: theme.spacing.section }]}>
          <Text style={[styles.responsiveTitle, { color: theme.text }]}>
            Responsive Typography
          </Text>
          <Text style={[styles.responsiveBody, { color: theme.textSecondary }]}>
            This text automatically adjusts its size based on the device. 
            On tablets it&apos;s larger, on small devices it&apos;s optimized for readability, 
            and spacing adjusts accordingly.
          </Text>
        </View>

        {/* Device-specific content */}
        {layout.isTablet && (
          <View style={[styles.tabletOnlyContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.deviceSpecificText, { color: theme.text }]}>
              This content only appears on tablets
            </Text>
          </View>
        )}

        {layout.isSmallDevice && (
          <View style={[styles.smallDeviceContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.deviceSpecificText, { color: theme.text }]}>
              This content is optimized for small devices
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    // Uses responsive typography from theme
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gridItem: {
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  gridItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  buttonContainerStacked: {
    flexDirection: 'column',
  },
  buttonFullWidth: {
    flex: 1,
  },
  textSection: {
    marginBottom: 30,
  },
  responsiveTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  responsiveBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  tabletOnlyContent: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  smallDeviceContent: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  deviceSpecificText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});