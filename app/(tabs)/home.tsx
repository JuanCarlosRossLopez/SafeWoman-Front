import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
    const contacts = [
    { id: '1', name: 'Esposo', phone: '9986321457' },
    { id: '2', name: 'Mamá', phone: '9986321457' },
  ];  
  return (
    <View style={styles.container}>

   <View style={styles.titleContainer}>
           <View style={styles.leftHeader}>
       <Image
         source={require('@/assets/images/iconoSW.png')}
         style={styles.logo}
       />
       <Text style={styles.title}>Safewoman</Text>
     </View>
   
     <Ionicons name="settings-outline" size={28} color="black" />
   </View>


      <View style={styles.userBox}>
       <Image source={require('../../assets/images/usericon.png')} style={styles.avatar} />
        <Text style={styles.greeting}>¡Hola!
          <Text style={{ fontWeight: 'bold' }}> Usuario</Text>
        </Text>
      </View>

      <View style={styles.contactsBox}>
        <Text style={styles.sectionTitle}>Tus contactos de emergencia</Text>
        {contacts.map(contact => (
          <View key={contact.id} style={styles.contactItem}>
            <Ionicons name="person-circle-outline" size={30} color="#aaa" />
            <View style={styles.contactText}>
              <Text style= {{fontSize:15,color:'#5F5F5F'}}>{contact.name}</Text>
              <Text style={{ fontSize: 15 ,color:'#5F5F5F' }}>{contact.phone}</Text>
            </View>
            <Ionicons name="create-outline" size={20} color="#aa55cc" style={styles.iconBtn} />
            <Ionicons name="close-circle-outline" size={20} color="red" style={styles.iconBtn} />
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={() => router.replace('/Register_Contact')}>
          <Text style={styles.addButtonText}>Agregar contacto</Text>
        </TouchableOpacity>
      </View>

     
      <View style={styles.videosSection}>
        <View style={styles.videoHeader}>
          <Text style={styles.sectionTitle}>Videos</Text>
          <Text style={{ color: '#666' }}>Ver más videos</Text>
        </View>
        <Image source={require('../../assets/images/mujerVideo.jpg')} style={styles.videoThumbnail} />
        <Text style={styles.videoCaption}>Como reaccionar ante una situación de riesgo</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, }, 
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',marginTop:22},
logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#B109C7' },
  userBox: { backgroundColor: '#f3d9f9', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginTop: 15 },
  avatar: { width: 75, height: 75, marginLeft:30,marginRight: 30 },
  greeting: { fontSize: 12 },
  contactsBox: { marginTop: 45, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#B109C7' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8, color:'#5F5F5F'},
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 , borderRadius:10,borderWidth:0.5, borderColor:'#D6D6D6'},
  contactText: { flex: 2, marginLeft: 8 },
  iconBtn: { marginHorizontal: 4 },
  addButton: { marginTop: 10, backgroundColor: '#B109C7', padding: 10, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  videosSection: { marginTop: 30 },
  videoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  videoThumbnail: { width: '100%', height: 160, borderRadius: 10 },
  videoCaption: { marginTop: 8, fontWeight: 'bold' },
  footerNav: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#ccc' },
  navItem: { alignItems: 'center' },
   titleContainer: {flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',marginBottom: 20,marginTop:22},
   leftHeader: {flexDirection: 'row',alignItems: 'center',}, 
});