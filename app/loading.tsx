import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, Animated, StyleSheet, Image, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Loading() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [isAnimating, setIsAnimating] = useState(false);

    const goToScreen = async (screen: string) => {
        setIsAnimating(true);
    Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
    }).start(async () => {
        if (screen === "(tabs)") {
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
    }
        router.replace(screen);
    });
    };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAnimating) goToScreen("/onboarding");
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Contenedor para centrar el logo */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image source={require("@/assets/images/safeWomanBlanco.png")} style={styles.logo} />
      </Animated.View>
      {/* Indicador de carga en la parte inferior */}
      <ActivityIndicator size="large" color="white" style={styles.loader} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#B109C7",
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },

  loader: {
    position: "absolute",
    bottom: 30,
  },
});
