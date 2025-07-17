import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmptyState = () => (
  <View style={styles.container}>
    <Ionicons name="people-outline" size={60} color="#B109C7" />
    <Text style={styles.text}>No hay contactos aún</Text>
    <Text style={styles.subtext}>Presiona el botón para agregar uno nuevo</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#FDF2FF",
  },
  text: {
    textAlign: "center",
    color: "#B109C7",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "500",
  },
  subtext: {
    textAlign: "center",
    color: "#B109C7",
    fontSize: 14,
    marginTop: 8,
  },
});

export default EmptyState;
