"use client";

// React hooks for state management and routing
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// API imports for authentication operations
import { authApi, LoginCredentials, RegisterData } from "@/lib/api/authApi";
import { User, userApi } from "@/lib/api/userApi";
import { ApiError, isTokenExpired } from "@/lib/api/apiClient";

/**
 * Interface defining the shape of the authentication context
 * Provides all authentication-related state and methods to consuming components
 */
interface AuthContextType {
  user: User | null; // Current authenticated user or null if not logged in
  isAuthenticated: boolean; // Boolean indicating if user is currently authenticated
  isLoading: boolean; // Loading state for authentication operations
  login: (credentials: LoginCredentials) => Promise<void>; // Method to log in a user
  register: (userData: RegisterData) => Promise<void>; // Method to register a new user
  logout: () => void; // Method to log out the current user
  refreshToken: () => Promise<boolean>; // Method to refresh authentication token
}

// Create the authentication context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the app and provides authentication state
 * Manages user authentication, token refresh, and session persistence
 * 
 * @param children - React components to be wrapped with authentication context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // State for storing the current authenticated user
  const [user, setUser] = useState<User | null>(null);
  
  // Loading state to indicate when authentication operations are in progress
  const [isLoading, setIsLoading] = useState(true);
  
  // Router instance for navigation after authentication events
  const router = useRouter();

  /**
   * Effect to check authentication status on component mount
   * Validates existing tokens and restores user session if valid
   */
  useEffect(() => {
    // Skip auth check on the server side to prevent hydration issues
    if (typeof window === "undefined") {
      return;
    }

    /**
     * Async function to validate existing authentication and restore user session
     * Checks token validity, refreshes if needed, and fetches user profile
     */
    const checkAuth = async () => {
      try {
        // Attempt to retrieve stored access token
        const token = localStorage.getItem("access_token");
        if (!token) {
          // No token found, user is not authenticated
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Check if the current token has expired
        if (isTokenExpired(token)) {
          // Token is expired, attempt to refresh
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.error("Token refresh failed, logging out");
            clearTokens(); // Clear all authentication data
            setUser(null);
            setIsLoading(false);
            return;
          }
          // If refresh succeeds, continue with the new token
        }

        // Attempt to fetch user profile with valid token
        try {
          const userData = await userApi.getProfile();
          setUser(userData); // Set authenticated user data
        } catch (error) {
          console.error("Failed to get user profile:", error);

          // Profile fetch failed, try token refresh as fallback
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.error("Token refresh failed, logging out");
            clearTokens();
            setUser(null);
          } else {
            // Retry profile fetch after successful token refresh
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
        // Handle any unexpected errors during authentication check
        console.error("Auth check failed:", error);
        clearTokens();
        setUser(null);
      } finally {
        // Always set loading to false when authentication check completes
        setIsLoading(false);
      }
    };

    // Execute authentication check
    checkAuth();
  }, []);

  /**
   * Helper function to clear all authentication tokens and user data
   * Removes tokens from localStorage and clears application state
   */
  const clearTokens = () => {
    // Ensure we're in browser environment before accessing localStorage
    if (typeof window === "undefined") return;

    // Clear authentication tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear all user-related application data
    localStorage.removeItem("selected_company_id");
    localStorage.removeItem("currentAssessmentId"); // For future PCF calculation data
  };

  /**
   * Helper function to detect if an error indicates a blocked account
   * Analyzes API error responses to identify account blocking scenarios
   * 
   * @param error - The error object to analyze
   * @returns boolean indicating if the account appears to be blocked
   */
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

  /**
   * Effect to set up automatic token refresh interval
   * Periodically refreshes tokens to maintain user session
   */
  useEffect(() => {
    // Skip on the server side to prevent issues during SSR
    if (typeof window === "undefined") {
      return;
    }

    // Refresh token every 45 minutes (assuming token expires in 60 minutes)
    const refreshInterval = setInterval(
      () => {
        // Only refresh if user is currently authenticated
        if (user) {
          refreshToken().catch(console.error);
        }
      },
      45 * 60 * 1000 // 45 minutes in milliseconds
    );

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user]);

  /**
   * Login function to authenticate a user with credentials
   * Validates credentials, stores tokens, and sets user state
   * 
   * @param credentials - User login credentials (username/email and password)
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true); // Set loading state during login attempt
    try {
      // Attempt to authenticate with the backend
      const tokens = await authApi.login(credentials);
      
      // Store received tokens in localStorage for session persistence
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);

      // Fetch and set user profile data
      const userData = await userApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      clearTokens(); // Ensure no partial authentication state remains

      // Check if this is a blocked account error and provide specific messaging
      if (isAccountBlocked(error)) {
        throw new Error(
          "Your account access is restricted. Please contact support for assistance."
        );
      }

      // Handle other API errors with appropriate user messaging
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

      // Fallback error message for unexpected errors
      throw new Error("Login failed. Please try again.");
    } finally {
      // Always clear loading state when login attempt completes
      setIsLoading(false);
    }
  };

  /**
   * Registration function to create a new user account
   * Creates account, stores tokens, and sets user state
   * 
   * @param userData - User registration data including name, email, password
   */
  const register = async (userData: RegisterData) => {
    setIsLoading(true); // Set loading state during registration
    try {
      // Attempt to register new user with backend
      const response = await authApi.register(userData);
      
      // Store authentication tokens received from registration
      localStorage.setItem("access_token", response.access);
      localStorage.setItem("refresh_token", response.refresh);

      // Mark as new user for tour system
      localStorage.setItem("isNewUser", "true");

      // Set the newly registered user data
      setUser(response.user);
    } catch (error) {
      console.error("Registration failed:", error);

      // Handle API errors by preserving error structure for form validation
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

      // Fallback error for non-API errors
      throw new Error("Registration failed. Please try again.");
    } finally {
      // Always clear loading state when registration completes
      setIsLoading(false);
    }
  };

  /**
   * Token refresh function to maintain user session
   * Uses refresh token to obtain new access token
   * 
   * @returns Promise<boolean> - Success status of token refresh operation
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      // Attempt to retrieve stored refresh token
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        console.error("No refresh token available");
        return false;
      }

      // Call API to refresh access token
      const { access } = await authApi.refreshToken(refreshToken);
      
      // Store the new access token
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

  /**
   * Logout function to end user session
   * Clears all authentication data and redirects to login
   */
  const logout = () => {
    clearTokens(); // Remove all stored authentication data
    setUser(null); // Clear user state
    router.push("/login"); // Redirect to login page
  };

  // Create context value object with all authentication state and methods
  const value = {
    user,
    isAuthenticated: !!user, // Convert user object to boolean
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  // Provide authentication context to all child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 * Provides authentication state and methods with additional utilities
 * 
 * @returns Extended authentication context with requireAuth method
 */
export function useAuth() {
  // Ensure hook is used within AuthProvider
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Extend the context with requireAuth method for protected routes
  return {
    ...context,
    /**
     * Method to require authentication and redirect if not authenticated
     * Should be called in components that require user authentication
     */
    requireAuth: () => {
      const router = useRouter();

      useEffect(() => {
        // Redirect to login if user is not authenticated and loading is complete
        if (!context.isLoading && !context.isAuthenticated) {
          router.push("/login");
        }
      }, [context.isLoading, context.isAuthenticated, router]);
    },
  };
}
