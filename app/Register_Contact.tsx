import { useEffect, useState } from 'react'; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase-config';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { contactSchema } from '@/validators/contactSchema';
import { CustomModal } from '@/components/ui/CustomModal';

export default function RegisterContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { emergencyContacts, setEmergencyContacts } = useUserStore();
  const scaleValue = useState(new Animated.Value(0))[0];
  const [loading, setLoading] = useState(false);

  // Estado para el modal de feedback
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const contactRef = doc(db, 'users', user.uid, 'emergencyContacts', id.toString());
          const docSnap = await getDoc(contactRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setValue('name', data.name);
            setValue('phone', data.phone);
          } else {
            setFeedbackModal({
              visible: true,
              type: 'error',
              title: 'Error',
              message: 'Contacto no encontrado',
            });
            setTimeout(() => router.back(), 1500);
          }
        } catch {
          setFeedbackModal({
            visible: true,
            type: 'error',
            title: 'Error',
            message: 'No se pudo cargar el contacto',
          });
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 400,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();
  }, []);

  // Función para autocerrar modal éxito/error después de 2.5s
  useEffect(() => {
    if (feedbackModal.visible && feedbackModal.type === 'success') {
      const timer = setTimeout(() => {
        setFeedbackModal(prev => ({ ...prev, visible: false }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [feedbackModal]);

  const onSubmit = async ({ name, phone }: { name: string; phone: string }) => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setFeedbackModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'Usuario no autenticado',
        });
        setLoading(false);
        return;
      }

      const isPhoneInUse = emergencyContacts.some(
        (c) => c.phone === phone && c.id !== id
      );

      if (isPhoneInUse) {
        setFeedbackModal({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'Este número ya está en uso. Intenta con otro.',
        });
        setLoading(false);
        return;
      }

      if (id) {
        await setDoc(doc(db, 'users', user.uid, 'emergencyContacts', id.toString()), {
          name,
          phone,
          updatedAt: new Date(),
        });

        setEmergencyContacts(
          emergencyContacts.map((c) =>
            c.id === id ? { ...c, name, phone } : c
          )
        );

        setFeedbackModal({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'Contacto actualizado correctamente',
        });
      } else {
        const newContactRef = doc(collection(db, 'users', user.uid, 'emergencyContacts'));
        await setDoc(newContactRef, {
          name,
          phone,
          createdAt: new Date(),
        });

        setEmergencyContacts([
          ...emergencyContacts,
          {
            id: newContactRef.id,
            name,
            phone,
            createdAt: new Date(),
          },
        ]);

        setFeedbackModal({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'Contacto agregado correctamente',
        });
      }

      setTimeout(() => router.back(), 1500);
    } catch {
      setFeedbackModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al guardar el contacto',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{id ? 'Editar Contacto' : 'Agregar Contacto'}</Text>
          <View style={{ width: 32 }} />
        </View>

        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            opacity: scaleValue,
          }}
        >
          <Image
            source={require('@/assets/images/perfil.png')}
            style={styles.profileImage}
          />

          <View style={styles.form}>
            <Text style={styles.label}>Nombre del contacto</Text>
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: María González"
                      placeholderTextColor="#aaa"
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.name && (
                      <Text style={styles.errorText}>{errors.name.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            <Text style={styles.label}>Número de teléfono</Text>
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: 9981234567"
                      placeholderTextColor="#aaa"
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
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {id ? 'Actualizar Contacto' : 'Agregar Contacto'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <CustomModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onCancel={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
        onlyConfirm={feedbackModal.type === 'success'} // success autocierra, error muestra botón
        onAutoClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2FF',
  },
  header: {
    backgroundColor: '#B109C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 24,
    marginTop: 30,
    tintColor: '#B109C7',
  },
  form: {
    marginTop: 10,
    padding: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A4A4A',
    marginBottom: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#F0C8FF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#B109C7',
    padding: 16,
    borderRadius: 15,
    marginTop: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
