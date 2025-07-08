import React, { useState } from 'react';
import {  ScrollView, TouchableOpacity, Text, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-config';
import { useUserStore } from '@/store/userStore';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { AvatarSection } from '@/components/Profile/AvatarSection';
import { ProfileInfo } from '@/components/Profile/ProfileInfo';
import { LogoutModal } from '@/components/Profile/LogoutModal';

const ProfileView = () => {
  const router = useRouter();
  const { name, email, phone, emergencyContacts, setUser, clearUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name || '');
  const [tempPhone, setTempPhone] = useState(phone || '');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSave = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return Alert.alert('Error', 'No se encontró el usuario autenticado');

      setUser({ name: tempName, phone: tempPhone });
      await updateDoc(doc(db, 'users', user.uid), {
        name: tempName,
        phone: tempPhone,
      });

      setIsEditing(false);
      Alert.alert('Perfil actualizado', 'Tus cambios se han guardado correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    }
  };

  const handleLogout = () => {
    clearUser();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#A020F0' }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }} contentContainerStyle={{ paddingBottom: 40 }}>
        <ProfileHeader isEditing={isEditing} toggleEdit={() => setIsEditing(!isEditing)} />
        <AvatarSection />
        <ProfileInfo
          isEditing={isEditing}
          name={name}
          email={email}
          phone={phone}
          tempName={tempName}
          tempPhone={tempPhone}
          setTempName={setTempName}
          setTempPhone={setTempPhone}
          emergencyContacts={emergencyContacts}
          handleSave={handleSave}
        />
        <TouchableOpacity style={{ backgroundColor: '#fff', borderColor: '#ff4444', borderWidth: 1, borderRadius: 10, padding: 15, alignItems: 'center', marginHorizontal: 20, marginTop: 30 }} onPress={() => setShowLogoutModal(true)}>
          <Text style={{ color: '#ff4444', fontSize: 16, fontWeight: 'bold' }}>Cerrar sesión</Text>
        </TouchableOpacity>
        <LogoutModal visible={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileView;
