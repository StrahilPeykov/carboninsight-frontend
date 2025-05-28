"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { RegisterData } from "@/lib/api/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    // Do basic validation here, most of it is handled by the backend
    if (formData.password !== formData.confirm_password) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate password
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      // Use the register method from AuthContext which now uses our API client
      await register(formData);

      // Redirect to home page or dashboard on success
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Create an Account
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Join CarbonInsight to start calculating your product carbon footprint
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby="first-name-hint"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isLoading}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                Last Name{" "}
                <span className="text-red-500" aria-label="required">
                  *
                </span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby="last-name-hint"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
                className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby="email-hint"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
            <span id="email-hint" className="sr-only">
              Enter your email address
            </span>
          </div>

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
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby="password-requirements"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p id="password-requirements" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters long and contain at least one letter and one
              number.
            </p>
          </div>

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
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span id="confirm-password-hint" className="sr-only">
              Re-enter your password
            </span>
            {formData.password !== formData.confirm_password && formData.confirm_password && (
              <p
                id="password-mismatch"
                className="mt-1 text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex items-center">
            <div className="text-sm">
              <Link
                href="/login"
                className="font-medium text-red hover:text-red-700 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>

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
