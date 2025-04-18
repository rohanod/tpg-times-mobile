import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VehiclePosition {
  vehicleKey: string;
  position: number;
}

interface CurrentStopState {
  currentStop: {
    id?: string;
    name: string;
  } | null;
  vehicleNumberFilters: string[];
  vehiclePositions: VehiclePosition[];
  setCurrentStop: (stop: { id?: string; name: string; } | null) => void;
  setVehicleNumberFilters: (filters: string[]) => void;
  setVehiclePositions: (positions: VehiclePosition[]) => void;
  clearCurrentStop: () => void;
}

export const useCurrentStop = create<CurrentStopState>()(
  persist(
    (set) => ({
      currentStop: null,
      vehicleNumberFilters: [],
      vehiclePositions: [],

      setCurrentStop: (stop) => set({ currentStop: stop, vehiclePositions: [] }),
      setVehicleNumberFilters: (filters) => set({ vehicleNumberFilters: filters }),
      setVehiclePositions: (positions) => set({ vehiclePositions: positions }),
      clearCurrentStop: () => set({ currentStop: null, vehicleNumberFilters: [], vehiclePositions: [] }),
    }),
    {
      name: 'current-stop',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);