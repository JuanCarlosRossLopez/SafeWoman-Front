import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  StyleSheet,
  Image,
  View,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";

export default function Loading() {
  const router = useRouter();
  const userStore = useUserStore();
  const { logged, uid } = userStore;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  
  const splashScale = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0)).current;
  const ringScale3 = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasCheckedState, setHasCheckedState] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);

  useEffect(() => {
    if (!logged && !uid) {
      setHasCheckedState(false);
      setAnimationsComplete(false);
    }
  }, [logged, uid]);

  const goToScreen = useCallback(async (screen: string) => {
    if (isAnimating) return; 
    setIsAnimating(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        router.replace(screen as any);
      }, 100);
    });
  }, [fadeAnim, router, isAnimating]);

  const checkUserState = useCallback(async () => {
    if (hasCheckedState || !animationsComplete) return; 
    
    try {
      setHasCheckedState(true);
      if (logged && uid) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        goToScreen("/(tabs)/home");
        return;
      }

      console.log("Usuario no logueado, verificando onboarding");
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      
      if (hasSeenOnboarding === "true") {
        await new Promise(resolve => setTimeout(resolve, 500));
        goToScreen("/introduction");
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        goToScreen("/onboarding");
      }
    } catch (error) {
      console.error("Error checking user state:", error);
      goToScreen("/onboarding");
    }
  }, [logged, uid, goToScreen, hasCheckedState, animationsComplete]);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(splashScale, {
          toValue: 1.2,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.stagger(150, [
        Animated.timing(ringScale1, {
          toValue: 3,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale2, {
          toValue: 2.5,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale3, {
          toValue: 2,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowMainContent(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(zoomAnim, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(particleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          setAnimationsComplete(true);
        }, 1000); 
      });
    });

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
  }, [bgAnim, fadeAnim, particleOpacity, ringScale1, ringScale2, ringScale3, splashOpacity, splashScale, textOpacity, zoomAnim]);

  useEffect(() => {
    if (animationsComplete && !isAnimating && !hasCheckedState) {
      checkUserState();
    }
  }, [checkUserState, isAnimating, hasCheckedState, animationsComplete]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasCheckedState && !isAnimating) {
        console.log("Timeout de seguridad activado");
        setAnimationsComplete(true);
      }
    }, 8000); 

    return () => clearTimeout(timeout);
  }, [hasCheckedState, isAnimating]);

  useEffect(() => {
    if (logged && uid && !hasCheckedState && !isAnimating) {
      console.log("Estado del usuario cambió, re-evaluando navegación");
      checkUserState();
    }
  }, [logged, uid, hasCheckedState, isAnimating, checkUserState]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#B109C7", "#8A049E"],
  });

  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const delay = i * 100;
      particles.push(
        <FloatingParticle 
          key={i} 
          delay={delay} 
          opacity={particleOpacity}
          index={i}
        />
      );
    }
    return particles;
  };

  return (
    <Animated.View style={[styles.safeArea, { backgroundColor }]}>
      {/* Efectos de entrada espectaculares */}
      <Animated.View 
        style={[
          styles.splashOverlay,
          {
            opacity: splashOpacity,
            transform: [{ scale: splashScale }],
          }
        ]}
      >
        {/* Anillos expansivos */}
        <Animated.View 
          style={[
            styles.expandingRing,
            styles.ring1,
            { transform: [{ scale: ringScale1 }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.expandingRing,
            styles.ring2,
            { transform: [{ scale: ringScale2 }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.expandingRing,
            styles.ring3,
            { transform: [{ scale: ringScale3 }] }
          ]} 
        />
      </Animated.View>

      {/* Partículas flotantes */}
      {showMainContent && renderParticles()}

      {/* Contenido principal */}
      {showMainContent && (
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
      )}

      {/* Loader personalizado de puntos */}
      {showMainContent && (
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((dot) => (
            <AnimatedDot key={dot} delay={dot * 200} />
          ))}
        </View>
      )}
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
  }, [delay, scale]);

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

const FloatingParticle = ({ delay, opacity, index }: { delay: number; opacity: Animated.Value; index: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const particleScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 2000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20,
          duration: 2000 + delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 4000 + delay * 2,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleScale, {
          toValue: 1,
          duration: 1500 + delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particleScale, {
          toValue: 0.5,
          duration: 1500 + delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay, translateY, rotate, particleScale]);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          top: 50 + (index * 80),
          left: 50 + ((index % 4) * 80),
          opacity,
          transform: [
            { translateY },
            { rotate: rotation },
            { scale: particleScale },
          ],
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

  // 🎆 Estilos para efectos espectaculares
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  expandingRing: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
  },

  ring1: {
    width: 100,
    height: 100,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  ring2: {
    width: 150,
    height: 150,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },

  ring3: {
    width: 200,
    height: 200,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
});
