import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import ContactItem from "@/components/Home/ContactItem";
import EmptyState from "./EmptyState";

const ListContacts = ({
  contacts,
  onEdit,
  onDelete,
}: {
  contacts: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.contactCard}>
          <ContactItem
            item={item}
            onEdit={() => onEdit(item.id)}
            onDelete={() => onDelete(item.id)}
          />
        </View>
      )}
      ListEmptyComponent={<EmptyState />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  contactCard: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: "#B109C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0C8FF",
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
});

export default ListContacts;
