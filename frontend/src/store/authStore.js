// src/store/authStore.js - Zustand store for authentication

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

console.log('✅ authStore module loading...');

// Create the store with Zustand
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => {
        console.log('✅ Zustand store initialized');

        return {
          // ============ STATE ============
          user: null,
          role: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,

          // ============ SETTERS ============
          setUser: (user) => {
            console.log('👤 setUser called:', user?.email);
            set({
              user,
              isAuthenticated: !!user,
              error: null,
            });
          },

          setRole: (role) => {
            console.log('🎯 setRole called:', role);
            set({ role });
          },

          setToken: (token) => {
            console.log('🔐 setToken called');
            set({ token });
          },

          setLoading: (isLoading) => {
            set({ isLoading });
          },

          setError: (error) => {
            console.log('❌ setError:', error);
            set({ error });
          },

          // ============ ACTIONS ============
          login: (user, role, token) => {
            console.log('🔑 login action:', user?.email, role);
            set({
              user,
              role,
              token,
              isAuthenticated: true,
              error: null,
            });
          },

          signup: (user, role, token) => {
            console.log('📝 signup action:', user?.email, role);
            set({
              user,
              role,
              token,
              isAuthenticated: true,
              error: null,
            });
          },

          logout: () => {
            console.log('🚪 logout action');
            set({
              user: null,
              role: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          },

          clearAuth: () => {
            console.log('🧹 clearAuth action');
            set({
              user: null,
              role: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          },

          // ============ GETTERS ============
          getUser: () => get().user,
          getRole: () => get().role,
          getToken: () => get().token,
          isLoggedIn: () => get().isAuthenticated,
        };
      },
      {
        name: 'auth-store', // localStorage key
        partialize: (state) => ({
          // Only persist these fields to localStorage
          user: state.user,
          role: state.role,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

console.log('✅ authStore exported successfully');
