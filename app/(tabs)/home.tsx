import {View,Text,Alert,FlatList,TouchableOpacity,StyleSheet,LayoutAnimation,UIManager,Platform,SafeAreaView,ScrollView,} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/services/firebase-config";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import Header from "@/layouts/Header";
import ContactItem from "@/components/Home/ContactItem";
import UserHeader from "@/components/Home/UserHeader";
import EmptyState from "@/components/Home/EmptyState";
import VideosBlock from "@/components/Home/VideosBlock";
import { Ionicons } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const router = useRouter();
  const { name, emergencyContacts, setEmergencyContacts } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const contactsRef = collection(
            db,
            "users",
            user.uid,
            "emergencyContacts"
          );
          const querySnapshot = await getDocs(contactsRef);
          const contactsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEmergencyContacts(contactsData);
        }
      } catch (error) {
        console.error("Error al cargar contactos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [setEmergencyContacts]);

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert("¿Eliminar contacto?", "Esta acción no se puede deshacer", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) throw new Error("Usuario no autenticado");

            await deleteDoc(
              doc(db, "users", user.uid, "emergencyContacts", contactId)
            );

            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );

            const updated = emergencyContacts.filter((c) => c.id !== contactId);
            setEmergencyContacts(updated);

            Alert.alert(
              "Contacto eliminado",
              "El contacto fue eliminado correctamente"
            );
          } catch (err: any) {
            console.error("Error real al eliminar:", err);
            Alert.alert(
              "Error",
              "No se pudo eliminar el contacto. Intenta de nuevo."
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Header />
    <UserHeader name={name} />

    <View style={styles.contactsBox}>
      <Text style={styles.sectionTitle}>Tus contactos de emergencia</Text>

      {loading ? (
        <Text style={styles.loadingText}>Cargando contactos...</Text>
      ) : (
        <FlatList
          data={emergencyContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactItem
              item={item}
              onEdit={() =>
                router.push({
                  pathname: "/Register_Contact",
                  params: { id: item.id },
                })
              }
              onDelete={() => handleDeleteContact(item.id)}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/Register_Contact")}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Agregar contacto</Text>
            </TouchableOpacity>
          }
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
        )}
    </View>
    <VideosBlock />
  </ScrollView>
</SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 10,
  },
  container: {
    flex: 1,
  },
  contactsBox: {
    marginTop: 40,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B109C7",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    fontSize: 18,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 20,
  },
  addButton: {
    marginTop: 24,
    backgroundColor: "#B109C7",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
