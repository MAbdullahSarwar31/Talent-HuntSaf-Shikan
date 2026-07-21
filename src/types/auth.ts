import { UserRole } from '../constants/roles';

/** Shape of the authenticated user object returned by the API / Supabase profile. */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  tenantId: string;
}

/** POST /auth/login — request body */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** POST /auth/login — response body */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** POST /auth/logout — no body; 204 response */
export type LogoutResponse = void;

/** Zustand auth store shape matching SaaS platform `useAuthStore` */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authReady: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setAuthReady: (ready: boolean) => void;
}
