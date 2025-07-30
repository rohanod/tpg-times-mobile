import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Bus, Settings } from 'lucide-react-native';
import { COLORS } from '../../config/theme';
import { useSettings } from '../../hooks/useSettings';
import { scaleHeight, scaleWidth, isTablet } from '../../utils/responsive';

export default function TabLayout() {
  const { language } = useSettings();
  
  const tabBarHeight = Platform.OS === 'ios' 
    ? scaleHeight(isTablet() ? 85 : 75)
    : scaleHeight(isTablet() ? 75 : 65);
    
  const tabBarPaddingBottom = Platform.OS === 'ios' 
    ? scaleHeight(isTablet() ? 25 : 20)
    : scaleHeight(isTablet() ? 15 : 10);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.TAB_BAR.BACKGROUND,
          paddingBottom: tabBarPaddingBottom,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: COLORS.TAB_BAR.ACTIVE,
        tabBarInactiveTintColor: COLORS.TAB_BAR.INACTIVE,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'en' ? 'Home' : 'Accueil',
          tabBarIcon: ({ color, size }) => <Bus size={scaleWidth(size)} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: language === 'en' ? 'Settings' : 'Paramètres',
          tabBarIcon: ({ color, size }) => <Settings size={scaleWidth(size)} color={color} />,
        }}
      />
    </Tabs>
  );
}