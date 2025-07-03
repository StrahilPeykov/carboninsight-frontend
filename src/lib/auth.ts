/**
 * Authentication utilities for JWT token management
 * Provides login, logout, token validation, and refresh functionality
 */

interface JwtPayload {
  exp: number;
  user_id: number;
  username: string;
}

export const auth = {
  /**
   * Authenticate user with username and password
   * @param username - User's login name
   * @param password - User's password
   * @returns Promise with authentication tokens
   */
  login: async (username: string, password: string) => {
    const response = await fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    // Store tokens in localStorage for persistence
    const data = await response.json();
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    return data;
  },

  /**
   * Clear all authentication tokens and user session data
   * Removes tokens and assessment state from localStorage
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentAssessmentId");
  },

  /**
   * Check if user has valid authentication token
   * Validates token existence and expiration
   * @returns Boolean indicating authentication status
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    try {
      // Decode JWT payload to check expiration
      // Manual base64 decoding without external dependencies
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decoded = JSON.parse(jsonPayload) as JwtPayload;
      // Check if token is still valid (not expired)
      return decoded.exp > Date.now() / 1000;
    } catch {
      // If token parsing fails, assume invalid
      return false;
    }
  },

  /**
   * Refresh expired access token using refresh token
   * Attempts to get new access token when current one expires
   * @returns Promise with new access token
   * @throws Error if refresh token is invalid or expired
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await fetch("http://localhost:8000/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    // Update stored access token with new one
    const data = await response.json();
    localStorage.setItem("accessToken", data.access);
    return data;
  },
};
