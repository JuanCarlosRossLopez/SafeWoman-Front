import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const ProfileHeader = ({ isEditing, toggleEdit }: { isEditing: boolean; toggleEdit: () => void }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mi Perfil</Text>
      <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
        <Text style={styles.editButtonText}>{isEditing ? 'Cancelar' : 'Editar'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#B109C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 5,
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  editButton: { padding: 8 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
