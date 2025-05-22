"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { LoginCredentials } from "@/lib/api/authApi";
import { ApiError } from "@/lib/api/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsAccountBlocked(false);

    try {
      // Use the login method from AuthContext with the credentials object
      await login(formData);

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      // Check if this is a blocked account error
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();

        // Check for various blocked account indicators
        if (
          errorMessage.includes("account blocked") ||
          errorMessage.includes("account suspended") ||
          errorMessage.includes("account disabled") ||
          errorMessage.includes("account locked") ||
          errorMessage.includes("account deactivated") ||
          errorMessage.includes("access denied") ||
          errorMessage.includes("account restricted")
        ) {
          setIsAccountBlocked(true);
          setError("Your account has been blocked or suspended.");
        } else if (
          errorMessage.includes("invalid credentials") ||
          errorMessage.includes("incorrect") ||
          errorMessage.includes("wrong password") ||
          errorMessage.includes("user not found")
        ) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError("Login failed. Please try again.");
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
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Blocked Account Message */}
        {isAccountBlocked && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
              Account Access Restricted
            </h3>
            <p className="text-sm text-red-700 dark:text-red-200 mb-4">
              Your account has been temporarily blocked. Please contact support for assistance.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-red-700 dark:text-red-200">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@carboninsight.win.tue.nl?subject=Account Recovery Request"
                  className="underline hover:no-underline"
                >
                  support@carboninsight.win.tue.nl
                </a>
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">Response time: 24-48 hours</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="username"
              name="username"
              type="email"
              autoComplete="email"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/register"
                className="font-medium text-red hover:text-red-700 dark:text-red-400"
              >
                Need an account? Register
              </Link>
            </div>
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-red hover:text-red-700 dark:text-red-400"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
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
              className="text-xs text-red hover:text-red-700 dark:text-red-400 underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
