import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase-config';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';

export default function RegisterContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { emergencyContacts, setEmergencyContacts } = useUserStore();
  const scaleValue = useState(new Animated.Value(0))[0];

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
            setName(data.name);
            setPhone(data.phone);
          } else {
            Alert.alert('Error', 'Contacto no encontrado');
            router.back();
          }
        } catch {
          Alert.alert('Error', 'No se pudo cargar el contacto');
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
  },);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      if (id) {
        await setDoc(doc(db, 'users', user.uid, 'emergencyContacts', id.toString()), {
          name,
          phone,
          updatedAt: new Date(),
        });

        setEmergencyContacts(emergencyContacts.map(c =>
          c.id === id ? { ...c, name, phone } : c
        ));

        Alert.alert('Éxito', 'Contacto actualizado correctamente');
      } else {
        const newContactRef = doc(collection(db, 'users', user.uid, 'emergencyContacts'));
        await setDoc(newContactRef, {
          name,
          phone,
          createdAt: new Date(),
        });

        setEmergencyContacts([...emergencyContacts, {
          id: newContactRef.id,
          name,
          phone,
          createdAt: new Date(),
        }]);

        Alert.alert('Éxito', 'Contacto agregado correctamente');
      }

      router.back();
    } catch {
      Alert.alert('Error', 'Ocurrió un error al guardar el contacto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
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
          <TextInput
            style={styles.input}
            placeholder="Ej: María González"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Número de teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 9981234567"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
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
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#F0C8FF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
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
