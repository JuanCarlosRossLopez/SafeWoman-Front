import React from 'react';
import { View, Text, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SlideProps {
  iconName: string;
  text: string;
  children?: React.ReactNode;
}

export default function Slide({ iconName, text, children }: SlideProps) {
  return (
    <View style={styles.slide}>
      <View style={styles.topSection}>
        <Image source={require('@/assets/images/iconoSW.png')} style={styles.logo} />
        <Text style={styles.appName}>SafeWoman</Text>
        <Text style={styles.welcome}>¡Bienvenida!</Text>
        <View style={styles.diagonal} />
      </View>

      <View style={styles.bottomSection}>
        <FontAwesome name={iconName} size={32} color="white" />
        <Text style={styles.text}>
          {text}
        </Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#B109C7',
  },
  topSection: {
    height: height * 0.65,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'transparent',
    overflow: 'hidden',
    paddingBottom: 70,
    position: 'relative',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginTop: Platform.select({ ios: 60, android: 40 }),
    marginBottom: 10,
    zIndex: 0,
  },
  appName: {
    fontWeight: 'bold',
    color: '#B109C7',
    fontSize: 23,
    marginBottom: 2,
    zIndex: 0,
  },
  welcome: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 17,
    marginBottom: 8,
    zIndex: 0,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  diagonal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: width,
    borderBottomWidth: 130,
    borderLeftColor: 'transparent',
    borderBottomColor: '#B109C7',
    zIndex: 0,
  },
});
