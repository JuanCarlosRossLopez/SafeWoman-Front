import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from "react-native";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db, auth } from "@/services/firebase-config";
import { useUserStore } from "@/store/userStore";
import ContactList from "@/components/Contacts/ListContacts";
import AddContactButton from "@/components/Contacts/AddContactButton";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AllContacts = () => {
  const { emergencyContacts, setEmergencyContacts } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAllContacts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const contactsRef = collection(db, "users", user.uid, "emergencyContacts");
        const querySnapshot = await getDocs(contactsRef);
        const contactsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmergencyContacts(contactsData);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los contactos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllContacts();
  }, []);

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert(
      "¿Eliminar contacto?",
      "Esta acción no se puede deshacer",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) throw new Error("Usuario no autenticado");

              await deleteDoc(doc(db, "users", user.uid, "emergencyContacts", contactId));
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setEmergencyContacts(emergencyContacts.filter((contact) => contact.id !== contactId));
              Alert.alert("Contacto eliminado", "El contacto fue eliminado correctamente");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el contacto");
            }
          },
        },
      ]
    );
  };

  const navigateToEdit = (id: string) => {
    router.push({ pathname: "/Register_Contact", params: { id } });
  };

  return (
    <View style={styles.container}>
       <CustomHeader title="Mis contactos" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B109C7" />
        </View>
      ) : (
        <ContactList
          contacts={emergencyContacts}
          onEdit={navigateToEdit}
          onDelete={handleDeleteContact}
        />
      )}
      <AddContactButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF2FF" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDF2FF",
  },
});

export default AllContacts;
