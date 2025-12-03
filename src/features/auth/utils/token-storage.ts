const TOKEN_STORAGE_KEY = 'crits_refresh_token';
const ACCESS_TOKEN_KEY = 'crits_access_token_temp';

// In-memory storage for access token (cleared on page refresh)
let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  // Access Token Management
  setAccessToken(token: string): void {
    inMemoryAccessToken = token;
    // Temporarily store in sessionStorage for page refresh recovery
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  clearAccessToken(): void {
    inMemoryAccessToken = null;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // Refresh Token Management
  setRefreshToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  clearRefreshToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  // Combined operations
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  clearTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  },

  // Page refresh recovery
  recoverTokensFromStorage(): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = this.getRefreshToken();

    if (accessToken) {
      inMemoryAccessToken = accessToken;
    }

    return { accessToken: inMemoryAccessToken, refreshToken };
  },
};
