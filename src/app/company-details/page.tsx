"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PopupModal from "../components/ui/PopupModal";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [companyId, setCompanyId] = useState<string | null>(null);

  // delete‐confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // 1) Grab selected company ID
  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  // 2) Fetch company details
  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    companyApi
      .getCompany(companyId)
      .then(data => setFormData(data))
      .catch(() => setError("Could not load company data."))
      .finally(() => setIsLoading(false));
  }, [companyId]);

  // 3) Check for success message in session storage
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("company_edit_success")) {
      setSuccessMessage("Company data successfully edited!");
      sessionStorage.removeItem("company_edit_success");
    }
  }, []);

  // Handlers for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Save edits
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setFieldErrors({});
    setIsLoading(true);

    if (!companyId) {
      setError("No company ID available");
      setIsLoading(false);
      return;
    }

    try {
      await companyApi.updateCompany(companyId, {
        name: formData.name.trim(),
        vat_number: formData.vat_number.trim(),
        business_registration_number: formData.business_registration_number.trim(),
      });

      // Show success message
      setSuccessMessage("Company data successfully edited!");
      setIsLoading(false);

      // Store success state in sessionStorage to persist after refresh
      sessionStorage.setItem("company_edit_success", "true");

      // Delay event dispatch to allow user to see the success message
      setTimeout(() => {
        if (typeof window !== "undefined") {
          console.log("Company updated - dispatching events");
          // Only dispatch one event to minimize side effects
          window.dispatchEvent(new CustomEvent("companyChanged", {
            detail: { companyId }
          }));
        }
      }, 1500); // 1.5 second delay

      return;
    } catch (err) {
      if (err instanceof ApiError && err.data) {
        setFieldErrors(err.data as { [key: string]: string[] });
        setError("Please check company details.");
      } else {
        setError((err as Error).message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show delete‐confirmation modal
  const handleDeleteCompany = () => {
    setConfirmInput("");
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const confirmDeleteCompany = async () => {
    if (!companyId) return;
    setIsDeleting(true);
    setError("");
    try {
      console.log("About to delete company:", companyId);
      await companyApi.deleteCompany(companyId);
      console.log("Company deleted successfully");

      // Clear the selected company from localStorage first
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_company_id");

        // Then dispatch events to notify navbar with a small delay
        console.log("Company deleted - dispatching events");
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("companyListChanged"));
          window.dispatchEvent(new CustomEvent("companyChanged"));
          console.log("Events dispatched");
        }, 50);
      }

      // Small delay to ensure events are processed before redirect
      setTimeout(() => {
        console.log("Redirecting to list companies");
        router.push("/list-companies");
      }, 200);
    } catch (err) {
      console.error("Error deleting company:", err);
      setError((err as Error).message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setConfirmInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 flex justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-800 rounded">{error}</div>}
      {successMessage && (
        <div className="p-4 bg-green-50 text-green-800 rounded">{successMessage}</div>
      )}

      {/* Edit Company Form */}
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Company Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
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
            {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name[0]}</p>}
          </div>
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
            {fieldErrors.vat_number && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.vat_number[0]}</p>
            )}
          </div>
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
            {fieldErrors.business_registration_number && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.business_registration_number[0]}
              </p>
            )}
          </div>
          <div className="text-right">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Delete Company Card */}
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

      {/* Confirmation Modal */}
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
