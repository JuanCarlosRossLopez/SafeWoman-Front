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
    <SafeAreaView style={[styles.container, alertActive && styles.alertBackground]} edges={['top']}>
      {/* Background decorative elements */}
      <View style={styles.backgroundDecoration1} />
      <View style={styles.backgroundDecoration2} />
      <View style={styles.backgroundDecoration3} />
      
      <Header />
      
      {/* Professional Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>🚨</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Sistema de Emergencia SOS</Text>
            <Text style={styles.infoSubtitle}>
              {alertActive ? 'Alerta activada - Ayuda en camino' : 'Presiona cuando necesites ayuda urgente'}
            </Text>
          </View>
        </View>
        
        {alertActive && (
          <View style={styles.activeAlert}>
            <View style={styles.pulsingDot} />
            <Text style={styles.activeAlertText}>🚨 Ubicación compartiéndose en tiempo real</Text>
          </View>
        )}
      </View>

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
          
          {/* Enhanced SOS Button */}
          <TouchableOpacity
            style={[
              styles.sosButton,
              alertActive && styles.sosButtonActive,
              isProcessing && styles.sosButtonProcessing,
            ]}
            onPress={alertActive ? handleDeactivateAlert : handleActivateAlert}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={[styles.sosButtonText, alertActive && styles.sosButtonTextActive]}>
                {isProcessing ? '...' : alertActive ? 'DETENER' : 'SOS'}
              </Text>
              <Text style={[styles.sosButtonSubtext, alertActive && styles.sosButtonSubtextActive]}>
                {isProcessing ? 'Procesando' : alertActive ? 'Toca para detener' : 'Emergencia'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Helper Text */}
      <View style={styles.helperContainer}>
        <Text style={[styles.sosHelperText, alertActive && styles.sosHelperTextActive]}>
          {alertActive
            ? '⚠️ Alerta SOS Activa'
            : '🛡️ Tu seguridad es nuestra prioridad'}
        </Text>
        <Text style={[styles.sosHelperSubtext, alertActive && styles.sosHelperSubtextActive]}>
          {alertActive
            ? 'Tus contactos de emergencia han sido notificados'
            : 'Mantén presionado en caso de emergencia real'}
        </Text>
      </View>

      {/* Safety Tips Card */}
      {!alertActive && (
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIcon}>
              <Text style={styles.tipsIconText}>💡</Text>
            </View>
            <Text style={styles.tipsTitle}>Consejos de Seguridad</Text>
          </View>
          <Text style={styles.tipsText}>
            • Verifica tus contactos de emergencia{'\n'}
            • Usa solo en situaciones reales de peligro
          </Text>
        </View>
      )}

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
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  alertBackground: {
    backgroundColor: '#FEF2F2',
  },

  // Background decorative elements
  backgroundDecoration1: {
    position: 'absolute',
    top: 80,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(177, 9, 199, 0.05)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    top: 250,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(177, 9, 199, 0.03)',
  },
  backgroundDecoration3: {
    position: 'absolute',
    bottom: 150,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(177, 9, 199, 0.02)',
  },

  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 4,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(177, 9, 199, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  infoIcon: {
    fontSize: 28,
  },
  
  infoContent: {
    flex: 1,
  },
  
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  infoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Active Alert
  activeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  
  activeAlertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },

  // SOS Button Container
  sosButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 40,
  },
  
  buttonAreaWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#B109C7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  
  sosButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#FECACA',
  },
  
  sosButtonProcessing: {
    opacity: 0.8,
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  
  sosButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  sosButtonTextActive: {
    fontSize: 28,
  },

  sosButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  
  sosButtonSubtextActive: {
    color: 'rgba(255,255,255,0.95)',
  },

  // Helper Text Container
  helperContainer: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 20,
    gap: 8,
  },
  
  sosHelperText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  
  sosHelperTextActive: {
    color: '#DC2626',
    fontSize: 20,
  },

  sosHelperSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  
  sosHelperSubtextActive: {
    color: '#B91C1C',
    fontWeight: '600',
  },

  // Tips Card
  tipsCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 4,
    marginBottom: 4,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  
  tipsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tipsIconText: {
    fontSize: 18,
  },
  
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  
  tipsText: {
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Animations (mantener originales)
  pulseWave: {
    width: 180,
    height: 180,
    borderRadius: 90,
    position: 'absolute',
    zIndex: 0,
  },
  
  glowEffect: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#ff0000',
    position: 'absolute',
    zIndex: 1,
  },
});

export default SOSScreen;
