import { create } from "zustand";

interface AuthModalStore {
  isOpen: boolean;
  callbackUrl?: string;
  openAuthModal: (callbackUrl?: string) => void;
  closeAuthModal: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  callbackUrl: undefined,
  openAuthModal: (callbackUrl) => set({ isOpen: true, callbackUrl }),
  closeAuthModal: () => set({ isOpen: false, callbackUrl: undefined }),
}));
