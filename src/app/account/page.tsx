// Next.js directive to force client-side rendering for this component
// This is necessary because the component uses browser-specific APIs like localStorage
// and requires user authentication state management that depends on client-side execution
"use client";

// React hooks for state management and lifecycle control
// useEffect: Manages side effects like populating form data when user data loads
// useState: Handles multiple pieces of local component state for form management
import { useEffect, useState } from "react";
// UI components from the local design system
// Card: Provides consistent styling and layout structure for content sections
// Button: Standardized button component with consistent styling and accessibility features
// Modal: Popup component for confirmation dialogs and critical user actions
// LoadingSkeleton: Placeholder component shown during data loading states
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/PopupModal";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
// Authentication context hook for managing user login state and authentication requirements
// Provides access to current user data, logout functionality, and authentication guards
import { useAuth } from "../context/AuthContext";
// API service for user-related operations like profile updates, password changes, and account deletion
// Centralizes all user data management and provides consistent error handling across the application
import { userApi } from "@/lib/api/userApi";

<<<<<<< HEAD
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
=======
// Main account management page component that allows users to view and modify their account settings
// This component handles three main sections: profile information, security (password), and account deletion
// It includes comprehensive form validation, error handling, and user feedback mechanisms
>>>>>>> main
export default function AccountPage() {
  // Extract authentication-related functions and state from the auth context
  // user: Contains current user's profile information (name, email, username, etc.)
  // logout: Function to clear authentication state and redirect to login page
  // isLoading: Boolean indicating if authentication state is still being determined
  // requireAuth: Function that enforces authentication requirement for this page
  const { user, logout, isLoading, requireAuth } = useAuth();

<<<<<<< HEAD
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
=======
  // Enforce authentication requirement for accessing this page
  // This will redirect unauthenticated users to the login page automatically
  // Must be called at the component level to ensure proper authentication flow
  requireAuth();

  // State management for various UI and form states throughout the component
  // These states control loading indicators, form visibility, and user interactions

  // Loading state for profile information save operation
  // Controls the save button disabled state and loading text during API calls
  const [isSaving, setIsSaving] = useState(false);
  
  // Loading state for account deletion process
  // Prevents multiple deletion requests and shows processing feedback to user
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Controls visibility of the account deletion confirmation modal
  // Modal includes username confirmation requirement for security
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Stores user input for username confirmation in delete account flow
  // Must match exactly with user's actual username to enable deletion
  const [confirmInput, setConfirmInput] = useState("");
  
  // Boolean flag that determines if the confirmation input matches the username
  // Used to enable/disable the final delete confirmation button for safety
  const isConfirmMatch = user?.username ? confirmInput === user.username : false;

  // Password-related state management for the security section
  // Controls the visibility and submission state of the password change form
  
  // Toggle state for showing/hiding the password change form
  // Allows users to expand the password section when needed
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Loading state specifically for password change operations
  // Prevents multiple simultaneous password change requests
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Global error and success message state for user feedback
  // These messages appear at the top of the page to inform users of operation results
  
  // Error message state - displays API errors or validation failures
  // Cleared before each new operation to prevent stale error messages
  const [error, setError] = useState<string | null>(null);
  
  // Success message state - displays confirmation of successful operations
  // Provides positive feedback for completed actions like profile updates
  const [success, setSuccess] = useState<string | null>(null);

  // Form data state for profile information editing
  // Mirrors the user's profile fields and allows for temporary modifications before saving
  // TypeScript interface ensures type safety for form field names and values
>>>>>>> main
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
  }>({
    first_name: "",
    last_name: "",
    email: "",
  });

<<<<<<< HEAD
  // Password change form data with current and new password fields
=======
  // Form data state for password change functionality
  // Includes current password for verification and new password with confirmation
  // All fields are required and new password fields must match for validation
>>>>>>> main
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

<<<<<<< HEAD
  /**
   * Initialize form data when user information becomes available
   * This effect runs when the user object changes (after authentication)
   */
=======
  // Effect to populate form data when user information becomes available
  // This runs whenever the user object changes (e.g., after login or data refresh)
  // Handles cases where user data might be null initially during authentication loading
