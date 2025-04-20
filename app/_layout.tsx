
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '~/hooks/useFrameworkReady';
import { useSettings } from '~/hooks/useSettings';
import { COLORS } from '~/config/theme';

export default function RootLayout() {
  useFrameworkReady();
  const { darkMode } = useSettings();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: darkMode ? COLORS.BACKGROUND.DARK : COLORS.BACKGROUND.LIGHT
          }
        }}
      >
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </>
  );
}
