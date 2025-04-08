import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Bus, Settings } from 'lucide-react-native';
import { COLORS } from '../../config/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.TAB_BAR.BACKGROUND,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarActiveTintColor: COLORS.TAB_BAR.ACTIVE,
        tabBarInactiveTintColor: COLORS.TAB_BAR.INACTIVE,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Bus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}