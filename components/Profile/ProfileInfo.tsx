import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/services/firebase-config";
import { useUserStore } from "@/store/userStore";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "@/validators/contactSchema";
import { CustomModal } from "@/components/ui/CustomModal";

export const ProfileInfo = ({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}) => {
  const { uid, name, email, phone, setUser } = useUserStore((state) => state);
  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      name: name || "",
      phone: phone || "",
    },
  });

  const showModal = (type: "success" | "error", title: string, message: string) => {
    setModal({
      visible: true,
      type,
      title,
      message,
    });
  };

  const handleSave = async () => {
    const { name: tempName, phone: tempPhone } = getValues();

    try {
      if (!tempName || !tempPhone) {
        showModal("error", "Error", "Por favor completa todos los campos.");
        return;
      }

      const usersRef = collection(db, "users");
      const phoneQuery = query(usersRef, where("phone", "==", tempPhone));
      const querySnapshot = await getDocs(phoneQuery);
      const phoneInUse = querySnapshot.docs.some((docu) => docu.id !== uid);

      if (phoneInUse) {
        showModal("error", "Error", "El número de teléfono ya está en uso por otro usuario.");
        return;
      }

      const userRef = doc(db, "users", uid!);
      await updateDoc(userRef, {
        name: tempName,
        phone: tempPhone,
      });

      setUser({
        name: tempName,
        phone: tempPhone,
      });

      showModal("success", "¡Éxito!", "Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (error) {
      showModal("error", "Error", "Ocurrió un error al guardar los cambios.");
    }
  };

  return (
    <View style={styles.profileCard}>
      {/* Campo Nombre */}
      <Field label="Nombre">
        {isEditing ? (
          <View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.inputField}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tu nombre"
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.fieldValue}>{name || "No especificado"}</Text>
        )}
      </Field>

      {/* Campo Correo */}
      <Field label="Correo electrónico">
        <Text style={styles.fieldValue}>{email || "No especificado"}</Text>
      </Field>

      {/* Campo Teléfono */}
      <Field label="Teléfono">
        {isEditing ? (
          <View>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.inputField}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tu teléfono"
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.fieldValue}>{phone || "No especificado"}</Text>
        )}
      </Field>

      {/* Botón Guardar */}
      {isEditing && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit(handleSave)}
        >
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      )}
      
      {/* Información importante */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Información importante</Text>
        <Text style={styles.infoText}>
          Asegúrate de mantener tu información actualizada. Esto es vital en
          caso de emergencia o si necesitamos contactarte rápidamente.
        </Text>
      </View>

      {/* Modal de feedback */}
      <CustomModal
        visible={modal.visible}
        type={modal.type as "success" | "error"}
        title={modal.title}
        message={modal.message}
        onlyConfirm={true}
        onAutoClose={() => setModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

// Componente auxiliar Field
const Field = ({ label, children }: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

// Estilos (se mantienen igual)
const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  inputField: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#A020F0",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#B109C7",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#FBEAFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B109C7",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});