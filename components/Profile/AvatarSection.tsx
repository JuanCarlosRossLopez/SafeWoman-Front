import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const AvatarSection = () => (
  <View style={styles.avatarContainer}>
    <Image source={require('@/assets/images/perfil.png')} style={styles.avatar} />
  </View>
);

const styles = StyleSheet.create({
  avatarContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#B109C7',
  },
});
