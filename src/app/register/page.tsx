"use client";

import { useState, useRef, useEffect } from "react";
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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<RegisterData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    passwordsMatch: false,
  });

  // Validate password in real-time
  useEffect(() => {
    const { password, confirm_password } = formData;

    setPasswordValidation({
      minLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password),
      passwordsMatch: password === confirm_password && password.length > 0,
    });
  }, [formData.password, formData.confirm_password]);

  // Announce errors to screen readers
  useEffect(() => {
    if (error) {
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "alert");
      announcement.setAttribute("aria-live", "assertive");
      announcement.className = "sr-only";
      announcement.textContent = error;
      document.body.appendChild(announcement);

      setTimeout(() => {
        if (announcement.parentNode) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const validatePassword = () => {
    if (
      !passwordValidation.minLength ||
      !passwordValidation.hasLetter ||
      !passwordValidation.hasNumber
    ) {
      return "Password must be at least 8 characters long and contain at least one letter and one number.";
    }

    if (!passwordValidation.passwordsMatch) {
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
      setIsLoading(false);

      // Focus on password field
      const passwordField = formRef.current?.querySelector<HTMLInputElement>("#password");
      passwordField?.focus();
      return;
    }

    try {
      await register(formData);

      // Announce successful registration
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = "Registration successful. Redirecting to home page...";
      document.body.appendChild(announcement);

      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        // Parse field-specific errors
        const errorMessage = err.message;
        const fieldErrorMatches = errorMessage.match(/([a-z_]+): (.+?)(?:\. |$)/g);

        if (fieldErrorMatches) {
          const errors: { [key: string]: string } = {};
          fieldErrorMatches.forEach(match => {
            const [field, message] = match.split(": ");
            errors[field.trim()] = message.replace(/\.$/, "");
          });
          setFieldErrors(errors);
          setError("Please correct the errors below.");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName] || null;
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Create an Account
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Join Carbon Insight to start calculating your product carbon footprint
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div
              className="p-3 bg-red-50 border border-red-500-200 rounded-md text-red-600-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300"
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
            >
              <div className="flex items-start">
                <span className="text-red mr-2" aria-hidden="true">
                  ✗
                </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                First Name{" "}
                <span className="text-red" aria-label="required">
                  *
                </span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                aria-required="true"
                aria-invalid={!!getFieldError("first_name")}
                aria-describedby={
                  getFieldError("first_name") ? "first_name-error" : "first_name-hint"
                }
                value={formData.first_name}
                onChange={handleChange}
                disabled={isLoading}
                className={`p-2 mt-1 block w-full rounded-md shadow-sm focus:border-red-500 focus:ring-red-500-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                  getFieldError("first_name") ? "border-red-500" : "border-gray-300"
                }`}
              />
              {getFieldError("first_name") && (
                <p id="first_name-error" className="mt-1 text-sm text-red-600" role="alert">
                  {getFieldError("first_name")}
                </p>
              )}
              <span id="first_name-hint" className="sr-only">
                Enter your first name
              </span>
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Last Name{" "}
                <span className="text-red" aria-label="required">
                  *
                </span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                aria-required="true"
                aria-invalid={!!getFieldError("last_name")}
                aria-describedby={getFieldError("last_name") ? "last_name-error" : "last_name-hint"}
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
                className={`p-2 mt-1 block w-full rounded-md shadow-sm focus:border-red focus:ring-red dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                  getFieldError("last_name") ? "border-red" : "border-gray-300"
                }`}
              />
              {getFieldError("last_name") && (
                <p id="last_name-error" className="mt-1 text-sm text-red" role="alert">
                  {getFieldError("last_name")}
                </p>
              )}
              <span id="last_name-hint" className="sr-only">
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
              <span className="text-red" aria-label="required">
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
              aria-invalid={!!getFieldError("email")}
              aria-describedby={getFieldError("email") ? "email-error" : "email-hint"}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`p-2 mt-1 block w-full rounded-md shadow-sm focus:border-red focus:ring-red dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                getFieldError("email") ? "border-red" : "border-gray-300"
              }`}
              placeholder="your@email.com"
            />
            {getFieldError("email") && (
              <p id="email-error" className="mt-1 text-sm text-red" role="alert">
                {getFieldError("email")}
              </p>
            )}
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
              <span className="text-red" aria-label="required">
                *
              </span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              aria-required="true"
              aria-invalid={
                !!getFieldError("password") ||
                (formData.password.length > 0 && !passwordValidation.minLength)
              }
              aria-describedby="password-requirements password-strength"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`p-2 mt-1 block w-full rounded-md shadow-sm focus:border-red focus:ring-red dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                getFieldError("password") ||
                (formData.password.length > 0 && !passwordValidation.minLength)
                  ? "border-red"
                  : "border-gray-300"
              }`}
            />
            {getFieldError("password") && (
              <p id="password-error" className="mt-1 text-sm text-red" role="alert">
                {getFieldError("password")}
              </p>
            )}

            {/* Password strength indicators */}
            <div
              id="password-strength"
              className="mt-2 space-y-1"
              role="group"
              aria-label="Password requirements"
            >
              <p id="password-requirements" className="text-xs text-gray-600 dark:text-gray-400">
                Password must meet the following requirements:
              </p>
              <ul className="text-xs space-y-1" role="list">
                <li
                  className={`flex items-center ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
                >
                  <span className="mr-2" aria-hidden="true">
                    {passwordValidation.minLength ? "✓" : "○"}
                  </span>
                  <span>At least 8 characters</span>
                </li>
                <li
                  className={`flex items-center ${passwordValidation.hasLetter ? "text-green-600" : "text-gray-500"}`}
                >
                  <span className="mr-2" aria-hidden="true">
                    {passwordValidation.hasLetter ? "✓" : "○"}
                  </span>
                  <span>Contains at least one letter</span>
                </li>
                <li
                  className={`flex items-center ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}
                >
                  <span className="mr-2" aria-hidden="true">
                    {passwordValidation.hasNumber ? "✓" : "○"}
                  </span>
                  <span>Contains at least one number</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password{" "}
              <span className="text-red" aria-label="required">
                *
              </span>
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              aria-required="true"
              aria-invalid={
                formData.confirm_password.length > 0 && !passwordValidation.passwordsMatch
              }
              aria-describedby={
                !passwordValidation.passwordsMatch && formData.confirm_password
                  ? "password-mismatch"
                  : "confirm-password-hint"
              }
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={isLoading}
              className={`p-2 mt-1 block w-full rounded-md shadow-sm focus:border-red focus:ring-red dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.confirm_password.length > 0 && !passwordValidation.passwordsMatch
                  ? "border-red"
                  : "border-gray-300"
              }`}
            />
            <span id="confirm-password-hint" className="sr-only">
              Re-enter your password to confirm
            </span>
            {formData.confirm_password.length > 0 && !passwordValidation.passwordsMatch && (
              <p
                id="password-mismatch"
                className="mt-1 text-xs text-red"
                role="alert"
                aria-live="polite"
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
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
              ariaLabel="Create your account"
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
