import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/services/firebase-config';
import { useUserStore } from '@/store/userStore';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { contactSchema } from '@/validators/contactSchema';

export const ProfileInfo = ({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}) => {
  const {
    uid,
    name,
    email,
    phone,
    setUser,
  } = useUserStore((state) => state);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: name || '',
      phone: phone || '',
    },
  });

  const handleSave = async () => {
    const { name: tempName, phone: tempPhone } = getValues();

    try {
      // Validar campos localmente
      if (!tempName || !tempPhone) {
        Alert.alert('Error', 'Por favor completa todos los campos.');
        return;
      }

      const usersRef = collection(db, 'users');
      const phoneQuery = query(usersRef, where('phone', '==', tempPhone));
      const querySnapshot = await getDocs(phoneQuery);

      const phoneInUse = querySnapshot.docs.some((docu) => docu.id !== uid);

      if (phoneInUse) {
        Alert.alert('Error', 'El número de teléfono ya está en uso por otro usuario.');
        return;
      }

      const userRef = doc(db, 'users', uid!);
      await updateDoc(userRef, {
        name: tempName,
        phone: tempPhone,
      });

      setUser({
        name: tempName,
        phone: tempPhone,
      });

      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'Ocurrió un error al guardar los cambios.');
    }
  };

  return (
    <View style={styles.profileCard}>
      <Field label="Nombre">
        {isEditing ? (
          <View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.inputField}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tu nombre"
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>
        ) : (
          <Text style={styles.fieldValue}>{name || 'No especificado'}</Text>
        )}
      </Field>

      <Field label="Correo electrónico">
        <Text style={styles.fieldValue}>{email || 'No especificado'}</Text>
      </Field>

      <Field label="Teléfono">
        {isEditing ? (
          <View>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.inputField}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tu teléfono"
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
          </View>
        ) : (
          <Text style={styles.fieldValue}>{phone || 'No especificado'}</Text>
        )}
      </Field>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(handleSave)}>
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const Field = ({ label, children }: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    elevation: 3,
  },
  fieldContainer: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputField: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A020F0',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#B109C7',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
