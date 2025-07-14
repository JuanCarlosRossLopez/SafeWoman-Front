import { auth, db } from "@/services/firebase-config";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link, Stack, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      } else {
        setUser({
          uid: user.uid,
          name: "Usuario",
          email: user.email || email,
          phone: "",
        });
      }

      router.replace("/home");
    } catch (error: any) {
      console.log("Error al iniciar sesión:", error);
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
      <Stack.Screen options={{ title: "login" }} />
      <SafeAreaView style={styles.section}>
        <View style={styles.container}>
          <View>
            <Image
              source={require("@/assets/images/iconoSW.png")}
              style={styles.safeLogo}
            />
            <Text style={styles.logoText}>Safewoman</Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={styles.textTitle}>Inicia sesión ahora</Text>
            <Text style={styles.textDefault}>
              Da el primer paso hacia tu seguridad
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <View style={{ position: "relative" }}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="gray"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 10,
                  padding: 3,
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#B109C7"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.text}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.textNavigate}>
              <Text style={styles.textQuestion}>¿No tienes cuenta?</Text>
              <Link href="/register" asChild>
                <Text style={styles.textRegister}>Regístrate</Text>
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Modal de error con autocierre */}
      <CustomModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onlyConfirm
        onAutoClose={() => setModal((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    marginLeft: 40,
    marginRight: 40,
    justifyContent: "center",
  },
  safeLogo: {
    alignSelf: "center",
    width: 130,
    height: 130,
  },
  logoText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#B109C7",
    marginTop: 10,
  },
  textTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28303F",
  },
  textDefault: {
    fontSize: 16,
    color: "#5F5F5F",
    marginTop: 8,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#ACA9A9",
    fontSize: 16,
  },
  formContainer: {
    marginTop: 30,
    gap: 30,
  },
  button: {
    backgroundColor: "#B109C7",
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
  textQuestion: {
    fontSize: 16,
    color: "#5F5F5F",
  },
  textRegister: {
    fontSize: 16,
    color: "#B109C7",
    fontWeight: "600",
  },
  textNavigate: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
});
