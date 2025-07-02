"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PopupModal from "../components/ui/PopupModal";
import { useAuth } from "../context/AuthContext";
import { companyApi, CompanyCreateData } from "@/lib/api/companyApi";
import { ApiError } from "@/lib/api/apiClient";
import { setLocalStorageItem } from "@/lib/api/apiClient";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

/**
 * Create Company Page Component
 * 
 * This component provides a form interface for creating new companies within CarbonInsight.
 * It handles the complete company creation workflow from form input to navigation.
 * 
 * Key Features:
 * - Form validation with field-specific error handling
 * - API integration for company creation
 * - Success modal with automatic navigation
 * - Authentication requirements and loading states
 * - Local storage management for company selection
 * - Event dispatching for UI synchronization
 * 
 * Form Fields:
 * - Business name (required)
 * - VAT number (required)
 * - Business registration number (required)
 */
export default function CreateCompanyPage() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page - redirects to login if not authenticated
  requireAuth();

  // Company form data state matching the API interface
  const [formData, setFormData] = useState<CompanyCreateData>({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  
  // Error handling and validation states
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  
  // Success modal and navigation states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState<string>("");

  /**
   * Handle form input changes
   * Updates the form data state as user types in any field
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   * Validates data, creates company via API, and manages UI state
   */
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submission starting");
    e.preventDefault();
    console.log("preventDefault called");
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      console.log("About to call API");
      // Create new company via API with form data
      const newCompany = await companyApi.createCompany(formData);
      console.log("API call successful");

      // Store company ID for success modal and subsequent navigation
      setNewCompanyId(newCompany.id);

      // Show success modal instead of immediate navigation
      setShowSuccessModal(true);
    } catch (err) {
      console.log("Error caught:", err);

      // Handle API validation errors with structured error format
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const errorResponse = err.data as { type: string, errors: Array<{ attr: string, code: string, detail: string }> };
        
        if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
          // Process field-specific errors for display under form fields
          const newFieldErrors: { [key: string]: string[] } = {};
          
          // Group error messages by field attribute
          errorResponse.errors.forEach(error => {
            if (!newFieldErrors[error.attr]) {
              newFieldErrors[error.attr] = [];
            }
            newFieldErrors[error.attr].push(error.detail);
          });
          
          setFieldErrors(newFieldErrors);
          
          // Only display non-field errors at the top of the form
          const nonFieldErrors = newFieldErrors['non_field_errors'] || [];
          if (nonFieldErrors.length > 0) {
            setError(nonFieldErrors.join('. '));
          } else {
            // Don't show any general error if there are no non-field errors
            setError("");
          }
        } else {
          setError("Invalid response format from server");
        }
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    } finally {
      console.log("Submit handling complete");
      setIsSubmitting(false);
    }
  };

  /**
   * Handle success modal confirmation
   * Navigates to dashboard and sets up the new company as selected
   */
  const handleModalConfirmation = () => {
    setShowSuccessModal(false);
    
    // Navigate to dashboard first to ensure proper route handling
    router.push("/dashboard");
    
    // Set localStorage after navigation starts to prevent timing issues
    setTimeout(() => {
      setLocalStorageItem("selected_company_id", newCompanyId);
      
      // Dispatch events after a short delay to ensure UI components are ready
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("companyListChanged"));
        window.dispatchEvent(new CustomEvent("companyChanged"));
      }
    }, 200); // Small delay gives navigation time to start
  };

  // Determine if form should be disabled during operations
  const isDisabled = isSubmitting;

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
      {/* Page header with descriptive title and instructions */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Create company
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Enter company data to register company and start calculating carbon footprints
        </p>
      </div>

      {/* Company creation form */}
      <Card className="max-w-md mx-auto">
        {/* General error message display */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business name field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Business name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="organization"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isDisabled}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {/* Field-specific error display */}
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* VAT number field */}
          <div>
            <label
              htmlFor="vat_number"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              VAT number
            </label>
            <input
              type="text"
              id="vat_number"
              name="vat_number"
              autoComplete="off"
              value={formData.vat_number}
              onChange={handleChange}
              required
              disabled={isDisabled}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {/* Field-specific error display */}
            {fieldErrors.vat_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.vat_number[0]}
              </p>
            )}
          </div>

          {/* Business registration number field */}
          <div>
            <label
              htmlFor="business_registration_number"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Business registry number
            </label>
            <input
              type="text"
              id="business_registration_number"
              name="business_registration_number"
              autoComplete="off"
              value={formData.business_registration_number}
              onChange={handleChange}
              required
              disabled={isDisabled}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {/* Field-specific error display */}
            {fieldErrors.business_registration_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.business_registration_number[0]}
              </p>
            )}
          </div>

          {/* Submit button with loading state */}
          <Button type="submit" disabled={isDisabled} className="w-full">
            {isSubmitting ? "Creating company..." : "Submit"}
          </Button>
        </form>
        
        {/* Success Modal - shown after successful company creation */}
        {showSuccessModal && (
          <PopupModal
            title="Company created successfully!"
            confirmLabel="Ok"
            showCancel={false}
            onConfirm={handleModalConfirmation}
            onClose={handleModalConfirmation}
          >
            <p className="text-gray-800 dark:text-gray-200">
              Your company has been successfully created. You can now start managing your carbon footprint data.
            </p>
          </PopupModal>
        )}
      </Card>
    </div>
  );
}
