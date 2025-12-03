import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';
import { tokenStorage } from '@/features/auth/utils/token-storage';
import { tokenValidator } from '@/features/auth/utils/token-validator';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

// Prevent multiple simultaneous token refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth header for login endpoint
    if (config.url?.includes('/api/token')) {
      return config;
    }

    let accessToken = tokenStorage.getAccessToken();

    // Proactive token refresh
    if (accessToken && tokenValidator.shouldRefreshToken(accessToken)) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = tokenStorage.getRefreshToken();

        if (refreshToken) {
          try {
            const { token } = await authApi.refreshToken(refreshToken);
            tokenStorage.setAccessToken(token);
            accessToken = token;
            onTokenRefreshed(token);
          } catch (error) {
            useAuthStore.getState().logout();
            throw error;
          } finally {
            isRefreshing = false;
          }
        }
      } else {
        // Wait for ongoing refresh
        accessToken = await new Promise<string>((resolve) => {
          subscribeTokenRefresh(resolve);
        });
      }
    }

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const { token } = await authApi.refreshToken(refreshToken);
          tokenStorage.setAccessToken(token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          onTokenRefreshed(token);
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);
