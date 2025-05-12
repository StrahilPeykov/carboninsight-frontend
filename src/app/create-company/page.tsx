"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [businessRegistryNumber, setBusinessRegistryNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      setError("");
      setFieldErrors({});
      setSuccessMessage("");
      setIsLoading(true);

      const response = await fetch(`${API_URL}/companies/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          vat_number: vatNumber,
          business_registration_number: businessRegistryNumber,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Company successfully created!");
        setTimeout(() => {
          router.push("/company-details");
        }, 3000);
        return;
      }

      const errorData = await response.json().catch(() => null);

      if (errorData && typeof errorData === "object") {
        setFieldErrors(errorData);
        setError("Please check company details.");
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err?.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || !!successMessage;

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
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isDisabled}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="vatNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              VAT number
            </label>
            <input
              type="text"
              id="vatNumber"
              value={vatNumber}
              onChange={e => setVatNumber(e.target.value)}
              required
              disabled={isDisabled}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {fieldErrors.vat_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.vat_number[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="businessRegistryNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Business registry number
            </label>
            <input
              type="text"
              id="businessRegistryNumber"
              value={businessRegistryNumber}
              onChange={e => setBusinessRegistryNumber(e.target.value)}
              required
              disabled={isDisabled}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
            />
            {fieldErrors.business_registration_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.business_registration_number[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isLoading ? "Creating company..." : "Submit"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
