import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    confirm: { name: "help-circle", color: "#B109C7", bgColor: "rgba(177, 9, 199, 0.1)" },
    success: { name: "checkmark-circle", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" },
    error: { name: "close-circle", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" },
  };

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (visible && isMountedRef.current) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      if (type === "success" || type === "error") {
        const timer = setTimeout(() => {
          if (onAutoClose && isMountedRef.current) {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              if (isMountedRef.current && onAutoClose) {
                onAutoClose();
              }
            });
          }
        }, 2500);
        return () => clearTimeout(timer);
      }
    } else if (isMountedRef.current) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, type, onAutoClose, fadeAnim, scaleAnim]);

  const icon = iconData[type];
  const showButtons = type === "confirm" || !onlyConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header with colored background */}
          <View style={[styles.header, { backgroundColor: icon.bgColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: icon.color }]}>
              <Ionicons
                name={icon.name as any}
                size={28}
                color="white"
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {showButtons && (
              <View style={styles.buttonGroup}>
                {type === "confirm" && !onlyConfirm && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.confirmButton,
                    { backgroundColor: icon.color }
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Decorative elements for success/error */}
            {(type === "success" || type === "error") && (
              <View style={styles.autoCloseIndicator}>
                <View style={styles.dots}>
                  <View style={[styles.dot, { backgroundColor: icon.color }]} />
                  <View style={[styles.dot, { backgroundColor: icon.color, opacity: 0.7 }]} />
                  <View style={[styles.dot, { backgroundColor: icon.color, opacity: 0.4 }]} />
                </View>
                {type === "success" && (
                  <Text style={styles.autoCloseText}>
                    Cerrando modal automáticamente...
                  </Text>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    position: 'relative',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '400',
    paddingHorizontal: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButton: {
    backgroundColor: "#B109C7",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  autoCloseIndicator: {
    marginTop: 20,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  autoCloseText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
