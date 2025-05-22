"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi, LoginCredentials, RegisterData } from "@/lib/api/authApi";
import { userApi, User } from "@/lib/api/userApi";
import { ApiError, isTokenExpired } from "@/lib/api/apiClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    // Skip auth check on the server side
    if (typeof window === "undefined") {
      return;
    }

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Check if token is expired before making API calls
        if (isTokenExpired(token)) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.error("Token refresh failed, logging out");
            clearTokens();
            setUser(null);
            setIsLoading(false);
            return;
          }
          // If refresh succeeds, continue with the new token
        }

        // Get user profile
        try {
          const userData = await userApi.getProfile();
          setUser(userData);
        } catch (error) {
          console.error("Failed to get user profile:", error);

          // Check if this is a blocked account error during profile fetch
          if (error instanceof ApiError) {
            if (error.status === 403 || error.status === 423) {
              // Account is blocked/locked, clear tokens and don't auto-retry
              console.warn("Account appears to be blocked during profile fetch");
              clearTokens();
              setUser(null);
              setIsLoading(false);
              return;
            }
          }

          // Token might be invalid - try to refresh it
          const refreshed = await refreshToken();
          if (!refreshed) {
            // If refresh fails, clear tokens and log out
            console.error("Token refresh failed, logging out");
            clearTokens();
            setUser(null);
          } else {
            // If refresh succeeds, try to get user profile again
            try {
              const userData = await userApi.getProfile();
              setUser(userData);
            } catch (retryError) {
              // If it still fails, clear tokens
              console.error("Still failed to get profile after token refresh:", retryError);
              clearTokens();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Helper function to clear tokens and all user-related data
  const clearTokens = () => {
    if (typeof window === "undefined") return;

    // Clear authentication tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear all user-related application data
    localStorage.removeItem("selected_company_id");
    localStorage.removeItem("currentAssessmentId"); // For future PCF calculation data

    // Clear any other user-specific data that might be cached
    // Add more items here as needed when you implement additional features
  };

  // Helper function to detect blocked account errors
  const isBlockedAccountError = (error: unknown): boolean => {
    if (error instanceof ApiError) {
      // Check HTTP status codes that typically indicate blocked accounts
      if (error.status === 403 || error.status === 423 || error.status === 401) {
        const errorData = error.data;
        const errorMessage = error.message.toLowerCase();

        // Check for common blocked account error messages
        const blockedKeywords = [
          "account blocked",
          "account suspended",
          "account disabled",
          "account locked",
          "account deactivated",
          "access denied",
          "account restricted",
          "user is inactive",
          "user is blocked",
        ];

        return blockedKeywords.some(
          keyword =>
            errorMessage.includes(keyword) ||
            (typeof errorData === "string" && errorData.toLowerCase().includes(keyword))
        );
      }
    }

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      return [
        "account blocked",
        "account suspended",
        "account disabled",
        "account locked",
        "account deactivated",
      ].some(keyword => errorMessage.includes(keyword));
    }

    return false;
  };

  // Set up token refresh interval
  useEffect(() => {
    // Skip on the server side
    if (typeof window === "undefined") {
      return;
    }

    // Refresh token every 45 minutes (assuming token expires in 60 minutes)
    const refreshInterval = setInterval(
      () => {
        if (user) {
          refreshToken().catch(console.error);
        }
      },
      45 * 60 * 1000 // 45 minutes
    );

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.login(credentials);
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);

      // Get user profile
      const userData = await userApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      clearTokens();

      // Check if this is a blocked account error and re-throw with appropriate message
      if (isBlockedAccountError(error)) {
        throw new Error("Account blocked or suspended. Please contact support for assistance.");
      }

      // Handle other API errors
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("Invalid credentials. Please check your email and password.");
        } else if (error.status === 429) {
          throw new Error("Too many login attempts. Please wait a few minutes and try again.");
        } else if (error.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(error.message);
      }

      throw new Error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);
      setUser(response.user);
    } catch (error) {
      console.error("Registration failed:", error);
      if (error instanceof ApiError) {
        // Extract field-specific errors if available
        if (typeof error.data === "object" && error.data !== null) {
          const fieldErrors = Object.entries(error.data)
            .map(([field, errors]) => {
              // Handle both string and array error messages
              const errorMsg = Array.isArray(errors) ? errors[0] : errors;
              return `${field}: ${errorMsg}`;
            })
            .join(". ");

          if (fieldErrors) {
            throw new Error(fieldErrors);
          }
        }
        throw new Error(error.message);
      }
      throw new Error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        console.error("No refresh token available");
        return false;
      }

      const { access } = await authApi.refreshToken(refreshToken);
      localStorage.setItem("access_token", access);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);

      // If refresh token is also expired or invalid, clear everything
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearTokens();
      }

      return false;
    }
  };

  const logout = () => {
    // Clear all tokens and user data
    clearTokens();

    // Clear user state
    setUser(null);

    // Redirect to login page
    router.push("/login");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth hook with requireAuth method
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Extend the context with requireAuth method
  return {
    ...context,
    // Method to require authentication and redirect if not authenticated
    requireAuth: () => {
      const router = useRouter();

      useEffect(() => {
        if (!context.isLoading && !context.isAuthenticated) {
          router.push("/login");
        }
      }, [context.isLoading, context.isAuthenticated, router]);
    },
  };
}
