// Next.js directive to force client-side rendering for this component
// Required because this component uses browser APIs like localStorage, sessionStorage,
// and custom window events that are only available in the browser environment
// Also needed for proper router functionality and state management
"use client";

// React hooks for state management and lifecycle control
// useEffect: Manages component lifecycle events and side effects like data fetching
// useState: Handles local component state for form data, loading states, and error management
import { useEffect, useState } from "react";
// Next.js router hook for programmatic navigation between pages
// Provides client-side routing with support for redirects and navigation control
import { useRouter } from "next/navigation";
// UI components from the local design system for consistent styling and functionality
// Card: Container component for grouping related content with consistent styling
// Button: Interactive element with standardized styling and accessibility features
// PopupModal: Modal dialog component for confirmation flows and user interactions
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PopupModal from "../components/ui/PopupModal";
// API service and type definitions for company-related operations
// companyApi: Centralized service for all company CRUD operations
// CompanyCreateData: TypeScript interface defining the structure of company data
import { companyApi, CompanyCreateData } from "@/lib/api/companyApi";
// Custom error class for handling API-specific errors with structured error data
// Provides better error handling and user feedback for API operation failures
import { ApiError } from "@/lib/api/apiClient";

// Main component for displaying and editing company details
// Handles company information modification, deletion, and related state management
// Includes comprehensive error handling, validation feedback, and user confirmation flows
export default function CompanyDetailsPage() {
  // Next.js router instance for programmatic navigation
  // Used for redirecting users when company ID is missing or after successful operations
  const router = useRouter();

  // Form data state that mirrors the CompanyCreateData interface
  // Manages the current values of all editable company fields
  // Initialized with empty strings to ensure controlled components
  const [formData, setFormData] = useState<CompanyCreateData>({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  
  // Loading state for general operations like data fetching and form submission
  // Controls UI elements like loading indicators and disabled states during async operations
  const [isLoading, setIsLoading] = useState(false);
  
  // General error message state for displaying operation failures to users
  // Cleared before each new operation to provide fresh feedback
  const [error, setError] = useState("");
  
  // Success message state for confirming completed operations
  // Provides positive feedback to users after successful actions
  const [successMessage, setSuccessMessage] = useState("");
  
  // Field-specific validation errors returned from the API
  // Maps field names to arrays of error messages for precise user feedback
  // Structure: { field_name: ["error message 1", "error message 2"] }
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  
  // Current company identifier retrieved from localStorage
  // Used for all API operations and determines which company data to load/modify
  const [companyId, setCompanyId] = useState<string | null>(null);

  // State management for company deletion confirmation flow
  // These states control the multi-step deletion process with user confirmation
  
  // Controls visibility of the deletion confirmation modal
  // Modal requires explicit user confirmation before proceeding with deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // User input for company name confirmation in deletion flow
  // Must match exactly with actual company name to enable deletion
  const [confirmInput, setConfirmInput] = useState("");
  
  // Loading state specific to the deletion operation
  // Prevents multiple deletion attempts and provides user feedback during processing
  const [isDeleting, setIsDeleting] = useState(false);

  // Effect 1: Initialize component by retrieving selected company ID from localStorage
  // This effect runs on component mount to determine which company to display/edit
  // Redirects to company list if no company is selected, ensuring proper navigation flow
  useEffect(() => {
    // Retrieve the currently selected company ID from browser storage
    // This ID is set when user selects a company from the company list page
    const id = localStorage.getItem("selected_company_id");
    
    // Guard clause: redirect to company list if no company is selected
    // Prevents users from accessing this page without a valid company context
    if (!id) {
      router.push("/list-companies");
      return;
    }
    
    // Set the company ID in component state to trigger data fetching
    // This will cause the second useEffect to run and load company data
    setCompanyId(id);
  }, [router]);

  // Effect 2: Fetch company data when company ID becomes available
  // Loads the current company information and populates the form for editing
  // Includes error handling for failed data retrieval attempts
  useEffect(() => {
    // Guard clause: only proceed if company ID is available
    // Prevents unnecessary API calls when component is still initializing
    if (!companyId) return;
    
    // Set loading state to show progress indicator to user
    // Prevents form interaction while data is being fetched
    setIsLoading(true);
    
    // Fetch company data using the centralized API service
    // Chain promises to handle success, error, and completion scenarios
    companyApi
      .getCompany(companyId)
      // On successful data retrieval, populate the form with company information
      // This allows users to see current values and make modifications
      .then(data => setFormData(data))
      // On error, display user-friendly error message without exposing technical details
      // Provides fallback behavior when company data cannot be loaded
      .catch(() => setError("Could not load company data."))
      // Always reset loading state regardless of success or failure
      // Ensures UI returns to interactive state after operation completes
      .finally(() => setIsLoading(false));
  }, [companyId]);

  // Effect 3: Check for success message persistence across page reloads
  // Restores success messages that were stored in sessionStorage during previous operations
  // This pattern maintains user feedback even if the page is refreshed after an action
  useEffect(() => {
    // Browser environment check to ensure sessionStorage is available
    // Prevents errors during server-side rendering or in non-browser environments
    if (typeof window !== "undefined" && sessionStorage.getItem("company_edit_success")) {
      // Display the persisted success message to provide continued user feedback
      // This ensures users see confirmation even after page navigation or refresh
      setSuccessMessage("Company data successfully edited!");
      
      // Clean up the stored success flag to prevent message from persisting indefinitely
      // Ensures the message only appears once per successful operation
      sessionStorage.removeItem("company_edit_success");
    }
  }, []);

  // Generic form input change handler for all company data fields
  // Implements controlled component pattern for form state management
  // Updates the appropriate field in formData based on input name attribute
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Use functional state update to ensure immutability and proper React re-rendering
    // Spread operator preserves existing form data while updating only the changed field
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Async function to handle form submission and company data updates
  // Manages the complete update flow: validation, API call, success handling, and error management
  // Includes comprehensive state management and user feedback mechanisms
  const handleSave = async (e: React.FormEvent) => {
    // Prevent default form submission to handle with custom JavaScript logic
    // Allows for custom validation, API integration, and user feedback
    e.preventDefault();
    
    // Clear previous messages and errors to provide fresh feedback for this operation
    // Ensures users see relevant information for the current action attempt
    setError("");
    setSuccessMessage("");
    setFieldErrors({});
    
    // Set loading state to indicate processing and prevent duplicate submissions
    // Provides visual feedback and ensures data integrity during API operations
    setIsLoading(true);

    // Validation: ensure company ID is available before proceeding
    // Guards against edge cases where component state might be inconsistent
    if (!companyId) {
      setError("No company ID available");
      setIsLoading(false);
      return;
    }

    try {
      // Call the API service to update company information
      // Trim whitespace from all fields to ensure clean data storage
      await companyApi.updateCompany(companyId, {
        name: formData.name.trim(),
        vat_number: formData.vat_number.trim(),
        business_registration_number: formData.business_registration_number.trim(),
      });

      // Provide immediate success feedback to confirm operation completion
      // Gives users confidence that their changes have been saved
      setSuccessMessage("Company data successfully edited!");
      setIsLoading(false);

      // Persist success state across potential page reloads or navigation
      // Ensures user feedback is maintained even if they refresh the page
      sessionStorage.setItem("company_edit_success", "true");

      // Delayed notification to other components about company data changes
      // Uses custom events to update UI components that depend on company information
      // Delay allows users to see success message before UI updates occur
      setTimeout(() => {
        if (typeof window !== "undefined") {
          console.log("Company updated - dispatching events");
          // Dispatch custom event with company ID to notify other components
          // Single event dispatch minimizes potential side effects and performance impact
          window.dispatchEvent(new CustomEvent("companyChanged", {
            detail: { companyId }
          }));
        }
      }, 1500); // 1.5 second delay for user experience

      return;
    } catch (err) {
      // Handle structured API errors with field-specific validation messages
      // Provides detailed feedback for validation failures and user input errors
      if (err instanceof ApiError && err.data) {
        // Set field-specific errors for precise user guidance
        // Allows users to understand exactly which fields need correction
        setFieldErrors(err.data as { [key: string]: string[] });
        setError("Please check company details.");
      } else {
        // Handle unexpected errors with generic fallback message
        // Ensures users receive feedback even for unanticipated error scenarios
        setError((err as Error).message || "An unexpected error occurred.");
      }
    } finally {
      // Always reset loading state to restore form interactivity
      // Ensures UI remains responsive regardless of operation outcome
      setIsLoading(false);
    }
  };

  // Function to initiate the company deletion confirmation process
  // Opens the confirmation modal and resets any previous confirmation input
  // Provides a safe, deliberate process for this destructive operation
  const handleDeleteCompany = () => {
    // Clear any previous confirmation input to ensure fresh validation
    // Prevents stale input from accidentally enabling deletion
    setConfirmInput("");
    
    // Show the deletion confirmation modal to user
    // Requires explicit user confirmation before proceeding with deletion
    setShowDeleteConfirm(true);
  };

  // Async function to execute company deletion after user confirmation
  // Handles the complete deletion flow: API call, cleanup, event notification, and navigation
  // Includes comprehensive error handling and user feedback mechanisms
  const confirmDeleteCompany = async () => {
    // Guard clause: ensure company ID is available before proceeding
    // Prevents deletion attempts without valid company context
    if (!companyId) return;
    
    // Set deletion loading state to prevent multiple deletion attempts
    // Provides user feedback during the potentially slow deletion process
    setIsDeleting(true);
    
    // Clear any existing errors to provide fresh feedback for deletion attempt
    setError("");
    
    try {
      // Log deletion attempt for debugging and audit purposes
      // Helps with troubleshooting and tracking user actions
      console.log("About to delete company:", companyId);
      
      // Execute company deletion via API service
      // This is the point of no return for the company data
      await companyApi.deleteCompany(companyId);
      
      // Log successful deletion for confirmation and debugging
      console.log("Company deleted successfully");

      // Clean up browser storage immediately after successful deletion
      // Prevents stale company references from causing issues in other components
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_company_id");

        // Notify other components about company deletion with strategic timing
        // Delayed dispatch ensures proper event processing order
        console.log("Company deleted - dispatching events");
        setTimeout(() => {
          // Dispatch events to update company lists and selection states
          // Multiple events ensure all dependent components are properly updated
          window.dispatchEvent(new CustomEvent("companyListChanged"));
          window.dispatchEvent(new CustomEvent("companyChanged"));
          console.log("Events dispatched");
        }, 50);
      }

      // Navigate back to company list after successful deletion
      // Small delay ensures events are processed before navigation occurs
      setTimeout(() => {
        console.log("Redirecting to list companies");
        router.push("/list-companies");
      }, 200);
    } catch (err) {
      // Log error details for debugging while providing user-friendly feedback
      // Helps with troubleshooting while maintaining good user experience
      console.error("Error deleting company:", err);
      
      // Display appropriate error message to user
      // Provides feedback about deletion failure without exposing technical details
      setError((err as Error).message || "Delete failed");
    } finally {
      // Reset all deletion-related states regardless of operation outcome
      // Ensures clean UI state and prevents stuck loading indicators
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setConfirmInput("");
    }
  };

  // Conditional rendering for loading state during data fetching
  // Shows simple loading indicator while company data is being retrieved
  // Prevents display of empty or inconsistent form data during initialization
  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 flex justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Error message display */}
      {error && <div className="p-4 bg-red-50 text-red-800 rounded">{error}</div>}
      {/* Success message display */}
      {successMessage && (
        <div className="p-4 bg-green-50 text-green-800 rounded">{successMessage}</div>
      )}

      {/* Company Edit Form Section */}
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Company Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Business Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Business Name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="organization"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 p-2 w-full border rounded focus:ring focus:ring-green-300"
            />
            {/* Field-specific error display */}
            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name[0]}</p>}
          </div>
          
          {/* VAT Number Field */}
          <div>
            <label htmlFor="vat_number" className="block text-sm font-medium">
              VAT Number
            </label>
            <input
              id="vat_number"
              name="vat_number"
              autoComplete="off"
              value={formData.vat_number}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded focus:ring focus:ring-green-300"
            />
            {/* Field-specific error display */}
            {fieldErrors.vat_number && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.vat_number[0]}</p>
            )}
          </div>
          
          {/* Business Registration Number Field */}
          <div>
            <label htmlFor="business_registration_number" className="block text-sm font-medium">
              Registration #
            </label>
            <input
              id="business_registration_number"
              name="business_registration_number"
              autoComplete="off"
              value={formData.business_registration_number}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded focus:ring focus:ring-green-300"
            />
            {/* Field-specific error display */}
            {fieldErrors.business_registration_number && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.business_registration_number[0]}
              </p>
            )}
          </div>
          
          {/* Save button with loading state */}
          <div className="text-right">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Company Deletion Section - Dangerous Operations */}
      <Card className="max-w-md mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">Delete Company</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-900">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Delete Company</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-200">
            Permanently delete <strong>{formData.name}</strong>. This cannot be undone.
          </p>
          <div className="mt-4">
            <Button
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? "Deleting…" : "Delete Company"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <PopupModal
          title="Confirm Delete Company"
          confirmationRequiredText={formData.name}
          confirmLabel="Delete Company"
          onConfirm={confirmDeleteCompany}
          onClose={() => {
            setShowDeleteConfirm(false);
            setConfirmInput("");
          }}
        >
          <div className="space-y-4">
            {/* Warning message about deletion consequences */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this company? This action will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>
                Permanently delete the company <strong>{formData.name}</strong> and all associated
                data.
              </li>
            </ul>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              This action cannot be undone.
            </p>
          </div>
        </PopupModal>
      )}
    </div>
  );
}
