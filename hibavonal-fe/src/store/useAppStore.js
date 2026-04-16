import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:5000';

const useAppStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: localStorage.getItem('accessToken') || null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false, accessToken: null });
  },

  register: async (username, password, role = 'student') => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      set({ loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('accessToken', data.access_token);
      set({
        user: data.user,
        isAuthenticated: true,
        accessToken: data.access_token,
        loading: false,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false, accessToken: null });
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data, isAuthenticated: true, accessToken: token, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  getToolOrders: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/tools/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch orders');
      return data.orders;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  createToolOrder: async (toolName, quantity = 1, reason = '') => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tools/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tool_name: toolName, quantity, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');
      set({ loading: false });
      return data.order;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  updateToolOrder: async (orderId, status) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Not authenticated');

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tools/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update order');
      set({ loading: false });
      return data.order;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
}));

export default useAppStore;

