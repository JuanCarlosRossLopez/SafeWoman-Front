import React, {useState} from 'react';
import {  Image, StyleSheet, Animated, Easing, Text } from 'react-native';
import { useUserStore } from '@/store/userStore';

export const AvatarSection = () => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const { name, email } = useUserStore();

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.elastic(1),
      useNativeDriver: true
    }).start();
  },);

  return (
    <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Image 
        source={require('@/assets/images/perfil.png')} 
        style={styles.avatar} 
      />
       <Text style={styles.nameText}>{name || 'Nombre no disponible'}</Text>
      <Text style={styles.emailText}>{email || 'Correo no disponible'}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: { 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 10 
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#B109C7',
    shadowColor: '#B109C7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emailText: {
    fontSize: 14,
    color: '#312e2eff',
    marginTop: 4,
  },
});