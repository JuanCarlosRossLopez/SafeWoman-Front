import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ConnectScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.leftHeader}>
          <Image
            source={require('@/assets/images/safewoman.jpg')}
            style={styles.logo}
          />
          <Text style={styles.titleText}>Safewoman</Text>
        </View>
        <Ionicons name="settings-outline" size={28} color="black" />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Conecta tu pulsera</Text>
        <TouchableOpacity style={styles.bluetoothButton}>
          <Ionicons name="bluetooth" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>Pulseras emparejadas</Text>
      <View style={styles.braceletCard}>
        <MaterialCommunityIcons name="watch-variant" size={24} color="#444" />
        <Text style={styles.braceletText}>Pulsera 1</Text>
        <Ionicons name="settings-outline" size={20} color="#444" style={{ marginLeft: 'auto' }} />
      </View>
      <View style={styles.braceletCard}>
        <MaterialCommunityIcons name="watch-variant" size={24} color="#444" />
        <Text style={styles.braceletText}>Pulsera 2</Text>
        <Ionicons name="settings-outline" size={20} color="#444" style={{ marginLeft: 'auto' }} />
      </View>

      <View style={styles.divider} />

      <View style={styles.availableHeader}>
        <Text style={styles.subTitle}>Pulseras disponibles</Text>
        <TouchableOpacity>
          <Text style={styles.searchLink}>Buscar pulseras</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.braceletCard}>
        <MaterialCommunityIcons name="watch-variant" size={24} color="#444" />
        <Text style={styles.braceletText}>Pulsera 3</Text>
      </View>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A020F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bluetoothButton: {
    backgroundColor: '#0000ff',
    padding: 10,
    borderRadius: 20,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  braceletCard: {
    backgroundColor: '#f6f6f6',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  braceletText: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 2,
    backgroundColor: '#A020F0',
    marginVertical: 16,
  },
  availableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchLink: {
    color: '#6c4ee3',
    fontWeight: '500',
  },
});
