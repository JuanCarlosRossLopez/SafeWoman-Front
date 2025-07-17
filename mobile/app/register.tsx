import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/services/firebase-config';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { registerSchema } from '@/validators/registerSchema';
import { CustomModal } from '@/components/ui/CustomModal';

export default function Register() {
  const router = useRouter();

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
    <SafeAreaView style={styles.section}>
      <View style={styles.container}>
        <View>
          <Image
            source={require('@/assets/images/iconoSW.png')}
            style={styles.safeLogo}
          />
          <Text style={styles.logoText}>Safewoman</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.textTitle}>Regístrate ahora</Text>
          <Text style={styles.textDefault}>Da el primer paso hacia tu seguridad</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Nombre */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="gray"
                  onChangeText={onChange}
                  value={value}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </>
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="gray"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </>
            )}
          />

          {/* Teléfono */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Número"
                  placeholderTextColor="gray"
                  keyboardType="phone-pad"
                  onChangeText={onChange}
                  value={value}
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone.message}</Text>
                )}
              </>
            )}
          />

          {/* Contraseña */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="gray"
                  secureTextEntry={true}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </>
            )}
          />

          {/* Confirmar contraseña */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="gray"
                  secureTextEntry={true}
                  onChangeText={onChange}
                  value={value}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </>
            )}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.text}>Registrarse</Text>
          </TouchableOpacity>

          <View style={styles.textNavigate}>
            <Text style={styles.textQuestion}>¿Ya tienes cuenta?</Text>
            <Link href="/login" asChild>
              <Text style={styles.textRegister}>Inicia sesión</Text>
            </Link>
          </View>
        </View>
      </View>

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
    gap: 20,
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
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});
