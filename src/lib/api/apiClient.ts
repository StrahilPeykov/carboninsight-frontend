import { useRouter } from "next/navigation";

// Base configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Error class for API errors
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Types
export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export interface RequestOptions<T = Record<string, unknown>> {
  method?: RequestMethod;
  body?: T;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

// Function to safely get token from localStorage (browser-safe)
function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("access_token");
}

// Core API client function
export async function apiRequest<R, T = Record<string, unknown>>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<R> {
  const { method = "GET", body, headers = {}, requiresAuth = true } = options;

  // Get authentication token if required
  const token = requiresAuth ? getAuthToken() : null;

  // If auth is required but no token is present, throw an error
  if (requiresAuth && !token) {
    throw new ApiError(401, "Authentication required");
  }

  // Prepare headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add auth header if token exists
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for non-GET requests
  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // Make the request
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

    // Parse response
    let data: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "detail" in data
          ? String(data.detail)
          : `API Error: ${response.status}`;

      console.error(`API Error (${response.status}):`, errorMessage, data);
      throw new ApiError(response.status, errorMessage, data);
    }

    return data as R;
  } catch (error) {
    // Catch network errors or JSON parsing errors
    if (!(error instanceof ApiError)) {
      console.error("Request failed:", error);
      throw new ApiError(0, error instanceof Error ? error.message : "Network error", null);
    }
    throw error;
  }
}

// Function to check if a token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);
    // Check if expiration timestamp is past current time
    return exp < Date.now() / 1000;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    // If we can't decode the token, assume it's expired to be safe
    return true;
  }
}

// React hook for API requests
export function useApi() {
  const router = useRouter();

  const request = async <R, T = Record<string, unknown>>(
    endpoint: string,
    options: RequestOptions<T> = {}
  ): Promise<R> => {
    try {
      return await apiRequest<R, T>(endpoint, options);
    } catch (error) {
      // Handle authentication errors by redirecting to login
      if (error instanceof ApiError && error.status === 401) {
        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          router.push("/login");
        }
      }
      throw error;
    }
  };

  return {
    get: <R>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
      request<R>(endpoint, { ...options, method: "GET" }),

    post: <R, T = Record<string, unknown>>(
      endpoint: string,
      body: T,
      options?: Omit<RequestOptions<T>, "method" | "body">
    ) => request<R, T>(endpoint, { ...options, method: "POST", body }),

    put: <R, T = Record<string, unknown>>(
      endpoint: string,
      body: T,
      options?: Omit<RequestOptions<T>, "method" | "body">
    ) => request<R, T>(endpoint, { ...options, method: "PUT", body }),

    patch: <R, T = Record<string, unknown>>(
      endpoint: string,
      body: T,
      options?: Omit<RequestOptions<T>, "method" | "body">
    ) => request<R, T>(endpoint, { ...options, method: "PATCH", body }),

    delete: <R>(endpoint: string, options?: Omit<RequestOptions, "method">) =>
      request<R>(endpoint, { ...options, method: "DELETE" }),
  };
}

// localStorage helper functions

// Sets an item in localStorage and dispatches a custom event to notify other components
export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, value);

  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent("companyChanged", { detail: { key, value } }));
}

// Removes an item from localStorage and dispatches a custom event
export function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(key);

  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent("companyChanged", { detail: { key, value: null } }));
}

// Gets an item from localStorage
export function getLocalStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(key);
}
