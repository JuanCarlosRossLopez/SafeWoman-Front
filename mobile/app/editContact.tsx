import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EditContact() {
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
        <View style={styles.leftHeader}>
    <Image
      source={require('@/assets/images/iconoSW.png')}
      style={styles.logo}
    />
    <Text style={styles.titleText}>Safewoman</Text>
  </View>

  <Ionicons name="settings-outline" size={28} color="black" />
</View>

      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#A020F0" />
      </TouchableOpacity>

        <Image
            source={require('@/assets/images/perfil.png')}
            style={styles.profileImage} 
        />

      <TextInput placeholder="Nombre" style={styles.input} placeholderTextColor="#999" value='Maria'/>
      <TextInput placeholder="Número" style={styles.input} placeholderTextColor="#999" keyboardType="phone-pad" value='99882223' />

      <Text style={styles.savedLabel}>Números guardados</Text>

      <View style={styles.savedContact}>
        <Ionicons name="person-circle-outline" size={32} color="gray" />
        <View style={{ marginLeft: 10 }}>
          <Text>Esposo</Text>
          <Text style={{ color: 'gray', fontSize: 12 }}>9986321457</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="gray" style={{ marginLeft: 'auto' }} />
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.addText}>Agregar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton2}>
                <Text style={styles.addButtonText}>Actualizar</Text>
              </TouchableOpacity>
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
    marginTop:22
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 10,
  },
  addButton2: { marginTop: 10, backgroundColor: '#B109C7', padding: 10, borderRadius: 8, alignItems: 'center' ,color:'#'},
    addButtonText: { color: '#fff', fontWeight: 'bold' },
  profileImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 20,
    tintColor: 'gray',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
    fontSize: 16,
    padding: 8,
  },
  savedLabel: {
    color: '#A020F0',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  savedContact: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A020F0',
  }, 
    leftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    }, 
});
