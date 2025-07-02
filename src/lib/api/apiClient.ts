import { useRouter } from "next/navigation";

// Base configuration for API requests
// Defaults to localhost for development, can be overridden via environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Custom error class for API-related errors
 * Extends native Error with additional HTTP status and response data
 */
export class ApiError extends Error {
  status: number; // HTTP status code from the failed request
  data: unknown; // Additional error data from the API response

  /**
   * Create a new API error instance
   * @param status - HTTP status code
   * @param message - Error message
   * @param data - Optional additional error data from API response
   */
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Type definitions for HTTP request methods
export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

/**
 * Interface for configuring API request options
 * @template T - Type of the request body data
 */
export interface RequestOptions<T = Record<string, unknown>> {
  method?: RequestMethod; // HTTP method for the request
  body?: T; // Request body data
  headers?: Record<string, string>; // Additional HTTP headers
  requiresAuth?: boolean; // Whether the request requires authentication
  responseType?: "json" | "blob"; // Expected response type
}

/**
 * Function to safely get authentication token from localStorage
 * Handles browser-safe access to localStorage
 * @returns Access token string or null if not available
 */
function getAuthToken(): string | null {
  // Check if running in browser environment
  if (typeof window === "undefined") {
    return null; // Return null during server-side rendering
  }
  return localStorage.getItem("access_token");
}

/**
 * Core API client function for making HTTP requests
 * Handles authentication, error handling, and response parsing
 * 
 * @template R - Type of the expected response data
 * @template T - Type of the request body data
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Request configuration options
 * @returns Promise resolving to parsed response data
 */
export async function apiRequest<R, T = Record<string, unknown>>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<R> {
  // Destructure options with default values
  const { method = "GET", body, headers = {}, requiresAuth = true, responseType = "json" } = options;

  // Get authentication token if required
  const token = requiresAuth ? getAuthToken() : null;

  // If auth is required but no token is present, throw an error
  if (requiresAuth && !token) {
    throw new ApiError(401, "Authentication required");
  }

  // Prepare base headers with JSON content type
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers, // Merge any additional headers
  };

  // Add authorization header if token exists
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Prepare request configuration object
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body to request if it exists and method supports it
  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // Make the HTTP request to the API
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

    // Handle non-successful HTTP responses
    if (!response.ok) {
      // Parse error response first to get detailed error information
      let errorData;
      try {
        // Try to parse error as JSON for structured error handling
        errorData = await response.json();
      } catch (e) {
        // Error response wasn't valid JSON, set to null
        errorData = null;
      }
      
      // Create appropriate error message
      const errorMessage =
        typeof errorData === "object" && errorData !== null && "detail" in errorData
          ? String(errorData.detail) // Use API-provided error message
          : `API Error: ${response.status}`; // Fallback to status code

      // Log error details for debugging
      console.error(`API Error (${response.status}):`, errorMessage, errorData);
      
      // Throw structured API error
      throw new ApiError(response.status, errorMessage, errorData);
    }

    // Handle responses with no content (DELETE, 204 responses)
    if (method === "DELETE" || response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as R; // Return empty object for no-content responses
    }

    // Parse the response based on expected response type
    let data: any;
    if (responseType === "blob") {
      // Handle binary responses (file downloads, etc.)
      data = await response.blob();
    } else {
      // Handle JSON responses with proper content checking
      // Status 204 (No Content) and 205 (Reset Content) should not have a body
      if (response.status === 204 || response.status === 205) {
        // Return null for no-content responses
        data = null;
      } else {
        // Check if response has any content before parsing
        const contentLength = response.headers.get('content-length');
        const hasContent = contentLength === null || parseInt(contentLength, 10) > 0;
        
        if (hasContent) {
          // Try to parse as JSON, but handle empty responses gracefully
          const text = await response.text();
          if (text.trim() === '') {
            data = null; // Empty response body
          } else {
            try {
              data = JSON.parse(text); // Parse JSON response
            } catch (error) {
              console.warn('Failed to parse response as JSON:', text);
              data = null; // Fallback for malformed JSON
            }
          }
        } else {
          data = null; // No content in response
        }
      }
    }

    return data as R; // Return typed response data
  } catch (error) {
    // Catch network errors or JSON parsing errors
    if (!(error instanceof ApiError)) {
      // Log non-API errors for debugging
      console.error("Request failed:", error);
      
      // Wrap network/parsing errors as API errors
      throw new ApiError(0, error instanceof Error ? error.message : "Network error", null);
    }
    
    // Re-throw API errors as-is
    throw error;
  }
}

