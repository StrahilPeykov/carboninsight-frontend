"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/PopupModal";
import { companyApi, CompanyCreateData } from "@/lib/api/companyApi";
import { ApiError } from "@/lib/api/apiClient";

export default function CompanyDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyCreateData>({
    name: "",
    vat_number: "",
    business_registration_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      try {
        // Using the companyApi instead of direct fetch, with explicit null check
        if (companyId) {
          const companyData = await companyApi.getCompany(companyId);
          setFormData(companyData);
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Could not load company data.");
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});
    setSuccessMessage("");

    if (!companyId) {
      setError("No company ID available");
      setIsLoading(false);
      return;
    }

    try {
      // Using the companyApi instead of direct fetch
      const updatedCompany = await companyApi.updateCompany(companyId, formData);
      setFormData(updatedCompany);
      setSuccessMessage("Company data successfully edited!");
    } catch (err) {
      console.error("Error updating company:", err);

      // Handle validation errors from API
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        setFieldErrors(err.data as { [key: string]: string[] });
        setError("Please check company details.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCompany = async () => {
    setIsDeleting(true);
    setError("");

    try {
      if (!companyId) {
        setError("No company ID available");
        return;
      }

      // Using the companyApi instead of direct fetch
      await companyApi.deleteCompany(companyId);

      // On success, go back to the list
      router.push("/list-companies");
    } catch (err) {
      console.error("Error deleting company:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Edit Company Details
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Update your company information below.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">{successMessage}</div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
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
              value={formData.name || ""}
              onChange={handleChange}
              required
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
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
              value={formData.vat_number || ""}
              onChange={handleChange}
              required
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
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
              value={formData.business_registration_number || ""}
              onChange={handleChange}
              required
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {fieldErrors.business_registration_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.business_registration_number[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating company..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="max-w-md mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-6">Delete Company</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 dark:bg-red-900/20 dark:border-red-900">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Delete Company</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-200">
            Once you delete this company, there is no going back. This action cannot be undone.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete Company"}
            </Button>
          </div>
        </div>
      </Card>

      {showDeleteConfirm && (
        <Modal title="Confirm Delete Company" onClose={() => setShowDeleteConfirm(false)}>
          <p>Are you sure you want to delete this company? This action cannot be undone.</p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteCompany}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
