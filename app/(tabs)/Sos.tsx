import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '@/layouts/Header';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-config';
import { useUserStore } from '@/store/userStore';
import * as Location from 'expo-location';
import { CustomModal } from '@/components/ui/CustomModal';

interface RunningAnimation {
  animation: Animated.CompositeAnimation;
  timerId: NodeJS.Timeout;
}

const SOSScreen = () => {
  const numWaves = 2;
  const waveAnimatedValues = useRef([...Array(numWaves)].map(() => new Animated.Value(0))).current;
  const { uid } = useUserStore();
  const [alertActive, setAlertActive] = useState(false);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
    onlyConfirm: true
  });

  const showModal = (type: 'confirm' | 'success' | 'error', title: string, message: string, onlyConfirm = true) => {
    setModalConfig({
      type,
      title,
      message,
      onConfirm: () => setModalVisible(false),
      onlyConfirm
    });
    setModalVisible(true);
  };

  const updateLocation = async () => {
    if (!alertActive) return; 
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          showModal('error', 'Permiso denegado', 'No podemos actualizar tu ubicación sin permisos');
          return;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000
      });
      
      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          'location.latitude': location.coords.latitude,
          'location.longitude': location.coords.longitude,
          'location.timestamp': new Date()
        });
      }
    } catch (error) {
    }
  };

  const toggleAlert = async () => {
    if (!uid || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const newAlertState = !alertActive;
      setAlertActive(newAlertState);
      
      if (newAlertState) {
        await Promise.all([
          updateLocation(), 
          updateDoc(doc(db, 'users', uid), {
            alertaActiva: true,
            createdAt: new Date()
          })
        ]);
        
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
        }
        locationIntervalRef.current = setInterval(updateLocation, 15000);
        
        showModal('success', 'Alerta activada', 'Tu ubicación se está compartiendo');
      } else {
        await updateDoc(doc(db, 'users', uid), {
          alertaActiva: false
        });
        
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }
        
        showModal('success', 'Alerta desactivada', 'Tu alerta SOS ha sido desactivada');
      }
    } catch (error) {
      setAlertActive(!alertActive);
      showModal('error', 'Error', 'No se pudo actualizar el estado de alerta');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const runningAnimations: RunningAnimation[] = [];

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
        timerId: setTimeout(() => individualAnimation.start(), index * 300) 
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

  return (
    <View style={styles.container}>
      <Header/>
      <View style={styles.sosButtonContainer}>
        <View style={styles.buttonAreaWrapper}>
          {[...Array(numWaves).keys()].map(index => {
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
                    backgroundColor: alertActive ? '#df1d13ff' : '#B109C7', 
                  },
                ]}
              />
            );
          })}
          <TouchableOpacity 
            style={[
              styles.sosButton, 
              alertActive && { backgroundColor: '#FF3A30' }, 
              isProcessing && { opacity: 0.7 }
            ]} 
            onPress={toggleAlert}
            disabled={isProcessing}
          >
            <Text style={styles.sosButtonText}>
              {isProcessing ? '...' : (alertActive ? 'DESACTIVAR' : 'SOS')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[
        styles.sosHelperText,
        alertActive && { color: '#da1308ff', fontWeight: '700' }
      ]}>
        {alertActive 
          ? 'Alerta activa - Ubicación compartiéndose' 
          : 'Presiona el botón para enviar una alerta'}
      </Text>
      
      <CustomModal
        visible={modalVisible}
        type={modalConfig.type as any}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onlyConfirm={modalConfig.onlyConfirm}
        onAutoClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
    zIndex: 1,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  sosHelperText: {
    marginBottom: 30,
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
});

export default SOSScreen;