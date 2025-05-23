"use client";

import { useState } from "react";
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
      await login(formData);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof Error) {
        // Check if this is our custom AuthError with blocking info
        const isBlocked = (err as any).isAccountBlocked === true;

        setIsAccountBlocked(isBlocked);
        setError(err.message);
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

        {/* Blocked Account Message - Enhanced styling and information */}
        {isAccountBlocked && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
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
                    className="underline hover:no-underline"
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
                href="/support"
                className="font-medium text-red hover:text-red-700 dark:text-red-400"
              >
                Need help?
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
