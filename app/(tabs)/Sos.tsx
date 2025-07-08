import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '@/layouts/Header';

interface RunningAnimation {
  animation: Animated.CompositeAnimation;
  timerId: NodeJS.Timeout;
}

const SOSScreen = () => {
  const numWaves = 2;
  const waveAnimatedValues = useRef([...Array(numWaves)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const runningAnimations: RunningAnimation[] = [];

    waveAnimatedValues.forEach((animValue, index) => {
      const individualAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1500,
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

      const timerId = setTimeout(() => {
        individualAnimation.start();
      }, index * 500);

      runningAnimations.push({ animation: individualAnimation, timerId });
    });

    return () => {
      runningAnimations.forEach(({ animation, timerId }: RunningAnimation) => {
        clearTimeout(timerId);
        animation.stop();
      });
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
              outputRange: [1, 4],
            });
            const opacity = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 0],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.pulseWave,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              />
            );
          })}
          <TouchableOpacity style={styles.sosButton} onPress={() => console.log("SOS Pressed")}>
            <Text style={styles.sosButtonText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.sosHelperText}>Presiona el botón para enviar una alerta</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A020F0',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 10,
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
    overflow: 'visible',
  },
  sosButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  sosHelperText: {
    marginBottom: 30,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#B109C7',
    paddingVertical: 10,
    paddingHorizontal: 90,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pulseWave: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#B109C7',
    position: 'absolute',
    zIndex: 0,
  },
});

export default SOSScreen; 