import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useSettings } from '@/hooks/useSettings';

export default function RootLayout() {
  useFrameworkReady();
  const { darkMode } = useSettings();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: darkMode ? '#000000' : '#ffffff'
          }
        }}
      >
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </>
  );
}
