import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;

interface Props {
  visible: boolean;
  type?: "confirm" | "success" | "error";
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  onlyConfirm?: boolean;
  onAutoClose?: () => void; 
}

export const CustomModal = ({
  visible,
  type = "confirm",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onlyConfirm = false,
  onAutoClose,
}: Props) => {
  const iconData = {
    confirm: { name: "help-circle", color: "#B109C7" },
    success: { name: "checkmark-circle", color: "#4BB543" },
    error: { name: "close-circle", color: "#FF4444" },
  };

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      if (type === "success" || type === "error") {
        const timer = setTimeout(() => {
          if (onAutoClose) onAutoClose();
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, type, onAutoClose]);

  const icon = iconData[type];

  const showButtons =
    type === "confirm" && !onlyConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          <Ionicons
            name={icon.name as any}
            size={64}
            color={icon.color}
            style={styles.icon}
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {showButtons && (
            <View style={styles.buttonGroup}>
              {!onlyConfirm && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#B109C7",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F2F2F2",
  },
  cancelText: {
    color: "#333",
    fontWeight: "500",
  },
});
