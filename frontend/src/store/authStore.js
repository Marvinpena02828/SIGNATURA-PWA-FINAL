// src/store/authStore.js - MINIMAL working Zustand store

import { create } from 'zustand';

console.log('✅ Creating authStore...');

export const useAuthStore = create((set) => {
  console.log('✅ Zustand store initialized');

  return {
    // STATE
    user: null,
    role: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // ACTIONS
    setUser: (user) => {
      console.log('👤 setUser:', user?.email);
      set({ user, isAuthenticated: !!user, error: null });
    },

    setRole: (role) => {
      console.log('🎯 setRole:', role);
      set({ role });
    },

    setToken: (token) => {
      console.log('🔐 setToken');
      set({ token });
    },

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => {
      console.log('❌ setError:', error);
      set({ error });
    },

    login: (user, role, token) => {
      console.log('🔑 login:', user?.email, role);
      set({
        user,
        role,
        token,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      });
      // Persist to localStorage
      localStorage.setItem('auth-store', JSON.stringify({
        user,
        role,
        token,
        isAuthenticated: true,
      }));
    },

    signup: (user, role, token) => {
      console.log('📝 signup:', user?.email, role);
      set({
        user,
        role,
        token,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      });
      // Persist to localStorage
      localStorage.setItem('auth-store', JSON.stringify({
        user,
        role,
        token,
        isAuthenticated: true,
      }));
    },

    logout: () => {
      console.log('🚪 logout');
      set({
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
      // Clear localStorage
      localStorage.removeItem('auth-store');
    },

    clearAuth: () => {
      console.log('🧹 clearAuth');
      set({
        user: null,
        role: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
      localStorage.removeItem('auth-store');
    },

    // Load from localStorage on init
    hydrate: () => {
      console.log('💾 Hydrating from localStorage...');
      const stored = localStorage.getItem('auth-store');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          console.log('✅ Loaded from localStorage:', data.user?.email);
          set(data);
        } catch (error) {
          console.error('❌ Failed to load from localStorage:', error);
        }
      }
    },
  };
});

// Hydrate on app start
useAuthStore.getState().hydrate();

console.log('✅ authStore ready');
