import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AddContactButton = () => {
  const router = useRouter();

  return (
    <View style={styles.addButtonContainer}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/Register_Contact")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.addButtonText}>Agregar Contacto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: '#B109C7',
    padding: 16,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#B109C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default AddContactButton;
