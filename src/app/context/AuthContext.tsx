"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, LoginCredentials, RegisterData } from "@/lib/api/authApi";
import { User, userApi } from "@/lib/api/userApi";
import { companyApi } from "@/lib/api/companyApi";
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

          const refreshed = await refreshToken();
          if (!refreshed) {
            console.error("Token refresh failed, logging out");
            clearTokens();
            setUser(null);
          } else {
            // If refresh succeeds, try to get user profile again
            try {
              const userData = await userApi.getProfile();
              setUser(userData);
            } catch (retryError) {
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
    localStorage.removeItem("currentAssessmentId");

    // DON'T clear tour data on logout - it should persist per user
    // Only clear generic tour data (old format) and active session data
    localStorage.removeItem("completedTours"); // Only clear old generic format
    
    // Clear session storage tour data (active tours only)
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith("activeTour") || key.startsWith("currentTourStep") || key.includes("hasSeenTour")) {
        sessionStorage.removeItem(key);
      }
    });

    // Clear the new user flag
    localStorage.removeItem("isNewUser");
  };

  // Helper function to detect blocked account errors based on backend response
  const isAccountBlocked = (error: unknown): boolean => {
    if (error instanceof ApiError) {
      // For now, treat any 403 as potentially a blocked account
      // In the future, the backend can add error codes or specific fields
      if (error.status === 403) {
        return true;
      }

      // Could also check for 423 (Locked) if backend starts using it
      if (error.status === 423) {
        return true;
      }
    }
    return false;
  };

  // Helper function to determine where to redirect after login
  const getPostLoginRedirect = async (): Promise<string> => {
    try {
      // Check if user has companies
      const companies = await companyApi.listCompanies();
      
      if (companies.length === 0) {
        // No companies - go to list-companies page which has nice empty state
        return "/list-companies";
      }
      
      // Check if user has a selected company
      const selectedCompanyId = localStorage.getItem("selected_company_id");
      
      if (selectedCompanyId) {
        // Verify the selected company still exists and user has access
        try {
          await companyApi.getCompany(selectedCompanyId);
          return "/dashboard"; // Company exists, go to dashboard
        } catch (error) {
          // Selected company no longer accessible, clear it
          localStorage.removeItem("selected_company_id");
        }
      }
      
      // No valid selected company - go to company list to select one
      return "/list-companies";
      
    } catch (error) {
      console.error("Error determining post-login redirect:", error);
      // Fallback to company list if we can't determine state
      return "/list-companies";
    }
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

      // Smart redirect based on user state
      const redirectPath = await getPostLoginRedirect();
      router.push(redirectPath);
      
    } catch (error) {
      console.error("Login failed:", error);
      clearTokens();

      // Check if this is a blocked account error
      if (isAccountBlocked(error)) {
        throw new Error(
          "Your account access is restricted. Please contact support for assistance."
        );
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

      // Mark as new user for tour
      localStorage.setItem("isNewUser", "true");

      setUser(response.user);

      // For new users, redirect to list-companies which will show empty state
      // The tour will automatically trigger there for new users
      router.push("/list-companies");
      
    } catch (error) {
      console.error("Registration failed:", error);

      if (error instanceof ApiError) {
        // Pass through the ApiError with its original data structure
        // Create a new error with the original error data as the cause
        throw new Error("Registration failed", {
          cause: {
            status: error.status,
            data: error.data,
          },
        });
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
    clearTokens();
    setUser(null);
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
