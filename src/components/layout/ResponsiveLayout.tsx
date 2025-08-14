import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '~/hooks/useSettings';
import { getResponsiveTheme } from '~/utils/responsiveTheme';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  showTabBar = true,
}) => {
  const { darkMode } = useSettings();
  const theme = getResponsiveTheme(darkMode);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[
        styles.content,
        {
          // Remove all padding to allow departures to fill all available space
          paddingTop: 0,
          paddingBottom: 0, // No bottom padding to allow departures to touch tab bar
        }
      ]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
