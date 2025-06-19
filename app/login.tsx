import { Link, Stack, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {Alert,Image,StyleSheet,Text,TextInput,TouchableOpacity,View,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase-config';
import { useFocusEffect } from '@react-navigation/native';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEmail('');
        setPassword('');
      };
    }, [])
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
    } catch (error: any) {
      console.log('Error al iniciar sesión:', error);
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Credenciales inválidas. Por favor verifica tu correo y contraseña.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Correo electrónico inválido.');
      } else {
        Alert.alert('Error', error.message || 'Error desconocido al iniciar sesión.');
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'login' }} />
      <SafeAreaView style={styles.section}>
        <View style={styles.container}>
          <View>
            <Image source={require('@/assets/images/iconoSW.png')} style={styles.safeLogo} />
            <Text style={styles.logoText}>Safewoman</Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={styles.textTitle}>Inicia sesión ahora</Text>
            <Text style={styles.textDefault}>Da el primer paso hacia tu seguridad</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="gray"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.text}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.textNavigate}>
              <Text style={styles.textQuestion}>¿No tienes cuenta?</Text>
              <Link href="/register" asChild>
                <Text style={styles.textRegister}>Regístrate</Text>
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    marginLeft: 40,
    marginRight: 40,
    justifyContent: 'center',
  },
  safeLogo: {
    alignSelf: 'center',
    width: 130,
    height: 130,
  },
  logoText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B109C7',
    marginTop: 10,
  },
  textTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28303F',
  },
  textDefault: {
    fontSize: 16,
    color: '#5F5F5F',
    marginTop: 8,
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ACA9A9',
    fontSize: 16,
  },
  formContainer: {
    marginTop: 30,
    gap: 30,
  },
  button: {
    backgroundColor: '#B109C7',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  textQuestion: {
    fontSize: 16,
    color: '#5F5F5F',
  },
  textRegister: {
    fontSize: 16,
    color: '#B109C7',
    fontWeight: '600',
  },
  textNavigate: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
