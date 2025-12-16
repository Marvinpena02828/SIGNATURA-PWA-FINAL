import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setIsLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({
        user: null,
        role: null,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, role: state.role }),
    }
  )
);
