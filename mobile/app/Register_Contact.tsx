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
import { SafeAreaView } from 'react-native-safe-area-context';

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
          message: 'Ya existe un contacto registrado con este número. Intenta con otro.',
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Background decorative elements */}
        <View style={styles.backgroundDecoration1} />
        <View style={styles.backgroundDecoration2} />
        <View style={styles.backgroundDecoration3} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{id ? 'Editar Contacto' : 'Agregar Contacto'}</Text>
          <View style={{ width: 32 }} />
        </View>

        <Animated.View
          style={[
            styles.contentContainer,
            {
              transform: [{ scale: scaleValue }],
              opacity: scaleValue,
            }
          ]}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require('@/assets/images/perfil.png')}
                style={styles.profileImage}
              />
              <View style={styles.profileBadge}>
                <Ionicons name="person-add" size={20} color="#fff" />
              </View>
            </View>
            <Text style={styles.profileTitle}>
              {id ? 'Actualizar información' : 'Nuevo contacto de emergencia'}
            </Text>
            <Text style={styles.profileSubtitle}>
              {id ? 'Modifica los datos del contacto' : 'Agrega un contacto de confianza'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIconContainer}>
                <Ionicons name="document-text" size={24} color="#B109C7" />
              </View>
              <View>
                <Text style={styles.formTitle}>Información del Contacto</Text>
                <Text style={styles.formSubtitle}>Completa todos los campos</Text>
              </View>
            </View>

            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="person-outline" size={20} color="#B109C7" />
                  </View>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Ej: María González"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                {errors.name && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  </View>
                )}
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Número de teléfono</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="call-outline" size={20} color="#B109C7" />
                  </View>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, errors.phone && styles.inputError]}
                        placeholder="Ej: 9981234567"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                {errors.phone && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.phone.message}</Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.buttonText}>Procesando...</Text>
                    </>
                  ) : (
                    <>
                      <View style={styles.buttonIcon}>
                        <Ionicons 
                          name={id ? "checkmark-circle" : "add-circle"} 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      <Text style={styles.buttonText}>
                        {id ? 'Actualizar Contacto' : 'Agregar Contacto'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Consejo de seguridad</Text>
                  <Text style={styles.infoText}>
                    Asegúrate de que sea una persona de confianza que pueda ayudarte en caso de emergencia.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <CustomModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onCancel={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
        onlyConfirm={feedbackModal.type === 'success'} 
        onAutoClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Background decorative elements
  backgroundDecoration1: {
    position: 'absolute',
    top: 100,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(177, 9, 199, 0.05)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    top: 300,
    left: -40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(177, 9, 199, 0.03)',
  },
  backgroundDecoration3: {
    position: 'absolute',
    bottom: 200,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(177, 9, 199, 0.02)',
  },

  // Header
  header: {
    backgroundColor: '#B109C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },

  // Content container
  contentContainer: {
    padding: 20,
    gap: 24,
  },

  // Profile section
  profileSection: {
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    tintColor: '#B109C7',
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 8,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 280,
  },

  // Form card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  formIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(177, 9, 199, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Form
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
    paddingRight: 16,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },

  // Submit button
  submitButton: {
    backgroundColor: '#B109C7',
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  buttonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 18,
    fontWeight: '500',
  },
});
