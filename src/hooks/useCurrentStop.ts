import { Platform } from 'react-native';

// Conditional imports based on platform
let create: any;

if (typeof Platform !== 'undefined' && Platform.OS === 'web') {
  // Use traditional API for web to avoid import.meta issues
  const zustandTraditional = require('zustand/traditional');
  create = zustandTraditional.createWithEqualityFn;
} else {
  // Use regular API for native platforms
  create = require('zustand').create;
}

interface VehiclePosition {
  vehicleKey: string;
  position: number;
}

interface CurrentStopState {
  currentStop: {
    id: string; // DIDOC code - required
    rawName?: string; // Whatever text was used before API call - optional
  } | null;
  vehicleNumberFilters: string[];
  vehiclePositions: VehiclePosition[];
  setCurrentStop: (stop: { id: string; rawName?: string; } | null) => void;
  setVehicleNumberFilters: (filters: string[]) => void;
  setVehiclePositions: (positions: VehiclePosition[]) => void;
  clearCurrentStop: () => void;
}

export const useCurrentStop = create<CurrentStopState>()((set) => ({
  currentStop: null,
  vehicleNumberFilters: [],
  vehiclePositions: [],

  setCurrentStop: (stop) => set({ currentStop: stop, vehiclePositions: [] }),
  setVehicleNumberFilters: (filters) => set({ vehicleNumberFilters: filters }),
  setVehiclePositions: (positions) => set({ vehiclePositions: positions }),
  clearCurrentStop: () => set({ currentStop: null, vehicleNumberFilters: [], vehiclePositions: [] }),
}));