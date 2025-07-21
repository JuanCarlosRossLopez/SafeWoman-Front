import { auth, db } from '@/services/firebase-config';
import { useUserStore } from '@/store/userStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BleManager, Characteristic, Device, BleRestoredState } from 'react-native-ble-plx';
import { AppState } from 'react-native';

// Interfaces para TypeScript
interface AlertData {
  type: string;
  device: string;
  timestamp: number;
  battery: number;
  location: string;
}

interface AvailableDevice {
  id: string;
  name: string;
  rssi: number;
  device: Device;
}

interface PairedDevice {
  id: string;
  name: string;
  connected: boolean;
}

// UUIDs del ESP32 (deben coincidir con los del código Arduino)
const SERVICE_UUID = "12345678-1234-1234-1234-123456789abc";
const ALERT_CHAR_UUID = "12345678-1234-1234-1234-123456789abd";
const STATUS_CHAR_UUID = "12345678-1234-1234-1234-123456789abe";

const ConnectScreen: React.FC = () => {
  const bleManagerRef = useRef<BleManager | null>(null);

  if (!bleManagerRef.current) {
    bleManagerRef.current = new BleManager({
      restoreStateIdentifier: 'safeWomanBle',
      restoreStateFunction: (restoredState: BleRestoredState | null) => {
        if (restoredState?.connectedPeripherals?.length) {
          console.log('🔄 Restaurando estado BLE…');
          restoredState.connectedPeripherals.forEach((device: Device) => {
            setConnectedDevice(device);
            subscribeToAlerts(device);
            subscribeToStatus(device);
          });
        }
      },
    });
  }

  const bleManager = bleManagerRef.current!;
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [availableDevices, setAvailableDevices] = useState<AvailableDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Desconectado');
  const [autoReconnect, setAutoReconnect] = useState<boolean>(true);
  const [lastConnectedDeviceId, setLastConnectedDeviceId] = useState<string | null>(null);
  // ----  Estado de alerta y referencias para ubicación ----
  const [alertActive, setAlertActive] = useState(false);
  const alertActiveRef = useRef(alertActive);
  useEffect(() => { alertActiveRef.current = alertActive; }, [alertActive]);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { uid, emergencyContacts, name: userName } = useUserStore();

  useEffect(() => {
    initializeBLE();
    loadPairedDevices();
    requestPermissions(); // Solicitar permisos al inicio

    // Monitorear estado del Bluetooth
    const subscription = bleManager.onStateChange((state) => {
      console.log('📡 Estado Bluetooth cambió a:', state);
      if (state === 'PoweredOn' && autoReconnect && lastConnectedDeviceId) {
        console.log('🔄 Intentando reconexión automática...');
        setTimeout(() => attemptReconnection(), 2000);
      }
    });

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && autoReconnect && lastConnectedDeviceId && !connectedDevice) {
        attemptReconnection();
      }
    });

    return () => {
      subscription?.remove();
      bleManager.destroy();
      appStateSub.remove();
    };
  }, []);

  const requestPermissions = async (): Promise<void> => {
    try {
      console.log('🔐 Solicitando permisos...');

      // Solicitar permisos de ubicación (requerido para BLE en Android)
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'SafeWoman necesita permisos de ubicación para usar Bluetooth Low Energy. Por favor, activa los permisos en Configuración.',
          [
            { text: 'Configuración', onPress: () => Location.requestForegroundPermissionsAsync() },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return;
      }

      console.log('✅ Permisos de ubicación concedidos');

      // Para Android 12+ también necesitamos permisos específicos de Bluetooth
      if (Platform.OS === 'android') {
        console.log('📱 Solicitando permisos de Bluetooth para Android...');
        // Los permisos de Bluetooth se manejan automáticamente con la configuración del app.json
      }

    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      Alert.alert('Error', 'No se pudieron solicitar los permisos necesarios');
    }
  };
  const initializeBLE = async (): Promise<void> => {
    try {
      console.log('🔧 Inicializando BLE...');

      // Verificar estado del Bluetooth
      const state = await bleManager.state();
      console.log('📡 Estado del Bluetooth:', state);

      if (state === 'PoweredOn') {
        console.log('✅ Bluetooth está listo');
      } else if (state === 'PoweredOff') {
        Alert.alert(
          'Bluetooth desactivado',
          'Por favor activa el Bluetooth en tu dispositivo',
          [
            { text: 'OK', onPress: () => console.log('Usuario notificado sobre Bluetooth') }
          ]
        );
      } else if (state === 'Unauthorized') {
        Alert.alert(
          'Permisos de Bluetooth requeridos',
          'SafeWoman necesita permisos de Bluetooth para funcionar. Por favor, otorga los permisos en la configuración del dispositivo.',
          [
            { text: 'Solicitar permisos', onPress: () => requestPermissions() },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      } else {
        console.log('⚠️ Estado de Bluetooth:', state);
        Alert.alert(
          'Bluetooth no disponible',
          `Estado actual: ${state}\nVerifica que tu dispositivo soporte Bluetooth Low Energy`
        );
      }

    } catch (error) {
      console.error('❌ Error inicializando BLE:', error);
      Alert.alert('Error', 'Error inicializando Bluetooth: ' + error);
    }
  };

  const loadPairedDevices = async (): Promise<void> => {
    // Simulamos algunos dispositivos emparejados previamente
    setPairedDevices([
      { id: '1', name: 'Pulsera SafeWoman 1', connected: false },
      { id: '2', name: 'Pulsera SafeWoman 2', connected: false }
    ]);
  };

  const startScanning = async (): Promise<void> => {
    if (isScanning) return;

    // 🚦 Verificar que Bluetooth esté encendido antes de escanear
    const bleState = await bleManager.state();
    if (bleState !== 'PoweredOn') {
      Alert.alert(
        'Bluetooth apagado',
        'Por favor, enciende el Bluetooth para buscar pulseras',
        [{ text: 'OK' }]
      );
      return;
    }

    // Verificar permisos antes de escanear
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Se necesitan permisos de ubicación para escanear dispositivos Bluetooth',
        [
          { text: 'Solicitar permisos', onPress: () => requestPermissions() },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    setIsScanning(true);
    setAvailableDevices([]);

    console.log('🔍 Iniciando escaneo...');

    try {
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('❌ Error escaneando:', error);
          setIsScanning(false);

          // Manejar errores específicos
          if (error.message.includes('not authorized')) {
            Alert.alert(
              'Permisos de Bluetooth requeridos',
              'La aplicación necesita permisos para usar Bluetooth. Por favor, acepta los permisos cuando aparezcan o actívalos manualmente en Configuración > Apps > SafeWoman > Permisos.',
              [
                { text: 'Reintentar', onPress: () => startScanning() },
                { text: 'Ir a configuración', onPress: () => {
                  // En una app real, aquí abrirías la configuración
                  Alert.alert('Configuración', 'Ve a Configuración > Apps > SafeWoman > Permisos y activa Ubicación y Dispositivos cercanos');
                }},
                { text: 'Cancelar', style: 'cancel' }
              ]
            );
          } else {
            Alert.alert('Error de escaneo', error.message || 'No se pudo iniciar el escaneo');
          }
          return;
        }

        if (device && device.name) {
          console.log(`📱 Dispositivo encontrado: ${device.name} - ID: ${device.id} - RSSI: ${device.rssi}`);

          // Mostrar TODOS los dispositivos BLE primero para debug
          console.log(`🔧 Debug - Servicios: ${device.serviceUUIDs?.join(', ') || 'Sin servicios'}`);

          // Buscar dispositivos SmartWatch (más permisivo)
          if (device.name === 'SmartWatch') {
            console.log(`✅ SmartWatch encontrado: ${device.name}`);

            setAvailableDevices(prev => {
              const exists = prev.find(d => d.id === device.id);
              if (!exists) {
                return [...prev, {
                  id: device.id,
                  name: device.name || 'SmartWatch',
                  rssi: device.rssi || 0,
                  device: device
                }];
              }
              return prev;
            });
          } else {
            // Log de otros dispositivos para debug
            console.log(`📋 Otro dispositivo: ${device.name}`);
          }
        } else if (device) {
          // Dispositivos sin nombre
          console.log(`📱 Dispositivo sin nombre encontrado - ID: ${device.id} - RSSI: ${device.rssi}`);
        }
      });

      // Detener escaneo después de 15 segundos (más tiempo)
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
        console.log('🛑 Escaneo detenido automáticamente después de 15 segundos');
      }, 15000);

    } catch (error) {
      console.error('❌ Error iniciando escaneo:', error);
      setIsScanning(false);
      Alert.alert('Error', 'No se pudo iniciar el escaneo Bluetooth');
    }
  };

  const connectToDevice = async (deviceToConnect: AvailableDevice): Promise<void> => {
    try {
      setConnectionStatus('Conectando...');
      console.log(`🔗 Conectando a: ${deviceToConnect.name}`);

      // Detener escaneo si está activo
      if (isScanning) {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }

      // Conectar al dispositivo con timeout
      const device = await bleManager.connectToDevice(deviceToConnect.id, {
        timeout: 10000,
        autoConnect: true, // Habilitar auto-reconexión
        refreshGatt: 'OnConnected'
      });
      console.log('✅ Dispositivo conectado');

      // Descubrir servicios
      await device.discoverAllServicesAndCharacteristics();
      console.log('✅ Servicios descubiertos');

      setConnectedDevice(device);
      setConnectionStatus('Conectado y vinculado');
      setLastConnectedDeviceId(device.id);

      // Suscribirse a notificaciones de alerta
      await subscribeToAlerts(device);

      // Suscribirse a notificaciones de estado
      await subscribeToStatus(device);

      // Monitorear desconexiones
      device.onDisconnected((error, disconnectedDevice) => {
        console.log('📱 Dispositivo desconectado:', disconnectedDevice?.id);
        if (error) {
          console.log('❌ Error de desconexión:', error);
        }

        setConnectedDevice(null);
        setConnectionStatus('Desconectado');

        // Intentar reconexión automática
        if (autoReconnect) {
          console.log('🔄 Programando reconexión automática en 3 segundos...');
          setTimeout(() => attemptReconnection(), 3000);
        }
      });

      Alert.alert('✅ Conexión exitosa', `Conectado y vinculado a ${device.name || 'SmartWatch'}`);

      // Actualizar dispositivos emparejados
      updatePairedDevices(device);

    } catch (error) {
      console.error('❌ Error conectando:', error);
      setConnectionStatus('Error de conexión');
      Alert.alert('❌ Error', 'No se pudo conectar al dispositivo');
    }
  };

  const attemptReconnection = async (): Promise<void> => {
    if (!lastConnectedDeviceId || connectedDevice) return;

    console.log('🔄 Intentando reconexión automática...');
    setConnectionStatus('Reconectando...');

    try {
      // Buscar dispositivo conocido
      const knownDevices = await bleManager.connectedDevices([SERVICE_UUID]);
      const targetDevice = knownDevices.find(d => d.id === lastConnectedDeviceId);

      if (targetDevice) {
        console.log('✅ Dispositivo encontrado en lista de conectados');
        await connectToKnownDevice(targetDevice);
      } else {
        console.log('🔍 Dispositivo no encontrado, iniciando escaneo...');
        await startScanningForReconnection();
      }
    } catch (error) {
      console.error('❌ Error en reconexión automática:', error);
      setConnectionStatus('Error de reconexión');
    }
  };

  const connectToKnownDevice = async (device: Device): Promise<void> => {
    try {
      await device.connect();
      await device.discoverAllServicesAndCharacteristics();

      setConnectedDevice(device);
      setConnectionStatus('Reconectado');

      await subscribeToAlerts(device);
      await subscribeToStatus(device);

      console.log('✅ Reconexión exitosa');
    } catch (error) {
      console.error('❌ Error en reconexión:', error);
      throw error;
    }
  };

  const startScanningForReconnection = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        bleManager.stopDeviceScan();
        reject(new Error('Timeout en escaneo de reconexión'));
      }, 10000);

      bleManager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
        if (error) {
          console.error('❌ Error en escaneo de reconexión:', error);
          clearTimeout(timeout);
          reject(error);
          return;
        }

        if (device && device.id === lastConnectedDeviceId) {
          bleManager.stopDeviceScan();
          clearTimeout(timeout);

          try {
            await connectToKnownDevice(device);
            resolve();
          } catch (connectError) {
            reject(connectError);
          }
        }
      });
    });
  };

  const subscribeToAlerts = async (device: Device): Promise<void> => {
    try {
      console.log('🔔 Suscribiendo a alertas...');

      device.monitorCharacteristicForService(
        SERVICE_UUID,
        ALERT_CHAR_UUID,
        (error, characteristic: Characteristic | null) => {
          if (error) {
            console.error('❌ Error monitoreando alertas:', error);
            return;
          }

          if (characteristic?.value) {
            try {
              // Decodificar Base64
              const decodedValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              console.log('📨 Mensaje recibido:', decodedValue);

              // Verificar si es una alerta de emergencia
              if (decodedValue === "EMERGENCY_ALERT") {
                console.log('🚨 Alerta de emergencia detectada!');
                handleEmergencyAlert();
              } else {
                // Intentar parsear como JSON (por compatibilidad)
                try {
                  const alertData: AlertData = JSON.parse(decodedValue);
                  console.log('🚨 Alerta JSON recibida:', alertData);
                  handleEmergencyAlert(alertData);
                } catch (parseError) {
                  // Si no es JSON, tratar como alerta simple
                  console.log('📢 Mensaje simple recibido:', decodedValue);
                  handleEmergencyAlert();
                }
              }
            } catch (decodeError) {
              console.error('❌ Error decodificando mensaje:', decodeError);
              // Mostrar alerta genérica
              handleEmergencyAlert();
            }
          }
        }
      );

      console.log('✅ Suscrito a alertas');
    } catch (error) {
      console.error('❌ Error suscribiendo a alertas:', error);
    }
  };

  const subscribeToStatus = async (device: Device): Promise<void> => {
    try {
      console.log('📊 Suscribiendo a estado...');

      device.monitorCharacteristicForService(
        SERVICE_UUID,
        STATUS_CHAR_UUID,
        (error, characteristic: Characteristic | null) => {
          if (error) {
            console.error('❌ Error monitoreando estado:', error);
            return;
          }

          if (characteristic?.value) {
            try {
              const decodedStatus = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              console.log('📱 Estado recibido:', decodedStatus);

              // Actualizar estado de conexión
              switch (decodedStatus) {
                case 'connected':
                  setConnectionStatus('Conectado y vinculado');
                  break;
                case 'alert_sent':
                  setConnectionStatus('Alerta enviada');
                  break;
                case 'heartbeat':
                  setConnectionStatus('Conectado - Activo ❤️');
                  console.log('💓 Heartbeat recibido - Conexión estable');
                  break;
                default:
                  setConnectionStatus(decodedStatus);
              }
            } catch (parseError) {
              console.error('❌ Error parseando estado:', parseError);
            }
          }
        }
      );

      console.log('✅ Suscrito a estado');
    } catch (error) {
      console.error('❌ Error suscribiendo a estado:', error);
    }
  };

  const handleEmergencyAlert = (alertData?: AlertData): void => {
    console.log('🚨 Procesando alerta de emergencia');

    // Obtener información actual
    const currentTime = new Date().toLocaleString();
    const deviceName = connectedDevice?.name || 'SmartWatch';

    // Mostrar alerta principal
    Alert.alert(
      '🚨 ALERTA DE EMERGENCIA',
      `¡Se ha activado una alerta de emergencia!

📱 Dispositivo: ${deviceName}
⏰ Hora: ${currentTime}
${alertData ? `🔋 Batería: ${alertData.battery}%` : ''}

¿Estás bien?`,
      [
        {
          text: 'Falsa alarma',
          style: 'cancel',
          onPress: () => {
            console.log('✅ Alerta cancelada por el usuario');
            Alert.alert('✅ Cancelado', 'Alerta marcada como falsa alarma');
          }
        },
        {
          text: 'Necesito ayuda',
          style: 'destructive',
          onPress: () => {
            console.log('🆘 Usuario confirmó emergencia');
            processEmergency(deviceName, currentTime);
          }
        }
      ],
      { cancelable: false }
    );
  };

  const processEmergency = async (deviceName: string, timestamp: string): Promise<void> => {
    // Aquí la app procesará la emergencia
    const { status } = await Location.getForegroundPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'No podemos obtener tu ubicación sin permisos'
      );
      setAlertActive(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
    });

    if (uid) {
      await updateDoc(doc(db, 'users', uid), {
        alertaActiva: true,
        createdAt: new Date(),
        'location.latitude': location.coords.latitude,
        'location.longitude': location.coords.longitude,
        'location.timestamp': new Date(),
      });
    }

    locationIntervalRef.current = setInterval(updateLocation, 15000);
    
    try {
      if (emergencyContacts && emergencyContacts.length > 0) {
        const currentUser = auth.currentUser;
        const idToken = currentUser ? await currentUser.getIdToken() : null;

        // await fetch('https://safewoman-api.vercel.app/api/sms-alert', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        //   },
        //   body: JSON.stringify({
        //     latitude: location.coords.latitude,
        //     longitude: location.coords.longitude,
        //     contacts: emergencyContacts,
        //     name: userName || undefined,
        //   }),
        // });
        console.log("Alerta enviada");
      } else {
        console.log('No se encontraron contactos de emergencia para enviar SMS');
      }
    } catch (apiErr) {
      console.error('Error al enviar alerta SMS:', apiErr);
    }

    // --- Definir función updateLocation ---
    async function updateLocation() {
      if (!alertActiveRef.current || !uid) return;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        await updateDoc(doc(db, 'users', uid), {
          'location.latitude': loc.coords.latitude,
          'location.longitude': loc.coords.longitude,
          'location.timestamp': new Date(),
        });
      } catch (e) {
        console.error('Error actualización ubicación:', e);
      }
    }
  };

  const updatePairedDevices = (device: Device): void => {
    setPairedDevices(prev => {
      const exists = prev.find(d => d.id === device.id);
      if (!exists) {
        return [...prev, {
          id: device.id,
          name: device.name || 'SmartWatch',
          connected: true
        }];
      }
      return prev.map(d =>
        d.id === device.id ? { ...d, connected: true } : d
      );
    });
  };

  const disconnectDevice = async (): Promise<void> => {
    if (connectedDevice) {
      try {
        console.log('🔌 Desconectando dispositivo...');
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setConnectionStatus('Desconectado');

        // Actualizar estado de dispositivos emparejados
        setPairedDevices(prev =>
          prev.map(d => ({ ...d, connected: false }))
        );

        console.log('✅ Dispositivo desconectado');
      } catch (error) {
        console.error('❌ Error desconectando:', error);
      }
    }
  };

  const renderAvailableDevice = ({ item }: { item: AvailableDevice }) => (
    <TouchableOpacity
      style={styles.braceletCard}
      onPress={() => connectToDevice(item)}
    >
      <MaterialCommunityIcons name="watch-variant" size={24} color="#444" />
      <View style={styles.deviceInfo}>
        <Text style={styles.braceletText}>{item.name}</Text>
        <Text style={styles.rssiText}>Señal: {item.rssi} dBm</Text>
      </View>
      <Ionicons name="add-circle-outline" size={20} color="#6c4ee3" />
    </TouchableOpacity>
  );

  const renderPairedDevice = ({ item }: { item: PairedDevice }) => (
    <TouchableOpacity
      style={[styles.braceletCard, item.connected && styles.connectedCard]}
      onPress={item.connected ? disconnectDevice : () => {}}
    >
      <MaterialCommunityIcons name="watch-variant" size={24} color="#444" />
      <View style={styles.deviceInfo}>
        <Text style={styles.braceletText}>{item.name}</Text>
        <Text style={styles.statusText}>
          {item.connected ? connectionStatus : 'Desconectado'}
        </Text>
      </View>
      <Ionicons
        name={item.connected ? "checkmark-circle" : "settings-outline"}
        size={20}
        color={item.connected ? "#4CAF50" : "#444"}
      />
    </TouchableOpacity>
  );

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
        <TouchableOpacity onPress={disconnectDevice}>
          <Ionicons name="settings-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Conecta tu pulsera</Text>
        <TouchableOpacity
          style={[
            styles.bluetoothButton,
            connectedDevice && styles.connectedButton,
            isScanning && styles.scanningButton
          ]}
          onPress={startScanning}
          disabled={isScanning}
        >
          <Ionicons
            name={isScanning ? "sync" : connectedDevice ? "bluetooth" : "bluetooth-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Estado de conexión */}
      {connectedDevice && (
        <View style={styles.statusContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.statusLabel}>Estado: {connectionStatus}</Text>
        </View>
      )}

      {/* Indicador de reconexión automática */}
      {autoReconnect && !connectedDevice && lastConnectedDeviceId && (
        <View style={styles.reconnectContainer}>
          <Ionicons name="sync" size={20} color="#FF9800" />
          <Text style={styles.reconnectLabel}>
            Reconexión automática habilitada
          </Text>
          <TouchableOpacity
            onPress={() => setAutoReconnect(false)}
            style={styles.disableButton}
          >
            <Text style={styles.disableButtonText}>Desactivar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Información de debug mejorada */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          🔍 Estado: {isScanning ? 'Escaneando...' : 'Listo'}
        </Text>
        <Text style={styles.debugText}>
          📱 Conectado: {connectedDevice ? `Sí (${connectedDevice.name})` : 'No'}
        </Text>
        <Text style={styles.debugText}>
          📊 Dispositivos encontrados: {availableDevices.length}
        </Text>
        <Text style={styles.debugText}>
          🕒 Última búsqueda: {isScanning ? 'En progreso...' : 'Completada'}
        </Text>
        <TouchableOpacity
          onPress={requestPermissions}
          style={styles.permissionsButton}
        >
          <Text style={styles.permissionsButtonText}>🔐 Verificar permisos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.subTitle}>Pulseras emparejadas</Text>
        {pairedDevices.length > 0 ? (
          <FlatList
            data={pairedDevices}
            renderItem={renderPairedDevice}
            keyExtractor={(item: PairedDevice) => item.id}
            style={styles.deviceList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="watch" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No hay pulseras emparejadas</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.sectionContainer}>
        <View style={styles.availableHeader}>
          <Text style={styles.subTitle}>Pulseras disponibles</Text>
          <TouchableOpacity onPress={startScanning} disabled={isScanning}>
            <Text style={[styles.searchLink, isScanning && styles.searchLinkDisabled]}>
              {isScanning ? 'Buscando...' : 'Buscar pulseras'}
            </Text>
          </TouchableOpacity>
        </View>

        {availableDevices.length > 0 ? (
          <FlatList
            data={availableDevices}
            renderItem={renderAvailableDevice}
            keyExtractor={(item: AvailableDevice) => item.id}
            style={styles.deviceList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            {isScanning ? (
              <>
                <Ionicons name="bluetooth-outline" size={48} color="#6c4ee3" />
                <Text style={styles.emptyText}>Buscando pulseras...</Text>
                <Text style={styles.emptySubText}>
                  Asegúrate de que tu ESP32 esté encendido
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="bluetooth-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  No se encontraron pulseras disponibles
                </Text>
                <Text style={styles.emptySubText}>
                  Presiona "Buscar pulseras" para escanear
                </Text>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Instrucciones */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="information-circle-outline" size={20} color="#666" />
        <View style={styles.instructionsText}>
          <Text style={styles.instructionTitle}>Para probar la alerta:</Text>
          <Text style={styles.instructionStep}>1. Conecta tu pulsera</Text>
          <Text style={styles.instructionStep}>2. Presiona el botón 3 veces seguidas</Text>
          <Text style={styles.instructionStep}>3. La app mostrará la alerta de emergencia</Text>
        </View>
      </View>
    </View>
  );
};

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
    padding: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  connectedButton: {
    backgroundColor: '#4CAF50',
  },
  scanningButton: {
    backgroundColor: '#FF9800',
  },
  statusContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a2d',
    marginLeft: 8,
  },
  reconnectContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  reconnectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e65100',
    marginLeft: 8,
    flex: 1,
  },
  disableButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disableButtonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  debugInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  permissionsButton: {
    backgroundColor: '#6c4ee3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  permissionsButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
  },
  braceletCard: {
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  connectedCard: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  braceletText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  rssiText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '500',
  },
  deviceList: {
    maxHeight: 250,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: '#A020F0',
    marginVertical: 20,
    borderRadius: 1,
  },
  availableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchLink: {
    color: '#6c4ee3',
    fontWeight: '600',
    fontSize: 14,
  },
  searchLinkDisabled: {
    color: '#ccc',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  instructionsText: {
    marginLeft: 10,
    flex: 1,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  instructionStep: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default ConnectScreen;