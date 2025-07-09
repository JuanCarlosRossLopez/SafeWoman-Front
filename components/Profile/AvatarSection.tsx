import React, {useState} from 'react';
import {  Image, StyleSheet, Animated, Easing } from 'react-native';

export const AvatarSection = () => {
  const [scaleAnim] = useState(new Animated.Value(0));

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
});