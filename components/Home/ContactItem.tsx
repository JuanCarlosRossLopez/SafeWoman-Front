import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Contact } from "@/types/Contact";
import React from "react";

type Props = {
  item: Contact;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ContactItem({ item, onEdit, onDelete }: Props) {
  return (
    <View style={styles.contactItem}>
      <Ionicons name="person-circle-outline" size={36} color="#888" />
      <View style={styles.contactText}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity onPress={onEdit}>
        <Ionicons name="create-outline" size={24} color="#aa55cc" style={styles.iconBtn} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Ionicons name="close-circle-outline" size={24} color="red" style={styles.iconBtn} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.6,
    borderColor: "#E3E3E3",
    backgroundColor: "#fafafa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  contactText: {
    flex: 2,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  contactPhone: {
    fontSize: 15,
    color: "#666",
  },
  iconBtn: {
    marginHorizontal: 6,
  },
});
