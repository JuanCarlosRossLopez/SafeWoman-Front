import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { AvatarSection } from "@/components/Profile/AvatarSection";
import { ProfileInfo } from "@/components/Profile/ProfileInfo";
import { Ionicons } from "@expo/vector-icons";
import { CustomModal } from "@/components/ui/CustomModal";
import { auth } from "@/services/firebase-config";
import { signOut } from "firebase/auth";

const ProfileView = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await signOut(auth);
      clearUser();
      setShowLogoutModal(false);
      setFeedbackModal({
        visible: true,
        type: "success",
        title: "Sesión cerrada",
        message: "Has cerrado sesión correctamente.",
      });
      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, visible: false }));
        router.replace("/login");
      }, 1000);
    } catch (error) {
      setFeedbackModal({
        visible: true,
        type: "error",
        title: "Error",
        message: "No se pudo cerrar sesión. Intenta de nuevo.",
      });

      setLoadingLogout(false);
    }
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
          <ProfileInfo isEditing={isEditing} setIsEditing={setIsEditing} />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            disabled={loadingLogout}
          >
            {loadingLogout ? (
              <ActivityIndicator color="#FF4444" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#FF4444" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Modal Confirmación de Logout */}
      <CustomModal
        visible={showLogoutModal}
        type="confirm"
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres salir?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        onlyConfirm={false}
      />

      {/* Modal Feedback (éxito o error) */}
      <CustomModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onAutoClose={() =>
          setFeedbackModal((prev) => ({ ...prev, visible: false }))
        }
        onlyConfirm={true} 
        confirmText="Aceptar"
        onConfirm={() => setFeedbackModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B109C7",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FDF2FF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FFDDDD",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileView;
