import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
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

export default function HomeScreen() {
  const router = useRouter();
  const { name, emergencyContacts, setEmergencyContacts } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  // Estados para los modales
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true; 
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => {
        subscription.remove();
      };
    }, [])
  );

  // Cleanup effect para prevenir updates después del desmontaje
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);


  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const user = auth.currentUser;
        if (user && isMounted) {
          const contactsRef = collection(
            db,
            "users",
            user.uid,
            "emergencyContacts"
          );
          const querySnapshot = await getDocs(contactsRef);
          const contactsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || '',
            phone: doc.data().phone || '',
            ...doc.data(),
          }));
          
          if (isMounted) {
            setEmergencyContacts(contactsData);
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContacts();
  }, [setEmergencyContacts, isMounted]);

  const confirmDeleteContact = (id: string) => {
    if (!isMounted) return;
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!isMounted) return;
    
    try {
      const user = auth.currentUser;
      if (!user || !selectedId) return;

      await deleteDoc(doc(db, "users", user.uid, "emergencyContacts", selectedId));

      if (isMounted) {
        // Actualizar el estado sin animación para evitar errores
        const updated = emergencyContacts.filter((c) => c.id !== selectedId);
        setEmergencyContacts(updated);

        setFeedbackModal({
          visible: true,
          type: "success",
          title: "Contacto eliminado",
          message: "El contacto fue eliminado correctamente.",
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      if (isMounted) {
        setFeedbackModal({
          visible: true,
          type: "error",
          title: "Error",
          message: "No se pudo eliminar el contacto. Intenta de nuevo.",
        });
      }
    } finally {
      if (isMounted) {
        setShowModal(false);
        setSelectedId(null);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Background decorative elements */}
        <View style={styles.backgroundDecoration1} />
        <View style={styles.backgroundDecoration2} />
        <View style={styles.backgroundDecoration3} />
        
        <Header />
        <UserHeader name={name || undefined} />

        {/* Main Content Card */}
        <View style={styles.mainContentCard}>
          <View style={styles.contactsSection}>
            <View style={styles.sectionHeaderCard}>
              <View style={styles.iconTitleContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Contactos de Emergencia</Text>
                  {emergencyContacts.length > 0 && (
                    <Text style={styles.countText}>
                      {emergencyContacts.length} contacto{emergencyContacts.length !== 1 ? 's' : ''} registrado{emergencyContacts.length !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.loadingText}>Cargando contactos...</Text>
              </View>
            ) : (
              <View style={styles.contactsContainer}>
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
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />

                {emergencyContacts.length >= 1 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push("/AllContacts")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllText}>Ver todos los contactos</Text>
                    <View style={styles.arrowContainer}>
                      <Ionicons name="arrow-forward" size={18} color="#B109C7" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/Register_Contact")}
              activeOpacity={0.8}
            >
              <View style={styles.addButtonContent}>
                <View style={styles.addIconContainer}>
                  <Ionicons name="add" size={24} color="#fff" />
                </View>
                <Text style={styles.addButtonText}>Agregar nuevo contacto</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Videos Section */}
          <VideosBlock />
      </ScrollView>

      {/* Modal Confirmación */}
      <CustomModal
        visible={showModal}
        type="confirm"
        title="¿Eliminar contacto?"
        message="Esta acción no se puede deshacer y el contacto será removido permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowModal(false)}
      />

      {/* Modal Éxito/Error */}
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
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    padding: 16,
  },

  // Background decorative elements
  backgroundDecoration1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(177, 9, 199, 0.03)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    top: 200,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(177, 9, 199, 0.02)',
  },
  backgroundDecoration3: {
    position: 'absolute',
    bottom: 100,
    right: -25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(177, 9, 199, 0.02)',
  },

  // Main content card
  mainContentCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },

  // Contacts section
  contactsSection: {
    gap: 20,
  },
  sectionHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B109C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  countText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },

  // Loading section
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderTopColor: '#B109C7',
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: '500',
  },

  // Contacts container
  contactsContainer: {
    gap: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },

  // View all button
  viewAllButton: {
    marginTop: 6,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: 'rgba(177, 9, 199, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(177, 9, 199, 0.2)',
  },
  viewAllText: {
    color: "#B109C7",
    fontWeight: "600",
    fontSize: 15,
  },
  arrowContainer: {
    backgroundColor: 'rgba(177, 9, 199, 0.1)',
    borderRadius: 12,
    padding: 4,
  },

  // Add button
  addButton: {
    backgroundColor: "#B109C7",
    borderRadius: 20,
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  addIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // Legacy styles (keeping for compatibility)
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 6,
  },
});
