import { create } from 'zustand';

export const useAuthStore = create((set, get) => {
  console.log('✅ authStore initialized');

  return {
    // State
    user: null,
    role: null,
    isAuthenticated: false,
    loading: false,

    // Actions
    setUser: (user) => {
      console.log('👤 setUser called:', user?.email);
      set({ 
        user, 
        isAuthenticated: !!user 
      });
    },

    setRole: (role) => {
      console.log('🎯 setRole called:', role);
      set({ role });
    },

    setLoading: (loading) => set({ loading }),

    login: (user, role) => {
      console.log('🔑 login called:', user?.email, role);
      set({
        user,
        role,
        isAuthenticated: true,
      });
    },

    logout: () => {
      console.log('🚪 logout called');
      set({
        user: null,
        role: null,
        isAuthenticated: false,
      });
    },

    clearAuth: () => {
      console.log('🧹 clearAuth called');
      set({
        user: null,
        role: null,
        isAuthenticated: false,
      });
    },

    // Getters
    getUser: () => get().user,
    getRole: () => get().role,
    isLoggedIn: () => get().isAuthenticated,
  };
});
