import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  currentDate: string;
  toggleSidebar: () => void;
  setCurrentDate: (date: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  currentDate: new Date().toISOString().split('T')[0],
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setCurrentDate: (date) => set({ currentDate: date }),
}));
