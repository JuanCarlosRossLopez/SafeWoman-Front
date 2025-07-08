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
      setUser: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),
      setEmergencyContacts: (contacts) =>
        set({
          emergencyContacts: contacts,
        }),
      clearUser: () =>
        set({
          uid: null,
          name: null,
          email: null,
          phone: null,
          emergencyContacts: [],
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
