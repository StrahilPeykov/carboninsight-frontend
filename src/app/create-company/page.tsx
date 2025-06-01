"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});
    setSuccessMessage("");

    try {
      // Using companyApi instead of direct fetch
      const newCompany = await companyApi.createCompany(formData);

      setSuccessMessage("Company successfully created!");

      // Store the new company ID in localStorage using the helper function
      setLocalStorageItem("selected_company_id", newCompany.id);

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/company-details");
      }, 2000);
    } catch (err) {
      console.error("Error creating company:", err);

      // Handle validation errors from API
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        setFieldErrors(err.data as { [key: string]: string[] });
        setError("Please check company details.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || !!successMessage;

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
          Enter company data to register company
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">{successMessage}</div>
        )}

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
      </Card>
    </div>
  );
}
