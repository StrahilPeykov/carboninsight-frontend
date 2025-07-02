"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { RegisterData } from "@/lib/api/authApi";

/**
 * Field-specific error interface for registration form validation
 * Maps form field names to their corresponding error messages
 */
interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

/**
 * User Registration Page Component
 * 
 * This component provides a comprehensive registration interface for new CarbonInsight users.
 * It handles user account creation with detailed validation and accessibility features.
 * 
 * Key Features:
 * - Multi-field registration form with validation
 * - Field-specific error handling and display
 * - Password confirmation matching validation
 * - Real-time error clearing as users type
 * - Accessible form design with proper labeling
 * - Password security requirements display
 * - Loading states and form disabling during submission
 * - Navigation to login for existing users
 * - Screen reader announcements for status changes
 * - Secure password field clearing on errors
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  // Loading and error state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Registration form data state
  const [formData, setFormData] = useState<RegisterData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  
  // Field-specific error tracking for detailed validation feedback
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /**
   * Render field-specific error messages
   * Displays validation errors directly under the relevant form field
   */
  const renderFieldError = (fieldName: keyof FieldErrors) => {
    if (!fieldErrors[fieldName]) return null;

    return (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert" id={`${fieldName}-error`}>
        {fieldErrors[fieldName]}
      </p>
    );
  };

  /**
   * Handle form input changes with real-time error clearing
   * Updates form data and clears field-specific errors as user types
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form data state
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing for immediate feedback
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Handle registration form submission
   * Validates data, creates account, and manages error states
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({}); // Clear any previous field errors

    try {
      // Attempt user registration via authentication context
      await register(formData);

      // Announce successful registration to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = "Registration successful. Redirecting to home page...";
      document.body.appendChild(announcement);

      // Navigate to home page after successful registration
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (err) {
      // Clear password fields immediately for security when any error occurs
      setFormData(prev => ({
        ...prev,
        password: "",
        confirm_password: ""
      }));

      // Handle structured validation errors from API
      if (err instanceof Error && err.cause) {
        const errorCause = err.cause as any;

        // Check if we have structured validation errors with field mappings
        if (errorCause?.data?.type === 'validation_error' && Array.isArray(errorCause.data.errors)) {
          const newFieldErrors: FieldErrors = {};

          // Map API errors to form fields for display under relevant inputs
          errorCause.data.errors.forEach((error: { attr: string; detail: string }) => {
            if (error.attr && error.detail) {
              newFieldErrors[error.attr as keyof FieldErrors] = error.detail;
            }
          });

          if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);

            // Focus the first field with an error for accessibility
            const firstErrorField = Object.keys(newFieldErrors)[0];
            if (firstErrorField) {
              setTimeout(() => document.getElementById(firstErrorField)?.focus(), 100);
            }
            // Don't set general error when we have field-specific errors
            return;
          }
        }

        // Fall back to general error message if no field errors were found
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header with title and description */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Create an Account
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Join CarbonInsight to start calculating your product carbon footprint
        </p>
      </div>

      {/* Registration form card */}
      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* General error message display */}
          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {/* Name fields in responsive grid layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* First Name Field */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby="first-name-hint"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isLoading}
                className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {/* Field-specific error display */}
              {renderFieldError("first_name")}
              {/* Screen reader hint */}
              <span id="first-name-hint" className="sr-only">
                Enter your first name
              </span>
            </div>

            {/* Last Name Field */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby="last-name-hint"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
                className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {/* Field-specific error display */}
              {renderFieldError("last_name")}
              {/* Screen reader hint */}
              <span id="last-name-hint" className="sr-only">
                Enter your last name
              </span>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby="email-hint"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
            {/* Field-specific error display */}
            {renderFieldError("email")}
            {/* Screen reader hint */}
            <span id="email-hint" className="sr-only">
              Enter your email address
            </span>
          </div>

          {/* Password Field with Security Requirements */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby="password-requirements"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/* Field-specific error display */}
            {renderFieldError("password")}
            {/* Password requirements help text */}
            <p id="password-requirements" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters long and must not be entirely numeric.
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={!!error || formData.password !== formData.confirm_password}
              aria-describedby={
                formData.password !== formData.confirm_password
                  ? "password-mismatch"
                  : "confirm-password-hint"
              }
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/* Field-specific error display */}
            {renderFieldError("confirm_password")}
            {/* Screen reader hint */}
            <span id="confirm-password-hint" className="sr-only">
              Re-enter your password
            </span>
          </div>

          {/* Navigation link to login for existing users */}
          <div className="flex items-center">
            <div className="text-sm">
              <Link
                href="/login"
                className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          {/* Submit button with loading state and accessibility */}
          <div>
            <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? (
                <>
                  <span className="sr-only">Creating account, please wait</span>
                  <span aria-hidden="true">Creating account...</span>
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
