import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Image,
  View,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Loading() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(zoomAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    const timeout = setTimeout(() => {
      if (!isAnimating) goToScreen("/onboarding");
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#B109C7", "#8A049E"],
  });

  return (
    <Animated.View style={[styles.safeArea, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: zoomAnim }],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/safeWomanBlanco.png")}
          style={styles.logo}
        />
        <Animated.Text style={[styles.logoText, { opacity: textOpacity }]}>
          SafeWoman
        </Animated.Text>
      </Animated.View>

      {/* Loader personalizado de puntos */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((dot) => (
          <AnimatedDot key={dot} delay={dot * 200} />
        ))}
      </View>
    </Animated.View>
  );
}

const AnimatedDot = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1.2,
  },

  dotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    gap: 10,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
  },
});
