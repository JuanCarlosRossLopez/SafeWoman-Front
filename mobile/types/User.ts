export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export interface Location {
  latitude: number | null;
  longitude: number | null;
  timestamp: Date | null;
}

export interface UserData {
  uid: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  emergencyContacts: EmergencyContact[];
  alertActive: boolean;
  lastLocation: Location;
  logged: boolean;
}

export interface UserState extends UserData {
  setUser: (data: Partial<UserData>) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  setAlertActive: (active: boolean) => void;
  updateLocation: (location: Location) => void;
  clearUser: () => void;
}