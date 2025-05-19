// src/lib/api/apiClient.ts
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
export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions<T = Record<string, unknown>> {
  method?: RequestMethod;
  body?: T;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

// Core API client function
export async function apiRequest<R, T = Record<string, unknown>>(
  endpoint: string,
  options: RequestOptions<T> = {}
): Promise<R> {
  const { method = "GET", body, headers = {}, requiresAuth = true } = options;

  // Get authentication token if required
  const token = requiresAuth ? localStorage.getItem("access_token") : null;

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

      throw new ApiError(response.status, errorMessage, data);
    }

    return data as R;
  } catch (error) {
    // Catch network errors or JSON parsing errors
    if (!(error instanceof ApiError)) {
      throw new ApiError(0, error instanceof Error ? error.message : "Network error", null);
    }
    throw error;
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
