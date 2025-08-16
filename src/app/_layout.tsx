
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFrameworkReady } from '~/hooks/useFrameworkReady';
import { useSettings } from '~/hooks/useSettings';
import { COLORS } from '~/config/theme';
import { scaleHeight, isTablet } from '~/utils/responsive';
import { KeyboardDebugLine } from '~/components/KeyboardDebugLine';

export default function RootLayout() {
  useFrameworkReady();
  const { darkMode } = useSettings();
  const tabBarHeight = Platform.OS === 'ios'
    ? scaleHeight(isTablet() ? 85 : 75)
    : scaleHeight(isTablet() ? 75 : 65);

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
        {/* Debug line that tracks keyboard height and sits above the tab bar when hidden */}
        <KeyboardDebugLine tabBarHeight={tabBarHeight} />
        <StatusBar style={darkMode ? 'light' : 'dark'} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
