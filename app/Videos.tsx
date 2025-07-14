import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import CustomHeader from "@/components/CustomHeader";
import { useRouter } from "expo-router";

const videos = [
  { id: "1", title: "Técnicas de DEFENSA personal para MUJERES", url: "https://www.youtube.com/watch?v=BwAlO5UHgPA" },
  { id: "2", title: "Defensa personal básica para mujeres", url: "https://www.youtube.com/watch?v=5BPerBgoqVk" },
  { id: "3", title: "Prevención y reacción ante acoso sexual", url: "https://www.youtube.com/watch?v=F1ltAeahB28" },
  { id: "4", title: "Acciones de prevención al acoso sexual y hostigamiento", url: "https://www.youtube.com/watch?v=gcnCEDVZzwg" },
  { id: "5", title: "Técnicas defensa personal femenina (Kickboxing)", url: "https://www.youtube.com/watch?v=7pTIiN8N0iw" },
  { id: "6", title: "Prevención del acoso laboral y sexual", url: "https://www.youtube.com/watch?v=COIkVgdqfq4" },
  { id: "7", title: "Los mejores tips de defensa personal para mujeres", url: "https://www.youtube.com/watch?v=zx8wESDa9qY" },
  { id: "8", title: "Krav Maga: defensa ante estrangulación", url: "https://www.youtube.com/watch?v=uV7TZw2JAJ8" },
  { id: "9", title: "Prevención del acoso callejero a mujeres y niñas", url: "https://www.youtube.com/watch?v=Jr36YrTJYY0" },
  { id: "10", title: "Protocolo acción ante acoso sexual en el trabajo", url: "https://www.youtube.com/watch?v=sdK0q8_CN5U" },
];

const getYouTubeThumbnail = (url: string) => {
  const videoId = url.split("v=")[1];
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export default function AllVideos() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader title="Videos educativos" />
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: "/VideoPlayer", params: { url: item.url } })}
            activeOpacity={0.9}
          >
            <Image source={{ uri: getYouTubeThumbnail(item.url) }} style={styles.thumb} />
            <Text style={styles.videoTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    marginBottom: 20,
    backgroundColor: "#FDF2FF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  thumb: {
    width: "100%",
    height: 200,
    backgroundColor: "#ccc",
  },
  videoTitle: {
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
