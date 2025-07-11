import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
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
import { CustomModal } from "@/components/ui/CustomModal";

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

  // Estados para los modales
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

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

  // Abrir modal para confirmar eliminación
  const confirmDeleteContact = (id: string) => {
    setSelectedId(id);
    setShowModal(true);
  };

  // Confirmación recibida, eliminar contacto
  const handleDeleteConfirmed = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !selectedId) return;

      await deleteDoc(doc(db, "users", user.uid, "emergencyContacts", selectedId));

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const updated = emergencyContacts.filter((c) => c.id !== selectedId);
      setEmergencyContacts(updated);

      setFeedbackModal({
        visible: true,
        type: "success",
        title: "Contacto eliminado",
        message: "El contacto fue eliminado correctamente.",
      });
    } catch (err) {
      console.error("Error real al eliminar:", err);
      setFeedbackModal({
        visible: true,
        type: "error",
        title: "Error",
        message: "No se pudo eliminar el contacto. Intenta de nuevo.",
      });
    } finally {
      setShowModal(false);
      setSelectedId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <UserHeader name={name} />

        <View style={styles.contactsBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus contactos de emergencia</Text>
            {emergencyContacts.length > 0 && (
              <Text style={styles.countText}>
                ({emergencyContacts.length} en total)
              </Text>
            )}
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Cargando contactos...</Text>
          ) : (
            <>
              <FlatList
                data={emergencyContacts.slice(0, 3)}
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
                    onDelete={() => confirmDeleteContact(item.id)}
                  />
                )}
                ListEmptyComponent={<EmptyState />}
                scrollEnabled={false}
                nestedScrollEnabled={true}
              />

              {emergencyContacts.length >= 0 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push("/AllContacts")}
                >
                  <Text style={styles.viewAllText}>Ver todos los contactos</Text>
                  <Ionicons name="arrow-forward" size={18} color="#B109C7" />
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/Register_Contact")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.addButtonText}>Agregar contacto</Text>
          </TouchableOpacity>
        </View>

        <VideosBlock />
      </ScrollView>

      {/* Modal de Confirmación */}
      <CustomModal
        visible={showModal}
        type="confirm"
        title="¿Eliminar contacto?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowModal(false)}
      />

      {/* Modal de Éxito o Error con autocierre */}
      <CustomModal
        visible={feedbackModal.visible}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onAutoClose={() =>
          setFeedbackModal((prev) => ({ ...prev, visible: false }))
        }
        onlyConfirm={true}
      />
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
    fontSize: 17,
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
  viewAllButton: {
    marginTop: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewAllText: {
    color: "#B109C7",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 6,
  },
  countText: {
    color: "#B109C7",
    fontSize: 14,
    paddingLeft: 5,
    fontWeight: "500",
  },
});
