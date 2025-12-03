import { jwtDecode } from 'jwt-decode';
import { TOKEN_REFRESH_THRESHOLD } from '@/shared/constants/api.constants';

interface JwtPayload {
  exp: number;
  iat: number;
  username: string;
  roles: string[];
}

export const tokenValidator = {
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;
      return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
    } catch {
      return false;
    }
  },

  getTokenPayload(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  },
};
