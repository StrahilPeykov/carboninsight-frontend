"use client";

import { useState, useEffect } from "react";
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
  const [fieldErrors, setFieldErrors] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
  }>({});
  const [formData, setFormData] = useState<RegisterData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  // Set page title
  useEffect(() => {
    document.title = "Register - CarbonInsight";
  }, []);

  // Enhanced error announcement function
  const announceError = (message: string) => {
    const errorRegion = document.getElementById("error-announcements");
    if (errorRegion) {
      errorRegion.textContent = `Registration error: ${message}`;
    }
  };

  // Enhanced success announcement function
  const announceSuccess = (message: string) => {
    const statusRegion = document.getElementById("status-announcements");
    if (statusRegion) {
      statusRegion.textContent = message;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
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
    setFieldErrors({});

    // Validate password
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      setFieldErrors({ confirm_password: passwordError });
      announceError(passwordError);
      setIsLoading(false);
      // Focus the confirm password field for user convenience
      document.getElementById("confirm_password")?.focus();
      return;
    }

    try {
      // Use the register method from AuthContext which now uses our API client
      await register(formData);

      announceSuccess("Registration successful. Redirecting to home page...");

      // Small delay to ensure announcement is read
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      
      // Parse field-specific errors if they exist
      if (err instanceof Error && err.message.includes(":")) {
        const fieldErrorPairs = err.message.split(". ");
        const newFieldErrors: typeof fieldErrors = {};
        let hasFieldErrors = false;

        fieldErrorPairs.forEach(pair => {
          if (pair.includes(":")) {
            const [field, message] = pair.split(": ");
            const normalizedField = field.toLowerCase().replace(" ", "_");
            if (normalizedField in formData) {
              newFieldErrors[normalizedField as keyof typeof fieldErrors] = message;
              hasFieldErrors = true;
            }
          }
        });

        if (hasFieldErrors) {
          setFieldErrors(newFieldErrors);
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
      
      announceError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirm_password;

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
          {error && !Object.keys(fieldErrors).length && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300"
              role="alert"
              aria-live="assertive"
              id="general-error"
            >
              <strong>Registration Error:</strong>
              <span className="ml-1">{error}</span>
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
                autoComplete="given-name"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.first_name}
                aria-describedby={[
                  "first-name-hint",
                  fieldErrors.first_name ? "first-name-error" : null,
                ].filter(Boolean).join(" ")}
                value={formData.first_name}
                onChange={handleChange}
                disabled={isLoading}
                className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span id="first-name-hint" className="sr-only">
                Enter your first name
              </span>
              {fieldErrors.first_name && (
                <p id="first-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.first_name}
                </p>
              )}
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
                autoComplete="family-name"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.last_name}
                aria-describedby={[
                  "last-name-hint",
                  fieldErrors.last_name ? "last-name-error" : null,
                ].filter(Boolean).join(" ")}
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
                className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span id="last-name-hint" className="sr-only">
                Enter your last name
              </span>
              {fieldErrors.last_name && (
                <p id="last-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {fieldErrors.last_name}
                </p>
              )}
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
              inputMode="email"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={[
                "email-hint",
                fieldErrors.email ? "email-error" : null,
              ].filter(Boolean).join(" ")}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
            <span id="email-hint" className="sr-only">
              Enter your email address
            </span>
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {fieldErrors.email}
              </p>
            )}
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
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={[
                "password-requirements",
                fieldErrors.password ? "password-error" : null,
              ].filter(Boolean).join(" ")}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p id="password-requirements" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters long and contain at least one letter and one
              number.
            </p>
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {fieldErrors.password}
              </p>
            )}
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
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={!!(fieldErrors.confirm_password || (!passwordsMatch && formData.confirm_password))}
              aria-describedby={[
                "confirm-password-hint",
                !passwordsMatch && formData.confirm_password ? "password-mismatch" : null,
                fieldErrors.confirm_password ? "confirm-password-error" : null,
              ].filter(Boolean).join(" ")}
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span id="confirm-password-hint" className="sr-only">
              Re-enter your password
            </span>
            {!passwordsMatch && formData.confirm_password && (
              <p
                id="password-mismatch"
                className="mt-1 text-xs text-red-600 dark:text-red-400"
                role="alert"
                aria-live="polite"
              >
                Passwords do not match
              </p>
            )}
            {fieldErrors.confirm_password && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

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

          <div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading} 
              aria-busy={isLoading}
              aria-describedby={isLoading ? "register-status" : undefined}
            >
              {isLoading ? (
                <>
                  <span className="sr-only">Creating account, please wait</span>
                  <span aria-hidden="true">Creating account...</span>
                </>
              ) : (
                "Register"
              )}
            </Button>
            
            {isLoading && (
              <div id="register-status" className="sr-only" aria-live="polite">
                Creating your account, please wait
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
