import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const ProfileInfo = ({
  isEditing,
  name,
  email,
  phone,
  tempName,
  tempPhone,
  setTempName,
  setTempPhone,
  emergencyContacts,
  handleSave
}: any) => {
  return (
    <View style={styles.profileCard}>
      <Field label="Nombre">
        {isEditing ? (
          <TextInput style={styles.inputField} value={tempName} onChangeText={setTempName} placeholder="Tu nombre" />
        ) : (
          <Text style={styles.fieldValue}>{name || 'No especificado'}</Text>
        )}
      </Field>

      <Field label="Correo electrónico">
        <Text style={styles.fieldValue}>{email || 'No especificado'}</Text>
      </Field>

      <Field label="Teléfono">
        {isEditing ? (
          <TextInput
            style={styles.inputField}
            value={tempPhone}
            onChangeText={setTempPhone}
            placeholder="Tu teléfono"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.fieldValue}>{phone || 'No especificado'}</Text>
        )}
      </Field>

      <Field label="Contactos de emergencia">
        {emergencyContacts.length > 0 ? (
          emergencyContacts.map((contact: any, index: number) => (
            <View key={index} style={styles.contactItem}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              {isEditing && (
                <TouchableOpacity style={styles.deleteContactButton}>
                  <MaterialIcons name="delete" size={20} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noContactsText}>No hay contactos agregados</Text>
        )}
      </Field>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
  fieldLabel: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '500' },
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactName: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  contactPhone: { fontSize: 14, color: '#666', marginRight: 10 },
  deleteContactButton: { padding: 5 },
  noContactsText: { fontSize: 14, color: '#999', fontStyle: 'italic', marginTop: 5 },
  saveButton: {
    backgroundColor: '#A020F0',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
