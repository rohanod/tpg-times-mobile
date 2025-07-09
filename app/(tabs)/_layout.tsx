import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Bus, Settings } from 'lucide-react-native';
import { COLORS } from '../../config/theme';
import { useSettings } from '../../hooks/useSettings';

export default function TabLayout() {
  const { language } = useSettings();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.TAB_BAR.BACKGROUND,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 75 : 65,
        },
        tabBarActiveTintColor: COLORS.TAB_BAR.ACTIVE,
        tabBarInactiveTintColor: COLORS.TAB_BAR.INACTIVE,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'en' ? 'Home' : 'Accueil',
          tabBarIcon: ({ color, size }) => <Bus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: language === 'en' ? 'Settings' : 'Paramètres',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}