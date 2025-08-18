
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFrameworkReady } from '~/hooks/useFrameworkReady';
import { useSettings } from '~/hooks/useSettings';
import { COLORS } from '~/config/theme';



export default function RootLayout() {
  useFrameworkReady();
  const { darkMode } = useSettings();


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
