import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CurrentStopState {
  currentStop: {
    id?: string;
    name: string;
  } | null;
  vehicleNumberFilters: string[];
  setCurrentStop: (stop: { id?: string; name: string; } | null) => void;
  setVehicleNumberFilters: (filters: string[]) => void;
  clearCurrentStop: () => void;
}

export const useCurrentStop = create<CurrentStopState>()(
  persist(
    (set) => ({
      currentStop: null,
      vehicleNumberFilters: [],
      setCurrentStop: (stop) => set({ currentStop: stop }),
      setVehicleNumberFilters: (filters) => set({ vehicleNumberFilters: filters }),
      clearCurrentStop: () => set({ currentStop: null, vehicleNumberFilters: [] }),
    }),
    {
      name: 'current-stop',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);