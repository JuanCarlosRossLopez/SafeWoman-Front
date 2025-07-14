import React, { useState } from "react";
import {View,Text,Image,StyleSheet,TouchableOpacity,TouchableWithoutFeedback,ActivityIndicator} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { auth } from "@/services/firebase-config";
import { signOut } from "firebase/auth";
import { CustomModal } from "@/components/ui/CustomModal";

const Header = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleLogout = async () => {
    setDropdownVisible(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLoading(true);
      setShowLogoutModal(false);
      await signOut(auth);
      clearUser();
      setFeedbackModal({
        visible: true,
        type: "success",
        title: "Sesión cerrada",
        message: "Has cerrado sesión correctamente",
      });

      setTimeout(() => {
        setFeedbackModal((prev) => ({ ...prev, visible: false }));
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setLoading(false);
      setFeedbackModal({
        visible: true,
        type: "error",
        title: "Error",
        message: "No se pudo cerrar sesión. Intenta de nuevo.",
      });
    }
  };

  const goToProfile = () => {
    setDropdownVisible(false);
    router.push("/ProfileView");
  };

  return (
    <View>
      <View style={styles.titleContainer}>
        <View style={styles.leftHeader}>
          <Image
            source={require("@/assets/images/iconoSW.png")}
            style={styles.logo}
          />
          <Text style={styles.titleText}>Safewoman</Text>
        </View>

        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#A020F0" />
          ) : (
            <Ionicons name="settings-outline" size={28} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>Mi cuenta</Text>

              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={goToProfile}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color="#A020F0"
                />
                <Text style={styles.viewProfileButtonText}>Ver perfil</Text>
                <Ionicons name="chevron-forward" size={20} color="#A020F0" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Modal de confirmación de logout */}
      <CustomModal
        visible={showLogoutModal}
        type="confirm"
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres salir?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Modal de feedback (éxito/error) */}
      <CustomModal
        visible={feedbackModal.visible}
        type={feedbackModal.type as "success" | "error"}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onlyConfirm={true}
        onAutoClose={() =>
          setFeedbackModal((prev) => ({ ...prev, visible: false }))
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 22,
    paddingHorizontal: 4,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#A020F0",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 80,
    right: 16,
    zIndex: 99,
    backgroundColor: "transparent",
  },
  dropdown: {
    width: 250,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#A020F0",
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  viewProfileButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#B109C7",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Header;