import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const featuredContent = {
  title: "Protección y prevención para mujeres",
  description:
    "Descubre técnicas de defensa personal y consejos para mantenerte segura en cualquier situación.",
  image:
    "https://cadenaser.com/resizer/v2/GBZR47MVRJGZ7NDX2LCV72BLBY.png?auth=2ed119f185ef3f034f92220916f93094c4360abb7a3a1eb8ec82713c7016a231&quality=70&width=736&height=414&focal=624,500",
};

export default function VideosBlock() {
  const router = useRouter();

  const handleGoToVideos = () => {
    router.push("/Videos");
  };

  return (
    <View style={styles.contentSection}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Contenido Destacado</Text>
      </View>

      <View style={styles.card}>
        <Image source={{ uri: featuredContent.image }} style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{featuredContent.title}</Text>
          <Text style={styles.cardDescription}>{featuredContent.description}</Text>
          <TouchableOpacity style={styles.button} onPress={handleGoToVideos} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Explorar videos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: { marginTop: 30, marginBottom: 15, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 20,
  },
  viewMore: {
    color: "#B109C7",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FDF2FF",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#B109C7",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardTextContainer: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B007A",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#B109C7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
