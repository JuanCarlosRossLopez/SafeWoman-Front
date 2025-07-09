import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { AvatarSection } from '@/components/Profile/AvatarSection';
import { ProfileInfo } from '@/components/Profile/ProfileInfo';
import { LogoutModal } from '@/components/Profile/LogoutModal';
import { Ionicons } from '@expo/vector-icons';

const ProfileView = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true
    }).start();
  });

  const handleLogout = () => {
    clearUser();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileHeader
            isEditing={isEditing}
            toggleEdit={() => setIsEditing(!isEditing)}
          />
          
          <AvatarSection />
          
          <ProfileInfo
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
          
          <LogoutModal
            visible={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogout}
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B109C7',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FDF2FF',
  },
  scrollContent: {
    paddingBottom: 40
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FFDDDD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ProfileView;