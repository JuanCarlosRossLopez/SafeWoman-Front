import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

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
    <View style={styles.container}>
      {/* Background decorative elements */}
      <View style={styles.backgroundDecoration1} />
      <View style={styles.backgroundDecoration2} />
      
      <View style={styles.contentSection}>
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="videocam" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Contenido Educativo</Text>
              <Text style={styles.sectionSubtitle}>Videos de seguridad y prevención</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: featuredContent.image }} style={styles.cardImage} />
            <View style={styles.infoOverlay}>
              <View style={styles.videoCountBadge}>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.videoCountText}>10+ Videos</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{featuredContent.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>Educativo</Text>
              </View>
            </View>
            
            <Text style={styles.cardDescription}>{featuredContent.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                  <Text style={styles.featureText}>Técnicas de defensa</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="bulb" size={16} color="#F59E0B" />
                  <Text style={styles.featureText}>Tips de prevención</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.button} onPress={handleGoToVideos} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Explorar</Text>
                <View style={styles.buttonIcon}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 20,
  },
  
  // Background decorative elements
  backgroundDecoration1: {
    position: 'absolute',
    top: -20,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(177, 9, 199, 0.05)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(177, 9, 199, 0.03)',
  },

  contentSection: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // Header section
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Card section
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  
  // Image section
  imageContainer: {
    position: 'relative',
    width: "100%",
    height: 220,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: 'cover',
  },
  infoOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  videoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(177, 9, 199, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  videoCountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Content section
  cardContent: {
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    fontWeight: '400',
  },

  // Footer section
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  featuresContainer: {
    flex: 1,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  button: {
    backgroundColor: "#B109C7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#B109C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
});
