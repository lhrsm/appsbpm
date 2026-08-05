import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
  message: string;
  setIsNavigating: (isNavigating: boolean, message?: string) => void;
}

export const useNavigationState = create<NavigationState>((set) => ({
  isNavigating: false,
  message: '',
  setIsNavigating: (isNavigating, message = '') => set({ isNavigating, message }),
}));