/**
 * Function to check if a JWT token is expired
 * Decodes JWT payload and checks expiration timestamp
 * 
 * @param token - JWT token string to check
 * @returns Boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    // Extract payload from JWT token (middle section)
    const base64Url = token.split(".")[1];
    
    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decode base64 payload to JSON string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    // Parse JWT payload to extract expiration time
    const { exp } = JSON.parse(jsonPayload);
    
    // Check if expiration timestamp is past current time
    return exp < Date.now() / 1000;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    // If we can't decode the token, assume it's expired to be safe
    return true;
  }
}

/**
 * React hook for making API requests with built-in error handling
 * Provides convenient methods for different HTTP verbs with authentication
 * 
 * @returns Object with methods for making typed API requests
 */
export function useApi() {
  const router = useRouter();

  /**
   * Internal request wrapper that handles authentication errors
   * Automatically redirects to login on 401 errors
   */
  const request = async <R, T = Record<string, unknown>>(
    endpoint: string,
    options: RequestOptions<T> = {}
  ): Promise<R> => {
    try {
      return await apiRequest<R, T>(endpoint, options);
    } catch (error) {
      // Handle authentication errors by redirecting to login
      if (error instanceof ApiError && error.status === 401) {
        // Only redirect if we're in the browser environment
        if (typeof window !== "undefined") {
          router.push("/login");
        }
      }
      throw error; // Re-throw all errors after handling auth
    }
  };

  // Return object with convenience methods for different HTTP verbs
  return {
    /**
     * Make a GET request
     * @param endpoint - API endpoint
     * @param options - Request options (excluding method)
     */
    get: <R>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
      request<R>(endpoint, { ...options, method: "GET" }),

    /**
     * Make a POST request with body data
     * @param endpoint - API endpoint
     * @param body - Request body data
     * @param options - Additional request options
     */
    post: <R, T = Record<string, unknown>>(
      endpoint: string,
      body: T,
      options?: Omit<RequestOptions<T>, "method" | "body">
    ) => request<R, T>(endpoint, { ...options, method: "POST", body }),

    /**
     * Make a PUT request with body data
     * @param endpoint - API endpoint
     * @param body - Request body data
     * @param options - Additional request options
     */
    put: <R, T = Record<string, unknown>>(
      endpoint: string,
      body: T,
      options?: Omit<RequestOptions<T>, "method" | "body">
    ) => request<R, T>(endpoint, { ...options, method: "PUT", body }),

    /**
     * Make a PATCH request with body data
     * @param endpoint - API endpoint
     * @param body - Request body data
     * @param options - Additional request options
     */
    patch: <R, T = Record<string, unknown>>(
      endpoint: string,
      body: T,
      options?: Omit<RequestOptions<T>, "method" | "body">
    ) => request<R, T>(endpoint, { ...options, method: "PATCH", body }),

    /**
     * Make a DELETE request
     * @param endpoint - API endpoint
     * @param options - Request options (excluding method)
     */
    delete: <R>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
      request<R>(endpoint, { ...options, method: "DELETE" }),
  };
}

// localStorage helper functions for managing local storage with event dispatch

/**
 * Sets an item in localStorage and dispatches a custom event to notify other components
 * Prevents unnecessary events if the value hasn't actually changed
 * 
 * @param key - localStorage key
 * @param value - Value to store
 */
export function setLocalStorageItem(key: string, value: string): void {
  // Ensure we're in browser environment
  if (typeof window === "undefined") return;

  // Check if the value is actually changing to avoid unnecessary events
  const currentValue = localStorage.getItem(key);
  if (currentValue === value) {
    // Value hasn't changed, no need to dispatch event
    return;
  }

  // Store the new value
  localStorage.setItem(key, value);

  // Dispatch custom event to notify other components of the change
  window.dispatchEvent(new CustomEvent("companyChanged", { detail: { key, value } }));
}

/**
 * Removes an item from localStorage and dispatches a custom event
 * Only dispatches event if there was actually a value to remove
 * 
 * @param key - localStorage key to remove
 */
export function removeLocalStorageItem(key: string): void {
  // Ensure we're in browser environment
  if (typeof window === "undefined") return;

  // Check if there was actually a value to remove
  const hadValue = localStorage.getItem(key) !== null;

  // Remove the item
  localStorage.removeItem(key);

  // Only dispatch event if there was actually a value removed
  if (hadValue) {
    window.dispatchEvent(new CustomEvent("companyChanged", { detail: { key, value: null } }));
  }
}

/**
 * Gets an item from localStorage with browser-safe access
 * Returns null during server-side rendering
 * 
 * @param key - localStorage key to retrieve
 * @returns Stored value or null if not found/not in browser
 */
export function getLocalStorageItem(key: string): string | null {
  // Return null during server-side rendering
  if (typeof window === "undefined") return null;

  return localStorage.getItem(key);
}
