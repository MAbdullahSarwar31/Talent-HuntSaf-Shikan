import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthState } from '../types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authReady: false,

      setAuth: (user: AuthUser, accessToken: string) =>
        set({ user, accessToken, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      setAuthReady: (ready: boolean) =>
        set({ authReady: ready }),
    }),
    {
      name: 'agron-auth',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: () => {
        // Wipe any old cached auth on version mismatch
        return { user: null, accessToken: null, isAuthenticated: false, authReady: false };
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
