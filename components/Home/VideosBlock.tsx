import { View, Text, Image, StyleSheet } from "react-native";

export default function VideosBlock() {
  return (
    <View style={styles.videosSection}>
      <View style={styles.videoHeader}>
        <Text style={styles.sectionTitle}>Videos</Text>
        <Text style={{ color: "#666" }}>Ver más videos</Text>
      </View>
      <Image
        source={require("../../assets/images/mujerVideo.jpg")}
        style={styles.videoThumbnail}
      />
      <Text style={styles.videoCaption}>Cómo reaccionar ante una situación de riesgo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  videosSection: { marginTop: 30, marginBottom: 30 },
  videoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 18,
  },
  videoThumbnail: { width: "100%", height: 160, borderRadius: 10 },
  videoCaption: { marginTop: 8, fontWeight: "bold", color: "#333" },
});
