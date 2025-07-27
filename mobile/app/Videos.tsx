import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import CustomHeader from "@/components/CustomHeader";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const videos = [
  { 
    id: "1", 
    title: "Técnicas de DEFENSA personal para MUJERES", 
    url: "https://www.youtube.com/watch?v=BwAlO5UHgPA",
    duration: "12:45",
    category: "Defensa Personal",
    views: "45k"
  },
  { 
    id: "2", 
    title: "Defensa personal básica para mujeres", 
    url: "https://www.youtube.com/watch?v=5BPerBgoqVk",
    duration: "8:32",
    category: "Básico",
    views: "32k"
  },
  { 
    id: "3", 
    title: "Prevención y reacción ante acoso sexual", 
    url: "https://www.youtube.com/watch?v=F1ltAeahB28",
    duration: "15:20",
    category: "Prevención",
    views: "67k"
  },
  { 
    id: "4", 
    title: "Acciones de prevención al acoso sexual y hostigamiento", 
    url: "https://www.youtube.com/watch?v=gcnCEDVZzwg",
    duration: "10:15",
    category: "Prevención",
    views: "23k"
  },
  { 
    id: "5", 
    title: "Técnicas defensa personal femenina (Kickboxing)", 
    url: "https://www.youtube.com/watch?v=7pTIiN8N0iw",
    duration: "18:40",
    category: "Kickboxing",
    views: "89k"
  },
  { 
    id: "6", 
    title: "Prevención del acoso laboral y sexual", 
    url: "https://www.youtube.com/watch?v=COIkVgdqfq4",
    duration: "9:25",
    category: "Laboral",
    views: "15k"
  },
  { 
    id: "7", 
    title: "Los mejores tips de defensa personal para mujeres", 
    url: "https://www.youtube.com/watch?v=zx8wESDa9qY",
    duration: "14:10",
    category: "Tips",
    views: "76k"
  },
  { 
    id: "8", 
    title: "Krav Maga: defensa ante estrangulación", 
    url: "https://www.youtube.com/watch?v=uV7TZw2JAJ8",
    duration: "11:55",
    category: "Krav Maga",
    views: "54k"
  },
  { 
    id: "9", 
    title: "Prevención del acoso callejero a mujeres y niñas", 
    url: "https://www.youtube.com/watch?v=Jr36YrTJYY0",
    duration: "13:30",
    category: "Prevención",
    views: "38k"
  },
  { 
    id: "10", 
    title: "Protocolo acción ante acoso sexual en el trabajo", 
    url: "https://www.youtube.com/watch?v=sdK0q8_CN5U",
    duration: "16:20",
    category: "Protocolo",
    views: "29k"
  },
];

const getYouTubeThumbnail = (url: string) => {
  const videoId = url.split("v=")[1];
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "Defensa Personal": "#EF4444",
    "Básico": "#10B981", 
    "Prevención": "#F59E0B",
    "Kickboxing": "#8B5CF6",
    "Laboral": "#06B6D4",
    "Tips": "#F97316",
    "Krav Maga": "#DC2626",
    "Protocolo": "#6366F1"
  };
  return colors[category] || "#B109C7";
};

export default function AllVideos() {
  const router = useRouter();

  const renderVideoCard = ({ item }: { item: typeof videos[0] }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => router.push({ pathname: "/VideoPlayer", params: { url: item.url } })}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: getYouTubeThumbnail(item.url) }} 
          style={styles.thumbnail} 
        />
        
        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </View>
        
        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <View style={styles.videoHeader}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(item.category)}15` }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category}
            </Text>
          </View>
        </View>
        
        <View style={styles.videoStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{item.views} visualizaciones</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Videos Educativos" />
      
      {/* Header section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="videocam" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Biblioteca de Videos</Text>
              <Text style={styles.headerSubtitle}>{videos.length} videos educativos disponibles</Text>
            </View>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{videos.length}</Text>
          </View>
        </View>
      </View>
      
      <FlatList 
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header section
  headerSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B109C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  totalBadge: {
    backgroundColor: 'rgba(177, 9, 199, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    color: '#B109C7',
    fontSize: 16,
    fontWeight: '700',
  },

  // List container
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  separator: {
    height: 16,
  },

  // Video card
  videoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  // Thumbnail section
  thumbnailContainer: {
    position: 'relative',
    width: "100%",
    height: 220,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(177, 9, 199, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Video info section
  videoInfo: {
    padding: 20,
    gap: 12,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    lineHeight: 22,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Video stats
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
