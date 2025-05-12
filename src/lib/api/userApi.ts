import { apiRequest } from "./apiClient";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface UserProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export const userApi = {
  // Get the current user's profile
  getProfile: () => apiRequest<User>("/user_profile/"),

  // Update the current user's profile
  updateProfile: (data: UserProfileUpdateData) =>
    apiRequest<User>("/user_profile/", {
      method: "PATCH",
      body: data,
    }),

  // Delete the current user's account
  deleteAccount: () =>
    apiRequest("/user_profile/", {
      method: "DELETE",
    }),

  // Change the current user's password
  changePassword: (data: PasswordChangeData) =>
    apiRequest("/change_password/", {
      method: "POST",
      body: data,
    }),
};
