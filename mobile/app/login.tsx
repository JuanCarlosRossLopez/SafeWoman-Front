import { auth, db } from "@/services/firebase-config";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link, Stack, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomModal } from "@/components/ui/CustomModal";

export default function Login() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modal, setModal] = useState({
    visible: false,
    type: "error" as "success" | "error",
    title: "",
    message: "",
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setEmail("");
        setPassword("");
      };
    }, [])
  );

  const showModalError = (title: string, message: string) => {
    setModal({ visible: true, type: "error", title, message });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return showModalError("Campos vacíos", "Ingresa correo y contraseña.");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      await updateDoc(doc(db, "users", user.uid), {
        logged: true,
      });

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          logged: true,
        });
      } else {
        setUser({
          uid: user.uid,
          name: "Usuario",
          email: user.email || email,
          phone: "",
        });
      }

      setModal({
        visible: true,
        type: "success",
        title: "¡Inicio de sesión exitoso!",
        message: "Bienvenido/a de nuevo.",
      });
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        showModalError(
          "Credenciales inválidas",
          "Verifica tu correo y contraseña."
        );
      } else if (error.code === "auth/invalid-email") {
        showModalError("Correo inválido", "El formato del correo es incorrecto.");
      } else {
        showModalError("Error inesperado", error.message || "Intenta nuevamente.");
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "login", headerShown: false }} />
      <SafeAreaView style={styles.section}>
        <View style={styles.container}>
          {/* Decorative background elements */}
          <View style={styles.backgroundDecoration1} />
          <View style={styles.backgroundDecoration2} />
          <View style={styles.backgroundDecoration3} />

          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/iconoSW.png")}
                style={styles.safeLogo}
              />
              <Text style={styles.logoText}>SafeWoman</Text>
            </View>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.textTitle}>¡Bienvenida de vuelta!</Text>
            <Text style={styles.textSubtitle}>
              Da el primer paso hacia tu seguridad
            </Text>
            <View style={styles.decorativeLine} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#B109C7" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#B109C7" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="Contraseña"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#B109C7"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.registerSection}>
              <Text style={styles.textQuestion}>¿No tienes cuenta?</Text>
              <Link href="/register" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.textRegister}>Regístrate aquí</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={16} color="#B109C7" />
              <Text style={styles.securityText}>Tus datos están protegidos con nosotras</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Modal de error o éxito con autocierre */}
      <CustomModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onlyConfirm
        onAutoClose={() => {
          setModal((prev) => ({ ...prev, visible: false }));
          if (modal.type === "success") {
            router.replace("/home");
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    backgroundColor: "white",
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    marginLeft: 30,
    marginRight: 30,
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 30,
  },

  // Background decorative elements
  backgroundDecoration1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(177, 9, 199, 0.05)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    top: 200,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(177, 9, 199, 0.03)',
  },
  backgroundDecoration3: {
    position: 'absolute',
    bottom: 150,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(177, 9, 199, 0.04)',
  },

  // Header section
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  safeLogo: {
    width: 120,
    height: 120,
    shadowColor: '#B109C7',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#B109C7",
    marginTop: 15,
    letterSpacing: 1.2,
  },

  // Welcome section
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  textTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#28303F",
    textAlign: 'center',
    marginBottom: 8,
  },
  textSubtitle: {
    fontSize: 16,
    color: "#7A7A7A",
    textAlign: 'center',
    fontWeight: '400',
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: '#B109C7',
    marginTop: 15,
    borderRadius: 2,
  },

  // Form section
  formContainer: {
    marginTop: 20,
    gap: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 8,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 12,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#28303F',
    paddingVertical: 8,
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    bottom: 8,
    padding: 5,
  },

  // Button section
  button: {
    backgroundColor: "#B109C7",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
    shadowColor: '#B109C7',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.5,
  },

  // Register section
  registerSection: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 20,
  },
  textQuestion: {
    fontSize: 16,
    color: "#7A7A7A",
    fontWeight: '400',
  },
  textRegister: {
    fontSize: 16,
    color: "#B109C7",
    fontWeight: "600",
    textDecorationLine: 'underline',
  },

  // Security note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(177, 9, 199, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 25,
    gap: 8,
  },
  securityText: {
    color: '#B109C7',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
