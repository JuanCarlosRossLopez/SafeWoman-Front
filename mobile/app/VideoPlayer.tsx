import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

export default function VideoPlayer() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const videoId = (url as string).split("v=")[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}?controls=1&autoplay=1`;
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Regresar</Text>
        </TouchableOpacity>
      </View>

      {/* Loader mientras se carga */}
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#B109C7" />
        </View>
      )}

      {/* WebView con alto limitado */}
      <WebView
        source={{ uri: embedUrl }}
        style={styles.webview}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B109C7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 4,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
  },
  webview: {
    height: screenHeight * 0.8, 
    width: "100%",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 1,
  },
});
