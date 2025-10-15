import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  language: 'en' | 'zh';
  sidebarOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'zh') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      sidebarOpen: true,

      setTheme: (theme) => set({ theme }),
      
      setLanguage: (language) => set({ language }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'ui-storage',
    }
  )
);

