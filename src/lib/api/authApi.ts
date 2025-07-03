/**
 * Authentication API client
 * Handles user login, registration, and token management operations
 */

import { apiRequest } from "./apiClient";

// Interface for user login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Interface for user registration data
export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

// Interface for authentication tokens returned by login
export interface AuthTokens {
  access: string;
  refresh: string;
}

// Interface for registration response including user data and tokens
export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  access: string;
  refresh: string;
}

/**
 * Authentication API endpoints
 * Provides methods for user authentication and token management
 */
export const authApi = {
  /**
   * Authenticate user with username and password
   * @param credentials - User login credentials
   * @returns Promise resolving to access and refresh tokens
   */
  login: (credentials: LoginCredentials) =>
    apiRequest<AuthTokens>("/login/", {
      method: "POST",
      body: credentials as unknown as Record<string, unknown>,
      requiresAuth: false, // No authentication needed for login
    }),

  /**
   * Register a new user account
   * @param userData - User registration information
   * @returns Promise resolving to user data and authentication tokens
   */
  register: (userData: RegisterData) =>
    apiRequest<RegisterResponse>("/register/", {
      method: "POST",
      body: userData as unknown as Record<string, unknown>,
      requiresAuth: false, // No authentication needed for registration
    }),

  /**
   * Refresh expired access token using refresh token
   * @param refreshToken - Valid refresh token string
   * @returns Promise resolving to new access token
   */
  refreshToken: (refreshToken: string) =>
    apiRequest<{ access: string }>("/token/refresh/", {
      method: "POST",
      body: { refresh: refreshToken } as Record<string, unknown>,
      requiresAuth: false, // Refresh doesn't require existing auth
    }),
};
