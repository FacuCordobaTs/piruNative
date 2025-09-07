import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Shield, User } from 'lucide-react-native';
import HomeTab from '../screens/tabs/Home';
import SearchTab from '../screens/tabs/NoFap';
import ProfileTab from '../screens/tabs/Profile';
import { T } from '../components/T';

const Tab = createBottomTabNavigator();

const TabIcon = ({
  icon: Icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  focused: boolean;
  color: string;
}) => (
  <View className="items-center justify-center">
    <Icon className="w-5 h-5" color={color} />
    <T
      style={{ color }}
      className="text-[8px] font-semibold mt-1"
      numberOfLines={1}
    >
      {label}
    </T>
  </View>
);

export default function Tabs({navigation}: any) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 8 + insets.bottom,
          left: 12,
          right: 12,
          height: 60,
          // Use padding to prevent buttons from touching the edges
          paddingHorizontal: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
        },
        tabBarBackground: () => (
          <View
            style={{
              height: 60,
              width: '100%',
              backgroundColor: '#3b2c20',
              borderWidth: 2,
              borderColor: '#5c4a3b',
              borderRadius: 9999,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              bottom: 11,
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          />
        ),
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home} label="Inicio" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Shield} label="NoFap" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={User} label="Perfil" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


