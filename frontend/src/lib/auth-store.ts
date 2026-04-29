import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  isCheckingSession: boolean;
  setSession: (input: { token: string; user: AuthUser }) => void;
  updateUser: (user: AuthUser | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setIsCheckingSession: (isCheckingSession: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      isCheckingSession: true,
      setSession: ({ token, user }) => set({ token, user, isCheckingSession: false }),
      updateUser: (user) => set({ user, isCheckingSession: false }),
      setHydrated: (hydrated) => set({ hydrated }),
      setIsCheckingSession: (isCheckingSession) => set({ isCheckingSession }),
      logout: () => {
        set({ token: null, user: null, isCheckingSession: false });
        // Clear storage to prevent stale redirects
        localStorage.removeItem('the-golf-draw-auth');
      },
    }),
    {
      name: 'the-golf-draw-auth',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          // If we have a user and token, we can optimistically skip the global loader
          // but AuthBootstrap will still perform a background check
          if (state.token && state.user) {
            state.isCheckingSession = false;
          } else {
            state.isCheckingSession = false; // No session to check, just go to public
          }
        }
      },
    },
  ),
);