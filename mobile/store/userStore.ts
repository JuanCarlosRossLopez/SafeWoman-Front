import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserState } from '../types/User';

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uid: null,
      name: null,
      email: null,
      phone: null,
      emergencyContacts: [],
      alertActive: false,
      lastLocation: {
        latitude: null,
        longitude: null,
        timestamp: null
      },
      logged: false,
      setUser: (data) => set((state) => ({ ...state, ...data })),
      setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
      setAlertActive: (active) => set({ alertActive: active }),
      updateLocation: (location) => set({ 
        lastLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp || new Date()
        }
      }),
      clearUser: () => set({
        uid: null,
        name: null,
        email: null,
        phone: null,
        emergencyContacts: [],
        alertActive: false,
        lastLocation: {
          latitude: null,
          longitude: null,
          timestamp: null
        },
        logged: false
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        uid: state.uid,
        name: state.name,
        email: state.email,
        phone: state.phone,
        emergencyContacts: state.emergencyContacts,
        alertActive: state.alertActive,
        lastLocation: state.lastLocation,
        logged: state.logged
      }),
    }
  )
);