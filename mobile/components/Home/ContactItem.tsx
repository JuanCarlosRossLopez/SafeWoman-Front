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
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Generate background color based on name
  const getAvatarColor = (name: string) => {
    const colors = ['#B109C7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <View style={styles.container}>
      <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(item.name) }]}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        <View style={styles.onlineIndicator} />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={14} color="#6B7280" />
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
        <View style={styles.emergencyBadge}>
          <Ionicons name="alert-circle" size={12} color="#EF4444" />
          <Text style={styles.emergencyText}>Contacto de emergencia</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn} activeOpacity={0.7}>
          <Feather name="edit-2" size={18} color="#B109C7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
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
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: '500',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  emergencyText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: '600',
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(177, 9, 199, 0.1)",
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
