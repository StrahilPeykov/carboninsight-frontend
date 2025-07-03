/**
 * User profile and account management API client
 * Handles user profile operations, account updates, and password changes
 */

import { apiRequest } from "./apiClient";

// Interface representing a user in the system
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// Interface for updating user profile information
export interface UserProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

// Interface for password change operation
export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

/**
 * User management API endpoints
 * Provides methods for user profile and account operations
 */
export const userApi = {
  /**
   * Get the current authenticated user's profile
   * @returns Promise resolving to user profile data
   */
  getProfile: () => apiRequest<User>("/user_profile/"),

  /**
   * Update the current user's profile information
   * Allows partial updates of profile fields
   * @param data - Partial user profile data to update
   * @returns Promise resolving to updated user profile
   */
  updateProfile: (data: UserProfileUpdateData) =>
    apiRequest<User>("/user_profile/", {
      method: "PATCH",
      body: data as unknown as Record<string, unknown>,
    }),

  /**
   * Delete the current user's account permanently
   * This action cannot be undone
   * @returns Promise resolving when deletion is complete
   */
  deleteAccount: () =>
    apiRequest("/user_profile/", {
      method: "DELETE",
    }),

  /**
   * Change the current user's password
   * Requires current password for security verification
   * @param data - Password change data including old and new passwords
   * @returns Promise resolving when password is changed
   */
  changePassword: (data: PasswordChangeData) =>
    apiRequest("/change_password/", {
      method: "POST",
      body: data as unknown as Record<string, unknown>,
    }),
};
