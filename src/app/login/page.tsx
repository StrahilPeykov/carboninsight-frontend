"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { LoginCredentials } from "@/lib/api/authApi";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorAnnouncementRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  // Announce errors to screen readers
  useEffect(() => {
    if (error && errorAnnouncementRef.current) {
      // Create a live region announcement
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "alert");
      announcement.setAttribute("aria-live", "assertive");
      announcement.className = "sr-only";
      announcement.textContent = error;
      document.body.appendChild(announcement);

      // Remove after announcement
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

    // Clear error when user starts typing
    if (error) {
      setError(null);
      setIsAccountBlocked(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsAccountBlocked(false);

    try {
      await login(formData);

      // Announce successful login
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = "Login successful. Redirecting to dashboard...";
      document.body.appendChild(announcement);

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      // Clear password while preserving the username
      setFormData(prev => ({
        ...prev,
        password: ""
      }));

      if (err instanceof Error) {
        // Check if this is our custom AuthError with blocking info
        const isBlocked = (err as any).isAccountBlocked === true;

        setIsAccountBlocked(isBlocked);
        setError(err.message);

        // Focus on error message for screen readers
        if (isBlocked) {
          formRef.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Login
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Sign in to access the Carbon Footprint Calculator
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        {/* Regular Error Message */}
        {error && !isAccountBlocked && (
          <div
            ref={errorAnnouncementRef}
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 bg-red-100 text-red-800 rounded-md dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800"
            tabIndex={-1}
          >
            <div className="flex items-start">
              <span className="text-red-600 mr-2" aria-hidden="true">
                ✗
              </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Blocked Account Message - Enhanced styling and information */}
        {isAccountBlocked && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900"
            tabIndex={-1}
          >
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2 flex items-center">
              <span className="text-red-600 mr-2" aria-hidden="true">
                ⚠
              </span>
              Account Temporarily Blocked
            </h3>
            <p className="text-sm text-red-700 dark:text-red-200 mb-4">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-red-700 dark:text-red-200">
                <strong>What you can do:</strong>
              </p>
              <ul className="text-sm text-red-700 dark:text-red-200 list-disc list-inside space-y-1">
                <li>Wait a few minutes and try again</li>
                <li>Ensure you're using the correct email and password</li>
                <li>Contact support if the issue persists</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-200">
                  <strong>Support:</strong>{" "}
                  <a
                    href="mailto:support@carboninsight.win.tue.nl?subject=Account Unlock Request"
                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    support@carboninsight.win.tue.nl
                  </a>
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Response time: 24-48 hours
                </p>
              </div>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="username email"
              inputMode="email"
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : "email-hint"}
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
            <span id="email-hint" className="sr-only">
              Enter your registered email address
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
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : "password-hint"}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span id="password-hint" className="sr-only">
              Enter your password
            </span>
            {error && (
              <span id="login-error" className="sr-only">
                {error}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/register"
                className="font-medium text-red hover:text-red-700 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                Need an account? Register
              </Link>
            </div>
            <div className="text-sm">
              <Link
                href="/support"
                className="font-medium text-red hover:text-red-700 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
              >
                Need help?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>

        {/* Additional Support Information */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Having trouble accessing your account?
            </p>
            <Link
              href="/support"
              className="text-xs text-red hover:text-red-700 dark:text-red-400 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red rounded"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
