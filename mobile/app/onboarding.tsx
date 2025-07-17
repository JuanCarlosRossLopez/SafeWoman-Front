import React, { useEffect, useRef, useState } from 'react';
import {  Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from 'react-native-swiper';
import Slide from '@/components/Slide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Onboarding() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const goToScreen = async (screen: string) => {
    setIsAnimating(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(async () => {
      if (screen === '(tabs)') {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      }
      router.replace(screen);
    });
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!isAnimating) goToScreen('/introduction');
    }, 9000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <Swiper
          loop={false}
          showsButtons={false}
          activeDotColor="#ffffff"
          dotColor="#d1a4f3"
          containerStyle={{ flex: 1 }}
          autoplay
          autoplayTimeout={3}
        >
          <Slide iconName="heart-o" text="Bienvenida a SafeWoman, una app pensada para cuidar de ti en todo momento." />

          <Slide iconName="map-marker" text="Puedes enviar alertas rápidas con tu ubicación en tiempo real a tus contactos de confianza. Solo tú decides cuándo y a quién." />

          <Slide iconName="bell" text="Usa la app o una pulsera para pedir ayuda al instante. Guarda un historial de alertas y visualiza tu ubicación en el mapa.">

          </Slide>
        </Swiper>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#B109C7',
  },
  button: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 0,
  },
  buttonText: {
    color: '#A000C8',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