>>>>>>> main
  useEffect(() => {
    if (user) {
      // Populate form fields with current user data, using empty strings as fallbacks
      // This ensures form fields are never undefined and provides a clean editing experience
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

<<<<<<< HEAD
  /**
   * Handle profile form input changes
   * Updates the form data state as user types in profile fields
   */
=======
  // Generic form input change handler for profile information fields
  // Uses controlled components pattern to maintain form state in React
  // Dynamically updates the appropriate field based on input name attribute
>>>>>>> main
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Spread operator preserves existing form data while updating only the changed field
    // This pattern ensures immutability and proper React re-rendering
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

<<<<<<< HEAD
  /**
   * Handle password form input changes
   * Updates password data state for all password-related fields
   */
=======
  // Specialized form input change handler for password-related fields
  // Separate from profile handler to maintain clear separation of concerns
  // Manages current password, new password, and confirmation fields independently
>>>>>>> main
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Similar immutable update pattern for password form state
    // Ensures password fields are managed separately from profile data
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

<<<<<<< HEAD
  /**
   * Handle profile information update submission
   * Validates data, calls API, and provides user feedback
   */
=======
  // Async function to handle profile information form submission
  // Manages the complete flow: validation, API call, state updates, and user feedback
  // Includes comprehensive error handling and loading state management
>>>>>>> main
  const handleProfileSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission to handle with JavaScript
    // This allows for custom validation and API integration
    e.preventDefault();
    
    // Clear any existing messages to provide fresh feedback for this operation
    // Ensures users see relevant messages for the current action
    setError(null);
    setSuccess(null);
    
    // Set loading state to disable form and show progress indicator
    // Prevents duplicate submissions and provides visual feedback
    setIsSaving(true);

    try {
<<<<<<< HEAD
      // Update user profile via API using centralized user service
=======
      // Call the centralized API service to update user profile
      // This abstracts the HTTP request details and provides consistent error handling
>>>>>>> main
      await userApi.updateProfile(formData);
      
      // Display success message to confirm the operation completed successfully
      // Provides positive feedback and reassurance to the user
      setSuccess("Your profile has been updated successfully!");
    } catch (error) {
      // Log error for debugging purposes while providing user-friendly error message
      // Console logging helps with development and production troubleshooting
      console.error("Error updating profile:", error);
<<<<<<< HEAD
      // Display user-friendly error message
=======
      
      // Extract meaningful error message from Error object or provide fallback
      // Type guard ensures safe access to error message property
>>>>>>> main
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      // Always reset loading state regardless of success or failure
      // Ensures UI returns to interactive state after operation completes
      setIsSaving(false);
    }
  };

<<<<<<< HEAD
  /**
   * Handle password change submission
   * Validates new password confirmation and submits to API
   */
=======
  // Async function to handle password change form submission
  // Includes client-side validation for password confirmation matching
  // Manages API communication and provides comprehensive user feedback
>>>>>>> main
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Reset message states for clean feedback on new operation
    setError(null);
    setSuccess(null);
    
    // Set loading state to indicate processing and prevent duplicate submissions
    setIsPasswordSubmitting(true);

<<<<<<< HEAD
    // Client-side validation for password confirmation match
=======
    // Client-side validation: ensure new password fields match
    // This provides immediate feedback without requiring server round-trip
>>>>>>> main
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords don't match.");
      setIsPasswordSubmitting(false);
      return;
    }

    try {
<<<<<<< HEAD
      // Change password via API with proper parameter mapping
=======
      // Call API service with properly formatted password change data
      // API expects specific field names for old and new password validation
>>>>>>> main
      await userApi.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password,
      });

      // Provide success feedback to confirm password was changed
      setSuccess("Your password has been changed successfully!");

<<<<<<< HEAD
      // Reset password form and hide it after successful change
=======
      // Clear sensitive password data from state for security
      // Prevents password information from remaining in component memory
>>>>>>> main
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      
      // Hide the password form after successful submission
      // Returns user to the clean security section view
      setShowPasswordForm(false);
    } catch (error) {
      // Log error details for debugging while showing user-friendly message
      console.error("Error changing password:", error);
      
      // Extract and display appropriate error message to user
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      // Reset loading state to restore form interactivity
      setIsPasswordSubmitting(false);
    }
  };

<<<<<<< HEAD
  /**
   * Initiate account deletion process
   * Shows confirmation modal to prevent accidental deletions
   */
=======
  // Function to initiate the account deletion confirmation process
  // Opens the confirmation modal and resets any previous confirmation input
  // Provides a deliberate, multi-step process for this destructive action
>>>>>>> main
  const handleDeleteAccount = () => {
    // Show the deletion confirmation modal
    setShowDeleteConfirm(true);
    
    // Clear any previous confirmation input to ensure fresh validation
    setConfirmInput("");
  };

<<<<<<< HEAD
  /**
   * Confirm and execute account deletion
   * Performs deletion, cleans up local data, and redirects user
   */
=======
  // Async function to execute the actual account deletion after confirmation
  // Handles the complete deletion flow: API call, cleanup, user feedback, and logout
  // Includes comprehensive error handling and graceful user experience
>>>>>>> main
  const confirmDeleteAccount = async () => {
    // Set deletion loading state to prevent multiple deletion attempts
    setIsDeleting(true);
    
    // Clear any existing error messages for clean feedback
    setError(null);

    try {
      // Execute account deletion via API service
      // This is the point of no return for the user's account and data
      await userApi.deleteAccount();

      // Provide immediate feedback about successful deletion
      // Brief message before automatic logout and redirect
      setSuccess("Account successfully deleted. Redirecting to login...");

<<<<<<< HEAD
      // Clear all user-related localStorage data to ensure clean logout
=======
      // Clean up browser storage of user-related data
      // Ensures no stale data remains after account deletion
>>>>>>> main
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_company_id");
        localStorage.removeItem("currentAssessmentId"); // For future PCF calculation data
      }

<<<<<<< HEAD
      // Brief delay to show success message before redirecting
=======
      // Delay logout slightly to allow user to see success message
      // Provides closure and confirmation before redirect to login
>>>>>>> main
      setTimeout(() => {
        logout(); // This handles token cleanup and redirect to /login
      }, 1500);
    } catch (error) {
      // Log deletion error for debugging purposes
      console.error("Error deleting account:", error);
      
      // Display error message and reset relevant states
      // Allows user to retry deletion if needed
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

<<<<<<< HEAD
  // Show loading skeleton while authentication state is being determined
=======
  // Conditional rendering for loading state during authentication initialization
  // Shows skeleton loader while determining user authentication status
  // Prevents flashing of content before authentication is confirmed
>>>>>>> main
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
