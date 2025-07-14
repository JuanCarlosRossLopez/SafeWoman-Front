import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Contact } from "@/types/Contact";

type Props = {
  item: Contact;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ContactItem({ item, onEdit, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Ionicons name="person-circle-outline" size={36} color="#A020F0" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Feather name="edit-2" size={20} color="#6A0DAD" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-bin" size={22} color="#E53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0fe",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#B109C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f4caff",
  },
  avatarWrapper: {
    backgroundColor: "#f7e3ff",
    padding: 6,
    borderRadius: 50,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#4a0066",
  },
  phone: {
    fontSize: 15,
    color: "#7e579f",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  editBtn: {
    padding: 6,
    backgroundColor: "#f4e0ff",
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: "#fde0e0",
    borderRadius: 8,
  },
});
