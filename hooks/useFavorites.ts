import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteStop {
  id: string;
  name: string;
  vehicleNumberFilters: string[];
}

interface FavoritesState {
  favorites: FavoriteStop[];
  addFavorite: (stop: Omit<FavoriteStop, 'id'>) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (stop) => set((state) => ({
        favorites: [
          ...state.favorites,
          {
            ...stop,
            id: Date.now().toString(), // Simple unique ID generation
          },
        ],
      })),
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter((favorite) => favorite.id !== id),
      })),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'favorites',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);