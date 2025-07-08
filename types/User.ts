export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface UserData {
  uid: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  emergencyContacts: EmergencyContact[];
}

export interface UserState extends UserData {
  setUser: (data: Partial<UserData>) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  clearUser: () => void;
}
