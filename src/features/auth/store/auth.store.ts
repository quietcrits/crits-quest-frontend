import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { tokenStorage } from '../utils/token-storage';
import { tokenValidator } from '../utils/token-validator';

export interface User {
  username: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUser: (user) => {
        set({ user, isAuthenticated: true, error: null });
      },

      setTokens: (accessToken, refreshToken) => {
        tokenStorage.setTokens(accessToken, refreshToken);

        const payload = tokenValidator.getTokenPayload(accessToken);
        if (payload) {
          const user: User = {
            username: payload.username,
            roles: payload.roles,
          };
          set({ user, isAuthenticated: true, error: null });
        }
      },

      logout: () => {
        tokenStorage.clearTokens();
        set({ user: null, isAuthenticated: false, error: null, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        set({ isLoading: true });

        const { accessToken, refreshToken } = tokenStorage.recoverTokensFromStorage();

        if (accessToken && !tokenValidator.isTokenExpired(accessToken)) {
          const payload = tokenValidator.getTokenPayload(accessToken);
          if (payload) {
            const user: User = {
              username: payload.username,
              roles: payload.roles,
            };
            set({ user, isAuthenticated: true, isLoading: false });
            return;
          }
        }

        // If we have a refresh token but no valid access token, the interceptor will handle refresh
        if (refreshToken) {
          set({ isLoading: false, isAuthenticated: false });
        } else {
          set({ isLoading: false, isAuthenticated: false });
        }
      },
    }),
    { name: 'auth-store' }
  )
);
