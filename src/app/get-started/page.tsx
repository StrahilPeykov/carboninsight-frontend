"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

export default function GetStartedPage() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  useEffect(() => {
    if (!isLoading) {
      const companyId = localStorage.getItem("selected_company_id");

      if (!companyId) {
        // No company selected, redirect to companies list
        router.push("/list-companies");
      } else {
        // Company selected, redirect to products list
        router.push("/product-list");
      }
    }
  }, [isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
          Getting Started...
        </h1>
        <LoadingSkeleton count={3} />
      </div>
    </div>
  );
}
