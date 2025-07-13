/*import React, { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  Button, 
  Alert, 
  Platform,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity
} from "react-native";
import { BleManager } from "react-native-ble-plx";


// 🔧 Configuración BLE
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const ALERT_CHAR_UUID = "12345678-1234-1234-1234-123456789abd";
const STATUS_CHAR_UUID = "12345678-1234-1234-1234-123456789abe";

const manager = new BleManager();

export default function SmartWatchApp() {
  // 📱 Estados BLE
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("Desconectado");
  const [isConnected, setIsConnected] = useState(false);
  
  // 🚨 Estados para alertas
  const [alerts, setAlerts] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [lastHeartbeat, setLastHeartbeat] = useState(null);

  // 🔐 Permisos al iniciar
  // 🔐 Permisos al iniciar (solo una vez)
useEffect(() => {
  initBluetooth();
  
  // Cleanup global al desmontar el componente
  return () => {
    manager.destroy();
  };
}, []); // Solo se ejecuta una vez al montar

// 🔌 Cleanup de conexión cuando cambia connectedDevice
useEffect(() => {
  return () => {
    if (connectedDevice) {
      connectedDevice.cancelConnection();
    }
  };
}, [connectedDevice]); // Se ejecuta cuando connectedDevice cambia

  // 📡 Inicializar Bluetooth
  const initBluetooth = async () => {
    if (Platform.OS === "android") {
      await Permissions.askAsync(Permissions.LOCATION);
    }
    
    const state = await manager.state();
    if (state !== 'PoweredOn') {
      Alert.alert("Bluetooth", "Por favor activa el Bluetooth");
    }
  };

  // 🔍 Escanear y conectar SmartWatch
  const scanAndConnect = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setDeviceStatus("Buscando SmartWatch...");
    
    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.error("Error escaneando:", error);
        setIsScanning(false);
        setDeviceStatus("Error de escaneo");
        return;
      }

      // Buscar nuestro SmartWatch
      if (device?.name === "SmartWatch") {
        manager.stopDeviceScan();
        setIsScanning(false);
        
        try {
          console.log("📱 SmartWatch encontrado, conectando...");
          
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          
          setConnectedDevice(connected);
          setIsConnected(true);
          setDeviceStatus("Conectado");
          
          // Configurar listeners para notificaciones
          setupNotificationListeners(connected);
          
          Alert.alert("✅ Conectado", "SmartWatch conectado exitosamente");
          
        } catch (e) {
          console.error("Error conectando:", e);
          Alert.alert("Error de conexión", e.message);
          setDeviceStatus("Error de conexión");
        }
      }
    });

    // Timeout de escaneo (15 segundos)
    setTimeout(() => {
      if (isScanning) {
        manager.stopDeviceScan();
        setIsScanning(false);
        if (!isConnected) {
          setDeviceStatus("SmartWatch no encontrado");
          Alert.alert("Timeout", "No se encontró el SmartWatch. Asegúrate de que esté encendido.");
        }
      }
    }, 15000);
  };

  // 📡 Configurar listeners para notificaciones BLE
  const setupNotificationListeners = async (device) => {
    try {
      // Listener para alerts
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        ALERT_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Error monitoreando alerts:", error);
            return;
          }
          
          if (characteristic?.value) {
            const alertData = Buffer.from(characteristic.value, 'base64').toString();
            handleNewAlert(alertData);
          }
        }
      );

      // Listener para status
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Error monitoreando status:", error);
            return;
          }
          
          if (characteristic?.value) {
            const status = Buffer.from(characteristic.value, 'base64').toString();
            handleStatusUpdate(status);
          }
        }
      );

      console.log("✅ Listeners configurados");
      
    } catch (error) {
      console.error("Error configurando listeners:", error);
    }
  };

  // 🚨 Manejar nueva alerta
  const handleNewAlert = (alertDataString) => {
    if (!alertsEnabled) return;
    
    try {
      const alertData = JSON.parse(alertDataString);
      
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        device: alertData.device || "SmartWatch",
        type: alertData.type || "emergency",
        battery: alertData.battery || "N/A",
        location: alertData.location || "Desconocida",
        message: "🚨 ¡ALERTA DE EMERGENCIA ACTIVADA!"
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Mantener 20 alertas máximo
      
      // Mostrar notificación urgente
      Alert.alert(
        "🚨 EMERGENCIA",
        `${newAlert.message}\n\nDispositivo: ${newAlert.device}\nHora: ${newAlert.timestamp}\nBatería: ${newAlert.battery}%`,
        [
          { text: "Entendido", style: "default" },
          { text: "Ver Historial", onPress: () => console.log("Ver historial") }
        ]
      );
      
      console.log("🚨 Nueva alerta recibida:", newAlert);
      
    } catch (error) {
      console.error("Error procesando alerta:", error);
    }
  };

  // 📊 Manejar actualizaciones de estado
  const handleStatusUpdate = (status) => {
    console.log("📊 Status update:", status);
    
    switch (status) {
      case "connected":
        setDeviceStatus("Conectado y activo");
        break;
      case "alert_sent":
        setDeviceStatus("Alerta enviada");
        break;
      case "heartbeat":
        setLastHeartbeat(new Date().toLocaleTimeString());
        break;
      default:
        setDeviceStatus(status);
    }
  };

  // 🔌 Desconectar dispositivo
  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setIsConnected(false);
        setDeviceStatus("Desconectado");
        setLastHeartbeat(null);
        Alert.alert("Desconectado", "SmartWatch desconectado");
      } catch (error) {
        console.error("Error desconectando:", error);
      }
    }
  };

  // 🧹 Limpiar historial de alertas
  const clearAlerts = () => {
    Alert.alert(
      "Limpiar Historial",
      "¿Estás seguro de que quieres eliminar todas las alertas?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpiar", style: "destructive", onPress: () => setAlerts([]) }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
     
      <View style={styles.header}>
        <Text style={styles.title}>⌚ SmartWatch Monitor</Text>
        <Text style={styles.status}>
          {isConnected ? "🟢" : "🔴"} {deviceStatus}
        </Text>
        {lastHeartbeat && (
          <Text style={styles.heartbeat}>💓 Último heartbeat: {lastHeartbeat}</Text>
        )}
      </View>

      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Conexión Bluetooth</Text>
        
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={scanAndConnect}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? "🔍 Buscando..." : "📱 Conectar SmartWatch"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnectDevice}
          >
            <Text style={styles.buttonText}>🔌 Desconectar</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.info}>
          {isConnected 
            ? "✅ SmartWatch conectado y monitoreando" 
            : "ℹ️ Presiona 3 veces el botón del SmartWatch para enviar alerta"
          }
        </Text>
      </View>

     
      <View style={styles.section}>
        <View style={styles.alertHeader}>
          <Text style={styles.sectionTitle}>🚨 Alertas de Emergencia</Text>
          <Switch
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
          />
        </View>

        <View style={styles.alertStats}>
          <Text style={styles.statText}>
            📊 Total de alertas: {alerts.length}
          </Text>
          {alerts.length > 0 && (
            <TouchableOpacity onPress={clearAlerts}>
              <Text style={styles.clearButton}>🗑️ Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {alerts.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <Text style={styles.noAlerts}>✅ No hay alertas de emergencia</Text>
            <Text style={styles.noAlertsSubtext}>
              Las alertas aparecerán aquí cuando se active el botón del SmartWatch
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={styles.alertItemHeader}>
                <Text style={styles.alertTime}>{alert.timestamp}</Text>
                <Text style={styles.alertBattery}>🔋 {alert.battery}%</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertDevice}>📱 {alert.device}</Text>
              <Text style={styles.alertLocation}>📍 {alert.location}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  status: {
    color: '#ecf0f1',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  heartbeat: {
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  connectButton: {
    backgroundColor: '#27ae60',
  },
  disconnectButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  alertStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  clearButton: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noAlerts: {
    textAlign: 'center',
    color: '#27ae60',
    fontSize: 18,
    fontWeight: '500',
  },
  noAlertsSubtext: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  alertItem: {
    backgroundColor: '#fff5f5',
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  alertItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  alertBattery: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: '500',
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c0392b',
    marginBottom: 8,
  },
  alertDevice: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  alertLocation: {
    fontSize: 13,
    color: '#7f8c8d',
  },
});*/