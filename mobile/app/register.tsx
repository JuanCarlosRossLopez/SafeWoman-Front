import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/services/firebase-config';
import { Link, useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { registerSchema } from '@/validators/registerSchema';
import { CustomModal } from '@/components/ui/CustomModal';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  // Estado para controlar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    type: 'confirm' | 'success' | 'error';
    title: string;
    message: string;
  }>({ type: 'confirm', title: '', message: '' });

  useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [reset])
  );

  const onSubmit = async (data: any) => {
    try {
      const usersRef = collection(db, 'users');
      const phoneQuery = query(usersRef, where('phone', '==', data.phone));
      const querySnapshot = await getDocs(phoneQuery);

      if (!querySnapshot.empty) {
        setModalData({
          type: 'error',
          title: 'Error',
          message: 'El número de teléfono ya está en uso. Intenta con otro.',
        });
        setModalVisible(true);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        createdAt: new Date(),
        alertaActiva: false,
        location: {
          latitude: null,
          longitude: null,
          timestamp: null,
        },
        logged: false,
      });

      reset();

      setModalData({
        type: 'success',
        title: '¡Éxito!',
        message: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
      });
      setModalVisible(true);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setModalData({
          type: 'error',
          title: 'Error',
          message: 'El correo ya está en uso. Intenta con otro.',
        });
      } else {
        setModalData({
          type: 'error',
          title: 'Error',
          message: error.message,
        });
      }
      setModalVisible(true);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "register", headerShown: false }} />
      <SafeAreaView style={styles.section}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Decorative background elements */}
            <View style={styles.backgroundDecoration1} />
            <View style={styles.backgroundDecoration2} />
            <View style={styles.backgroundDecoration3} />

            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/iconoSW.png')}
                  style={styles.safeLogo}
                />
                <Text style={styles.logoText}>SafeWoman</Text>
              </View>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.textTitle}>¡Únete a SafeWoman!</Text>
              <Text style={styles.textSubtitle}>
                Da el primer paso hacia tu seguridad
              </Text>
              <View style={styles.decorativeLine} />
            </View>

            <View style={styles.formContainer}>
              {/* Nombre */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color="#B109C7" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        placeholderTextColor="#A0A0A0"
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                    {errors.name && (
                      <Text style={styles.errorText}>{errors.name.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={20} color="#B109C7" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Teléfono */}
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="call-outline" size={20} color="#B109C7" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Número de teléfono"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="phone-pad"
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                    {errors.phone && (
                      <Text style={styles.errorText}>{errors.phone.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Contraseña */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={20} color="#B109C7" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { paddingRight: 50 }]}
                        placeholder="Contraseña"
                        placeholderTextColor="#A0A0A0"
                        secureTextEntry={!showPassword}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#B109C7"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Confirmar contraseña */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#B109C7" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { paddingRight: 50 }]}
                        placeholder="Confirmar contraseña"
                        placeholderTextColor="#A0A0A0"
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#B109C7"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Crear cuenta</Text>
              </TouchableOpacity>

              <View style={styles.registerSection}>
                <Text style={styles.textQuestion}>¿Ya tienes cuenta?</Text>
                <Link href="/login" asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.textLogin}>Inicia sesión aquí</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <View style={styles.securityNote}>
                <Ionicons name="shield-checkmark" size={16} color="#B109C7" />
                <Text style={styles.securityText}>Tus datos están seguros con nosotras</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modal personalizado */}
        <CustomModal
          visible={modalVisible}
          type={modalData.type}
          title={modalData.title}
          message={modalData.message}
          onlyConfirm
          onConfirm={() => setModalVisible(false)}
          onAutoClose={
            modalData.type === 'success'
              ? () => {
                  setModalVisible(false);
                  router.replace('/login');
                }
              : () => setModalVisible(false)
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    marginLeft: 30,
    marginRight: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },

  // Background decorative elements
  backgroundDecoration1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(177, 9, 199, 0.05)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    top: 300,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(177, 9, 199, 0.03)',
  },
  backgroundDecoration3: {
    position: 'absolute',
    bottom: 200,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(177, 9, 199, 0.04)',
  },

  // Header section
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  safeLogo: {
    width: 100,
    height: 100,
    shadowColor: '#B109C7',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#B109C7',
    marginTop: 12,
    letterSpacing: 1.0,
  },

  // Welcome section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  textTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#28303F',
    textAlign: 'center',
    marginBottom: 8,
  },
  textSubtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    fontWeight: '400',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#B109C7',
    marginTop: 15,
    borderRadius: 2,
  },

  // Form section
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 8,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#28303F',
    paddingVertical: 8,
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    padding: 5,
  },

  // Button section
  button: {
    backgroundColor: '#B109C7',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#B109C7',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },

  // Register section
  registerSection: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  textQuestion: {
    fontSize: 16,
    color: '#7A7A7A',
    fontWeight: '400',
  },
  textLogin: {
    fontSize: 16,
    color: '#B109C7',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Security note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(177, 9, 199, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 25,
    gap: 8,
  },
  securityText: {
    color: '#B109C7',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Error text
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 32,
    fontWeight: '500',
  },
});
