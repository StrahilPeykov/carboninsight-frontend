"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/PopupModal";
import { userApi } from "@/lib/api/userApi";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

/**
 * Account Settings Page Component
 * 
 * This component provides a comprehensive account management interface where users can:
 * - Update their personal profile information (name, email)
 * - Change their password securely
 * - Delete their account permanently
 * 
 * Features:
 * - Form validation with field-specific error handling
 * - Password change with confirmation matching
 * - Account deletion with confirmation safeguards
 * - Authentication requirements and redirects
 * - Success/error message display
 * - Loading states and disabled form elements during operations
 */
export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading, requireAuth } = useAuth();

  // Require authentication for this page - redirect to login if not authenticated
  requireAuth();

  // Loading and operation states for different sections
  const [isSaving, setIsSaving] = useState(false);              // Profile update loading state
  const [isDeleting, setIsDeleting] = useState(false);         // Account deletion loading state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete confirmation modal
  const [confirmInput, setConfirmInput] = useState("");        // User input for deletion confirmation
  const isConfirmMatch = user?.username ? confirmInput === user.username : false; // Validation for deletion

  // Password change states and UI toggles
  const [showPasswordForm, setShowPasswordForm] = useState(false);       // Toggle password change form
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false); // Password change loading state

  // Error and success message states for user feedback
  const [error, setError] = useState<string | null>(null);       // General error messages
  const [success, setSuccess] = useState<string | null>(null);   // Success messages

  // Form data state management for profile information
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
  }>({
    first_name: "",
    last_name: "",
    email: "",
  });

  // Password change form data with current and new password fields
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  /**
   * Initialize form data when user information becomes available
   * This effect runs when the user object changes (after authentication)
   */
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  /**
   * Handle profile form input changes
   * Updates the form data state as user types in profile fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle password form input changes
   * Updates password data state for all password-related fields
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle profile information update submission
   * Validates data, calls API, and provides user feedback
   */
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      // Update user profile via API using centralized user service
      await userApi.updateProfile(formData);
      setSuccess("Your profile has been updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Display user-friendly error message
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle password change submission
   * Validates new password confirmation and submits to API
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPasswordSubmitting(true);

    // Client-side validation for password confirmation match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords don't match.");
      setIsPasswordSubmitting(false);
      return;
    }

    try {
      // Change password via API with proper parameter mapping
      await userApi.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password,
      });

      setSuccess("Your password has been changed successfully!");

      // Reset password form and hide it after successful change
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  /**
   * Initiate account deletion process
   * Shows confirmation modal to prevent accidental deletions
   */
  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setConfirmInput("");
  };

  /**
   * Confirm and execute account deletion
   * Performs deletion, cleans up local data, and redirects user
   */
  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Delete the account via API
      await userApi.deleteAccount();

      // Show success message briefly before logout
      setSuccess("Account successfully deleted. Redirecting to login...");

      // Clear all user-related localStorage data to ensure clean logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_company_id");
        localStorage.removeItem("currentAssessmentId"); // For future PCF calculation data
      }

      // Brief delay to show success message before redirecting
      setTimeout(() => {
        logout(); // This handles token cleanup and redirect to /login
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Show loading skeleton while authentication state is being determined
  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header with title and description */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Account Settings
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Manage your personal information and account preferences
        </p>
      </div>

      {/* Global error message display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Global success message display */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Information Section */}
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Name fields in a responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Email field - full width */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Save button with loading state */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Section - Password Management */}
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Security</h2>

          {/* Password change toggle or form display */}
          {!showPasswordForm ? (
            // Password change invitation when form is hidden
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </Button>
            </div>
          ) : (
            // Password change form when visible
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current password field */}
              <div>
                <label
                  htmlFor="current_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Current Password
                </label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* New password field with validation help text */}
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters
                </p>
              </div>

              {/* Confirm password field */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Form action buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    // Reset password form data when canceling
                    setPasswordData({
                      current_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting ? "Changing..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Account Management Section - Dangerous Actions */}
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Account Management</h2>

          {/* Account deletion warning section */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-900">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Delete Account</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">
              Once you delete your account, there is no going back. This action cannot be undone and
              all your data will be permanently removed.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                {isDeleting ? "Processing..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Account Deletion Confirmation Modal */}
        {showDeleteConfirm && (
          <Modal
            title="Confirm Delete Account"
            confirmationRequiredText={user?.username}
            confirmLabel="Delete My Account"
            onConfirm={confirmDeleteAccount}
            onClose={() => {
              setShowDeleteConfirm(false);
              setConfirmInput("");
            }}
          >
            <div className="space-y-4">
              {/* Warning message and consequences list */}
              <p className="text-sm text-grey-400 dark:white">
                Are you sure you want to delete your account? This action will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 dark:text-white space-y-1">
                <li>Permanently delete your account and profile</li>
                <li>Remove you from all companies you have access to</li>
                <li>Delete all your personal data and calculation history</li>
                <li>Log you out and redirect to the login page</li>
              </ul>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                This action cannot be undone.
              </p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
