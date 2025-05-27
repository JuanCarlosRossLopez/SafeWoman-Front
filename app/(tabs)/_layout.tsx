import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const ACTIVE_COLOR = '#B109C7';
const INACTIVE_COLOR = 'black';

interface TabBarIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color: string;
}

// Custom TabBarIcon component to handle layout (icon above text)
const TabBarIcon = ({ name, focused, color }: TabBarIconProps) => (
  <View style={styles.tabIconContainer}>
    <Ionicons name={name} size={24} color={color} />
  </View>
);


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: 'white',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={'home-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Sos"
        options={{
          title: 'SOS',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={'radio-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={'map-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Connect"
        options={{
          title: 'Conectar',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name={'watch-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
