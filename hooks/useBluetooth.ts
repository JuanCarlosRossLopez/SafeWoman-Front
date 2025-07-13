// hooks/useBluetooth.ts
/*import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { AlertData,BLE_CONSTANTS,AvailableDevice,PairedDevice } from '../types/bluetooth';

//import FirebaseService from '../services/FirebaseService';

interface UseBluetoothReturn {
  connectedDevice: Device | null;
  availableDevices: AvailableDevice[];
  pairedDevices: PairedDevice[];
  isScanning: boolean;
  connectionStatus: string;
  startScanning: () => Promise<void>;
  connectToDevice: (device: AvailableDevice) => Promise<void>;
  disconnectDevice: () => Promise<void>;
}

export const useBluetooth = (userId: string): UseBluetoothReturn => {
  const [bleManager] = useState<BleManager>(new BleManager());
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [availableDevices, setAvailableDevices] = useState<AvailableDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Desconectado');

  useEffect(() => {
    initializeBLE();
    loadPairedDevices();

    return () => {
      bleManager.destroy();
    };
  }, []);

  const initializeBLE = async (): Promise<void> => {
    try {
      const state = await bleManager.state();
      if (state === 'PoweredOn') {
        console.log('✅ Bluetooth está listo');
      } else {
        Alert.alert('Bluetooth', 'Por favor activa el Bluetooth');
      }
    } catch (error) {
      console.error('Error inicializando BLE:', error);
    }
  };

  const loadPairedDevices = async (): Promise<void> => {
    // Cargar desde AsyncStorage o base de datos
    setPairedDevices([
      { id: '1', name: 'Pulsera 1', connected: false },
      { id: '2', name: 'Pulsera 2', connected: false }
    ]);
  };

  const startScanning = useCallback(async (): Promise<void> => {
    if (isScanning) return;
    
    setIsScanning(true);
    setAvailableDevices([]);
    
    try {
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Error escaneando:', error);
          setIsScanning(false);
          return;
        }

        if (device && 
            device.name === BLE_CONSTANTS.DEVICE_NAME && 
            device.serviceUUIDs?.includes(BLE_CONSTANTS.SERVICE_UUID)) {
          setAvailableDevices(prev => {
            const exists = prev.find(d => d.id === device.id);
            if (!exists) {
              return [...prev, {
                id: device.id,
                name: device.name || BLE_CONSTANTS.DEVICE_NAME,
                rssi: device.rssi || 0,
                device: device
              }];
            }
            return prev;
          });
        }
      });

      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }, 10000);

    } catch (error) {
      console.error('Error iniciando escaneo:', error);
      setIsScanning(false);
    }
  }, [isScanning, bleManager]);

  const subscribeToAlerts = useCallback(async (device: Device): Promise<void> => {
    try {
      device.monitorCharacteristicForService(
        BLE_CONSTANTS.SERVICE_UUID,
        BLE_CONSTANTS.ALERT_CHAR_UUID,
        (error, characteristic: Characteristic | null) => {
          if (error) {
            console.error('Error monitoreando alertas:', error);
            return;
          }
          
          if (characteristic?.value) {
            try {
              const decodedValue = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              const alertData: AlertData = JSON.parse(decodedValue);
              console.log('🚨 Alerta recibida:', alertData);
              
              handleEmergencyAlert(alertData);
            } catch (parseError) {
              console.error('Error parseando alerta:', parseError);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error suscribiendo a alertas:', error);
    }
  }, []);

  const subscribeToStatus = useCallback(async (device: Device): Promise<void> => {
    try {
      device.monitorCharacteristicForService(
        BLE_CONSTANTS.SERVICE_UUID,
        BLE_CONSTANTS.STATUS_CHAR_UUID,
        (error, characteristic: Characteristic | null) => {
          if (error) {
            console.error('Error monitoreando estado:', error);
            return;
          }
          
          if (characteristic?.value) {
            try {
              const decodedStatus = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              console.log('📱 Estado recibido:', decodedStatus);
              
              switch (decodedStatus) {
                case 'connected':
                  setConnectionStatus('Conectado');
                  break;
                case 'alert_sent':
                  setConnectionStatus('Alerta enviada');
                  break;
                case 'heartbeat':
                  setConnectionStatus('Conectado - Activo');
                  break;
                default:
                  setConnectionStatus(decodedStatus);
              }
            } catch (parseError) {
              console.error('Error parseando estado:', parseError);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error suscribiendo a estado:', error);
    }
  }, []);

  const handleEmergencyAlert = useCallback(async (alertData: AlertData): Promise<void> => {
    try {
      Alert.alert(
        '🚨 ALERTA DE EMERGENCIA',
        `Dispositivo: ${alertData.device}\nHora: ${new Date(alertData.timestamp).toLocaleTimeString()}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Procesar', 
            onPress: async () => {
              try {
                await FirebaseService.processEmergencyAlert(alertData, userId);
                Alert.alert('Éxito', 'Alerta procesada correctamente');
              } catch (error) {
                console.error('Error procesando alerta:', error);
                Alert.alert('Error', 'No se pudo procesar la alerta');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error manejando alerta:', error);
    }
  }, [userId]);

  const connectToDevice = useCallback(async (deviceToConnect: AvailableDevice): Promise<void> => {
    try {
      setConnectionStatus('Conectando...');
      
      const device = await bleManager.connectToDevice(deviceToConnect.id);
      await device.discoverAllServicesAndCharacteristics();
      
      setConnectedDevice(device);
      setConnectionStatus('Conectado');
      
      await subscribeToAlerts(device);
      await subscribeToStatus(device);
      
      Alert.alert('Conexión exitosa', `Conectado a ${device.name}`);
      
      // Actualizar dispositivos emparejados
      setPairedDevices(prev => {
        const exists = prev.find(d => d.id === device.id);
        if (!exists) {
          return [...prev, {
            id: device.id,
            name: device.name || BLE_CONSTANTS.DEVICE_NAME,
            connected: true
          }];
        }
        return prev.map(d => 
          d.id === device.id ? { ...d, connected: true } : d
        );
      });
      
    } catch (error) {
      console.error('Error conectando:', error);
      setConnectionStatus('Error de conexión');
      Alert.alert('Error', 'No se pudo conectar al dispositivo');
    }
  }, [bleManager, subscribeToAlerts, subscribeToStatus]);

  const disconnectDevice = useCallback(async (): Promise<void> => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setConnectionStatus('Desconectado');
        
        // Actualizar estado de dispositivos emparejados
        setPairedDevices(prev => 
          prev.map(d => ({ ...d, connected: false }))
        );
      } catch (error) {
        console.error('Error desconectando:', error);
      }
    }
  }, [connectedDevice]);

  return {
    connectedDevice,
    availableDevices,
    pairedDevices,
    isScanning,
    connectionStatus,
    startScanning,
    connectToDevice,
    disconnectDevice
  };
};*/