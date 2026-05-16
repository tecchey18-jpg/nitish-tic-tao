import { create } from 'zustand';

export type AppPage = 'home' | 'game' | 'settings' | 'results';

interface UiState {
  page: AppPage;
  setPage: (page: AppPage) => void;
}

export const useUiStore = create<UiState>((set) => ({
  page: 'game',
  setPage: (page) => set({ page })
}));
