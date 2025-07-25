import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '@/layouts/Header';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase-config';
import { useUserStore } from '@/store/userStore';
import * as Location from 'expo-location';
import { CustomModal } from '@/components/ui/CustomModal';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RunningAnimation {
  animation: Animated.CompositeAnimation;
  timerId: ReturnType<typeof setTimeout>;
}


const SOSScreen = () => {
  const numWaves = 2;
  const waveAnimatedValues = useRef(
    [...Array(numWaves)].map(() => new Animated.Value(0))
  ).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { uid } = useUserStore();

  const [alertActive, setAlertActive] = useState(false);
  const alertActiveRef = useRef(alertActive);
  useEffect(() => {
    alertActiveRef.current = alertActive;
  }, [alertActive]);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'confirm' as 'confirm' | 'success' | 'error',
    title: '',
    message: '',
    onConfirm: () => {},
    onlyConfirm: true,
  });

  const showModal = (
    type: 'confirm' | 'success' | 'error',
    title: string,
    message: string,
    onlyConfirm = true
  ) => {
    setModalConfig({
      type,
      title,
      message,
      onConfirm: () => setModalVisible(false),
      onlyConfirm,
    });
    setModalVisible(true);
  };

  const updateLocation = async () => {
    if (!alertActiveRef.current) {
      console.log('Alerta no activa, no actualizo ubicación');
      return;
    }
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          showModal(
            'error',
            'Permiso denegado',
            'No podemos actualizar tu ubicación sin permisos'
          );
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          'location.latitude': location.coords.latitude,
          'location.longitude': location.coords.longitude,
          'location.timestamp': new Date(),
        });
        console.log('Ubicación actualizada');
      }
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
    }
  };

  const handleActivateAlert = async () => {
    if (!uid || isProcessing) return;
    setIsProcessing(true);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      let finalStatus = status;
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== 'granted') {
        showModal(
          'error',
          'Permiso denegado',
          'No podemos obtener tu ubicación sin permisos'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      await updateDoc(doc(db, 'users', uid), {
        alertaActiva: true,
        createdAt: new Date(),
        'location.latitude': location.coords.latitude,
        'location.longitude': location.coords.longitude,
        'location.timestamp': new Date(),
      });
      showModal(
        'success',
        'Alerta activada',
        'Tu ubicación se está compartiendo'
      );
    } catch (error) {
      console.error('Error en handleActivateAlert:', error);
      showModal('error', 'Error', 'No se pudo activar la alerta');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivateAlert = async () => {
    if (!uid || isProcessing) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        alertaActiva: false,
      });
      showModal(
        'success',
        'Alerta desactivada',
        'Tu alerta SOS ha sido desactivada'
      );
    } catch (error) {
      console.error('Error en handleDeactivateAlert:', error);
      showModal('error', 'Error', 'No se pudo desactivar la alerta');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!uid) return;

    const userDocRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const isActive = !!data.alertaActiva;

        // Solo actualiza el estado si ha cambiado para evitar rerenders innecesarios
        if (alertActiveRef.current !== isActive) {
          setAlertActive(isActive);
        }
      }
    });

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    const startAlertProcess = async () => {
      if (!uid) return;
      console.log('Iniciando proceso de alerta...');

      // Iniciar actualizaciones de ubicación
      await updateLocation(); // Actualizar una vez inmediatamente
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      locationIntervalRef.current = setInterval(updateLocation, 15000);
      console.log('Actualizaciones de ubicación iniciadas.');

      // Enviar alerta SMS
      try {
        await fetch('https://safewoman-api.vercel.app/api/sms-alert', {
          method: 'POST',
          body: JSON.stringify({
            userId: uid,
          }),
        });
        console.log('Alerta SMS enviada');
      } catch (apiErr) {
        console.error('Error al enviar alerta SMS:', apiErr);
      }
    };

    const stopAlertProcess = () => {
      console.log('Deteniendo proceso de alerta...');
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
        console.log('Actualizaciones de ubicación detenidas.');
      }
    };

    if (alertActive) {
      startAlertProcess();
    } else {
      stopAlertProcess();
    }

    return () => {
      stopAlertProcess(); // Limpieza al desmontar el componente
    };
  }, [alertActive, uid]);

  useEffect(() => {
    const runningAnimations: {
      animation: Animated.CompositeAnimation;
      timerId: ReturnType<typeof setTimeout>;
    }[] = [];

    waveAnimatedValues.forEach((animValue, index) => {
      const individualAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      runningAnimations.push({
        animation: individualAnimation,
        timerId: setTimeout(() => individualAnimation.start(), index * 300),
      });
    });

    return () => {
      runningAnimations.forEach(({ animation, timerId }) => {
        clearTimeout(timerId);
        animation.stop();
      });

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [waveAnimatedValues]);

  useEffect(() => {
    if (alertActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
    }
  }, [alertActive]);

  return (
    <SafeAreaView style={[styles.container, alertActive && styles.alertBackground]}>
      <Header />
      <View style={styles.sosButtonContainer}>
        <View style={styles.buttonAreaWrapper}>
          {[...Array(numWaves).keys()].map((index) => {
            const animValue = waveAnimatedValues[index];
            const scale = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 3.5],
            });
            const opacity = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 0],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.pulseWave,
                  {
                    transform: [{ scale }],
                    opacity,
                    backgroundColor: alertActive ? '#ff4c4c' : '#B109C7',
                  },
                ]}
              />
            );
          })}
          {alertActive && (
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowAnim,
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.2, 1.8],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          <TouchableOpacity
            style={[
              styles.sosButton,
              alertActive && { backgroundColor: '#FF3A30' },
              isProcessing && { opacity: 0.7 },
            ]}
            onPress={alertActive ? handleDeactivateAlert : handleActivateAlert}
            disabled={isProcessing}
          >
            <Text style={styles.sosButtonText}>
              {isProcessing ? '...' : alertActive ? 'DESACTIVAR' : 'SOS'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text
        style={[
          styles.sosHelperText,
          alertActive && {
            color: '#da1308ff',
            fontWeight: 'bold',
            fontSize: 18,
          },
        ]}
      >
        {alertActive
          ? '🚨 Alerta activa - Ubicación compartiéndose'
          : 'Presiona el botón para enviar una alerta'}
      </Text>

      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onlyConfirm={modalConfig.onlyConfirm}
        onAutoClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  alertBackground: {
    backgroundColor: '#fcbbbbff',
  },
  sosButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonAreaWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#B109C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  sosHelperText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  pulseWave: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: 'absolute',
    zIndex: 0,
  },
  glowEffect: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ff0000',
    position: 'absolute',
    zIndex: 1,
  },
});

export default SOSScreen;
