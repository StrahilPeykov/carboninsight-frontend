"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/PopupModal";
import { userApi } from "@/lib/api/userApi";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const isConfirmMatch = user?.username ? confirmInput === user.username : false;

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Error and success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
  }>({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Set page title
  useEffect(() => {
    document.title = "Account Settings - CarbonInsight";
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Enhanced error announcement function
  const announceError = (message: string) => {
    const errorRegion = document.getElementById("error-announcements");
    if (errorRegion) {
      errorRegion.textContent = `Account error: ${message}`;
    }
  };

  // Enhanced success announcement function
  const announceSuccess = (message: string) => {
    const statusRegion = document.getElementById("status-announcements");
    if (statusRegion) {
      statusRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        statusRegion.textContent = "";
      }, 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      // Using userApi.updateProfile instead of direct fetch
      await userApi.updateProfile(formData);
      const successMessage = "Your profile has been updated successfully!";
      setSuccess(successMessage);
      announceSuccess(successMessage);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      announceError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPasswordSubmitting(true);

    if (passwordData.new_password !== passwordData.confirm_password) {
      const errorMessage = "New passwords don't match.";
      setError(errorMessage);
      announceError(errorMessage);
      setIsPasswordSubmitting(false);
      return;
    }

    try {
      // Using userApi.changePassword instead of direct fetch
      await userApi.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password,
      });

      const successMessage = "Your password has been changed successfully!";
      setSuccess(successMessage);
      announceSuccess(successMessage);

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      announceError(errorMessage);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setConfirmInput("");
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Delete the account via API
      await userApi.deleteAccount();

      // Show success message briefly before logout
      const successMessage = "Account successfully deleted. Redirecting to login...";
      setSuccess(successMessage);
      announceSuccess(successMessage);

      // Clear all user-related localStorage data
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_company_id");
        localStorage.removeItem("currentAssessmentId"); // For future PCF calculation data
      }

      // Brief delay to show success message
      setTimeout(() => {
        logout(); // This handles token cleanup and redirect to /login
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      announceError(errorMessage);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Account Settings
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Manage your personal information and account preferences
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300" role="alert" aria-live="assertive">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300" role="status" aria-live="polite">
          <strong>Success:</strong> {success}
        </div>
      )}

      <div className="space-y-8">
        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                  aria-describedby="first-name-hint"
                />
                <span id="first-name-hint" className="sr-only">
                  Enter your first name
                </span>
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
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                  aria-describedby="last-name-hint"
                />
                <span id="last-name-hint" className="sr-only">
                  Enter your last name
                </span>
              </div>
            </div>

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
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSaving}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                aria-describedby="email-hint"
              />
              <span id="email-hint" className="sr-only">
                Enter your email address
              </span>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSaving}
                aria-busy={isSaving}
                aria-describedby={isSaving ? "save-status" : undefined}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              {isSaving && (
                <div id="save-status" className="sr-only" aria-live="polite">
                  Saving your changes, please wait
                </div>
              )}
            </div>
          </form>
        </Card>

        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Security</h2>

          {!showPasswordForm ? (
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(true)}
                aria-label="Change your password"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="current_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Current Password{" "}
                  <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="current_password"
                  name="current_password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  required
                  aria-required="true"
                  disabled={isPasswordSubmitting}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password{" "}
                  <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  aria-required="true"
                  minLength={8}
                  disabled={isPasswordSubmitting}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                  aria-describedby="new-password-requirements"
                />
                <p id="new-password-requirements" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm New Password{" "}
                  <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  aria-required="true"
                  disabled={isPasswordSubmitting}
                  className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                  aria-describedby="confirm-password-hint"
                />
                <span id="confirm-password-hint" className="sr-only">
                  Re-enter your new password
                </span>
                {passwordData.new_password !== passwordData.confirm_password && passwordData.confirm_password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert" aria-live="polite">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      current_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                  }}
                  disabled={isPasswordSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPasswordSubmitting}
                  aria-busy={isPasswordSubmitting}
                >
                  {isPasswordSubmitting ? "Changing..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Account Management</h2>

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
                aria-label="Delete your account permanently"
              >
                {isDeleting ? "Processing..." : "Delete Account"}
              </Button>
            </div>
          </div>
        </Card>

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
