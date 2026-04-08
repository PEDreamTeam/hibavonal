import { create } from 'zustand';
import { getToken, setToken, removeToken } from '../api/fetcher';

function decodePayload(token) {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function loadUserFromToken() {
  const token = getToken();
  if (!token) return null;

  const payload = decodePayload(token);
  if (!payload) return null;

  if (payload.exp * 1000 < Date.now()) {
    removeToken();
    return null;
  }

  return {
    user_id: payload.user_id,
    email: payload.email,
    role: payload.role,
  };
}

const initialUser = loadUserFromToken();

const useAppStore = create((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,

  setAuth: (user, token) => {
    setToken(token);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    removeToken();
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAppStore;
