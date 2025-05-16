import { apiRequest } from "./apiClient";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

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

export const authApi = {
  // Login a user with username/password
  login: (credentials: LoginCredentials) =>
    apiRequest<AuthTokens>("/login/", {
      method: "POST",
      body: credentials as unknown as Record<string, unknown>,
      requiresAuth: false,
    }),

  // Register a new user
  register: (userData: RegisterData) =>
    apiRequest<RegisterResponse>("/register/", {
      method: "POST",
      body: userData as unknown as Record<string, unknown>,
      requiresAuth: false,
    }),

  // Refresh the access token using the refresh token
  refreshToken: (refreshToken: string) =>
    apiRequest<{ access: string }>("/token/refresh/", {
      method: "POST",
      body: { refresh: refreshToken } as Record<string, unknown>,
      requiresAuth: false,
    }),
};
