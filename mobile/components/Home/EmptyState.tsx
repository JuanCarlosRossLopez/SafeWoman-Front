import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={50} color="#B109C7" />
      <Text style={styles.emptyStateText}>No tienes contactos registrados</Text>
      <Text style={styles.emptyStateSubtext}>Agrega al menos uno para tu seguridad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5F5F5F",
    marginTop: 10,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    textAlign: "center",
  },
});
