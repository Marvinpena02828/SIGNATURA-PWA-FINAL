import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  token: null,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setToken: (token) => set({ token }),

  clearAuth: () => {
    // Clear localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_token');
    
    // Clear sessionStorage
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_role');
    sessionStorage.removeItem('auth_token');
    
    // Clear state
    set({ user: null, role: null, token: null });
  },

  loadFromStorage: () => {
    const user = localStorage.getItem('auth_user');
    const role = localStorage.getItem('auth_role');
    const token = localStorage.getItem('auth_token');

    if (user && role) {
      set({ 
        user: JSON.parse(user), 
        role, 
        token 
      });
    }
  },

  saveToStorage: (user, role, token) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_role', role);
    localStorage.setItem('auth_token', token);
    set({ user, role, token });
  },
}));
