import { create } from 'zustand';
import { getSetting, setSetting } from '../utils/settingsDB';

const useSettingsStore = create((set) => ({
  mode: 'light',
  fontSize: 'medium',
  loaded: false,

  loadSettings: async () => {
    const mode = (await getSetting('mode')) ?? 'light';
    const fontSize = (await getSetting('fontSize')) ?? 'medium';
    set({ mode, fontSize, loaded: true });
  },

  setMode: async (mode) => {
    await setSetting('mode', mode);
    set({ mode });
  },

  setFontSize: async (fontSize) => {
    await setSetting('fontSize', fontSize);
    set({ fontSize });
  },
}));

export default useSettingsStore;
