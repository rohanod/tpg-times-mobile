import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Bus, Clock, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FF6600',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFEBE0',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stops',
          tabBarIcon: ({ color, size }) => <Bus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
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