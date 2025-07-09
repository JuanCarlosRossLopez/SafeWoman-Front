import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Header = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Mis Contactos</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#B109C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  backButton: { 
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerSpacer: { width: 32 },
});

export default Header;
