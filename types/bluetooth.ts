// types/bluetooth.ts
export interface AlertData {
  type: string;
  device: string;
  timestamp: number;
  battery: number;
  location: string;
}

export interface AvailableDevice {
  id: string;
  name: string;
  rssi: number;
  device: import('react-native-ble-plx').Device;
}

export interface PairedDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  deviceToken?: string;
}

export interface NotificationSettings {
  sms: boolean;
  email: boolean;
  push: boolean;
  call: boolean;
}

export interface UserEmergencyConfig {
  emergencyContacts: EmergencyContact[];
  autoCallEmergency: boolean;
  emergencyNumber: string;
  sendLocation: boolean;
  notificationSettings: NotificationSettings;
}

export interface NotificationData {
  alertId: string;
  message: string;
  timestamp: string;
  contacts: EmergencyContact[];
  settings: NotificationSettings;
}

export interface AlertRecord {
  userId: string;
  deviceId: string;
  alertType: string;
  timestamp: Date;
  deviceTimestamp: number;
  battery: number;
  location: string;
  processed: boolean;
  resolved: boolean;
  createdAt: Date;
  notificationsSent: string[];
  emergencyServices: {
    contacted: boolean;
    contactedAt: Date | null;
    serviceType: string | null;
  };
}

// Constantes BLE
export const BLE_CONSTANTS = {
  SERVICE_UUID: "12345678-1234-1234-1234-123456789abc",
  ALERT_CHAR_UUID: "12345678-1234-1234-1234-123456789abd",
  STATUS_CHAR_UUID: "12345678-1234-1234-1234-123456789abe",
  DEVICE_NAME: "SmartWatch"
} as const;