import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import CustomTabBar from '@/components/CustomTabBar'; // Ruta al componente

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => <CustomTabBar />} // <- Usa tu barra personalizada aquí
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="sos" />
      <Tabs.Screen name="mapa" />
      <Tabs.Screen name="conectar" />
    </Tabs>
  );
}
