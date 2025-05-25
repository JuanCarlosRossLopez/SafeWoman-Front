import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', icon: 'home-outline', route: '/(tabs)/home' },
    { name: 'SOS', icon: 'radio-outline', route: '/(tabs)/sos' },
    { name: 'Mapa', icon: 'map-outline', route: '/(tabs)/mapa' },
    { name: 'Conectar', icon: 'people-outline', route: '/(tabs)/conectar' },
  ];

  return (
    <View style={styles.footerNav}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.name}
          style={styles.navItem}
          onPress={() => router.push(tab.route)}
        >
          <Ionicons
            name={tab.icon}
            size={20}
            color={pathname === tab.route ? '#aa55cc' : '#666'}
          />
          <Text style={{ color: pathname === tab.route ? '#aa55cc' : '#666' }}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 20,
    
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
});
