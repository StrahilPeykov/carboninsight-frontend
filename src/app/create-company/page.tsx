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

export default function CreateCompanyPage() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const [formData, setFormData] = useState<CompanyCreateData>({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submission starting");
    e.preventDefault();
    console.log("preventDefault called");
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      console.log("About to call API");
      const newCompany = await companyApi.createCompany(formData);
      console.log("API call successful");

      setNewCompanyId(newCompany.id);

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      console.log("Error caught:", err);

      // Handle validation errors from API
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const errorResponse = err.data as { type: string, errors: Array<{ attr: string, code: string, detail: string }> };
        
        if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
          // Process field-specific errors
          const newFieldErrors: { [key: string]: string[] } = {};
          
          // Group error messages by field
          errorResponse.errors.forEach(error => {
            if (!newFieldErrors[error.attr]) {
              newFieldErrors[error.attr] = [];
            }
            newFieldErrors[error.attr].push(error.detail);
          });
          
          setFieldErrors(newFieldErrors);
          
          // Only display non-field errors at the top
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

  const handleModalConfirmation = () => {
    setShowSuccessModal(false);
    
    // Navigate first
    router.push("/dashboard");
    
    // Set localStorage after navigation starts
    setTimeout(() => {
      setLocalStorageItem("selected_company_id", newCompanyId);
      
      // Dispatch them events after a short delay
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("companyListChanged"));
        window.dispatchEvent(new CustomEvent("companyChanged"));
      }
    }, 200); // Small delay gives navigation time to start
  };

  const isDisabled = isSubmitting;

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
          Create company
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Enter company data to register company and start calculating carbon footprints
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name[0]}</p>
            )}
          </div>

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
            {fieldErrors.vat_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.vat_number[0]}
              </p>
            )}
          </div>

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
            {fieldErrors.business_registration_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.business_registration_number[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isSubmitting ? "Creating company..." : "Submit"}
          </Button>
        </form>
        {/* Success Modal */}
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
