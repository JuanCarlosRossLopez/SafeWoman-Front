import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase-config';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/layouts/Header';
import { useUserStore } from '@/store/userStore';

export default function RegisterContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { emergencyContacts, setEmergencyContacts } = useUserStore();

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
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar el contacto');
        }
      })();
    }
  }, [id]);

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
        setLoading(false);
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
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar el contacto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Header />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#B109C7" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {id ? 'Editar Contacto' : 'Agregar Contacto'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Image
        source={require('@/assets/images/perfil.png')}
        style={styles.profileImage}
      />

      <View style={styles.form}>
        <Text style={styles.label}>Nombre del contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: María González"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Número de teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 9981234567"
          placeholderTextColor="#999"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B109C7',
  },
  form: {
    flex: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
    tintColor: 'gray',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5F5F5F',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#B109C7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
