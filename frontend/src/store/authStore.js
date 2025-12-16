import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  token: null,

  setUser: (user) => {
    set({ user });
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  setRole: (role) => {
    set({ role });
    localStorage.setItem('auth_role', role);
  },

  setToken: (token) => {
    set({ token });
    localStorage.setItem('auth_token', token);
  },

  clearAuth: () => {
    // Clear all storage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
    
    // Clear state
    set({ 
      user: null, 
      role: null, 
      token: null 
    });
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
}));
