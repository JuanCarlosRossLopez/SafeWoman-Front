import React from "react";
import { FlatList, StyleSheet } from "react-native";
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
        <ContactItem
          item={item}
          onEdit={() => onEdit(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      )}
      ListEmptyComponent={<EmptyState />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 24,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
});

export default ListContacts;
