"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { EmissionsTable } from "./EmissionsTable";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { Suspense } from "react";
import AuditLog from "@/app/components/ui/AuditLog";
import { auditLogApi, LogItem } from "@/lib/api/auditLogApi";
import { productApi, EmissionTrace, Product } from "@/lib/api/productApi";

function EmissionsTreePageContent() {
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [emissions, setEmissions] = useState<EmissionTrace | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  const searchParams = useSearchParams();

  const productId = searchParams.get("id");

  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Set page title
  useEffect(() => {
    document.title = product?.name ? `${product.name} - Emissions Tree - CarbonInsight` : "Emissions Tree - CarbonInsight";
  }, [product?.name]);

  // Enhanced error announcement function
  const announceError = (message: string) => {
    const errorRegion = document.getElementById("error-announcements");
    if (errorRegion) {
      errorRegion.textContent = `Error loading emission data: ${message}`;
    }
  };

  // Enhanced success announcement function
  const announceSuccess = (message: string) => {
    const statusRegion = document.getElementById("status-announcements");
    if (statusRegion) {
      statusRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        statusRegion.textContent = "";
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setDataLoading(true);
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("No authentication token found");
          announceError("No authentication token found");
          setDataLoading(false);
          return;
        }

        let companyId = searchParams.get("cid");

        if (!companyId) {
          companyId = localStorage.getItem("selected_company_id");
        }

        if (!companyId || !productId) {
          setError("Missing company or product information");
          announceError("Missing company or product information");
          setDataLoading(false);
          return;
        }

        // Announce loading to screen readers
        const statusRegion = document.getElementById("status-announcements");
        if (statusRegion) {
          statusRegion.textContent = "Loading emission data...";
        }

        // Load product data first
        try {
          const productData = await productApi.getProduct(companyId, productId);
          setProduct(productData);
        } catch (err) {
          console.error("Error fetching product data:", err);
          setError("Failed to fetch product data");
          announceError("Failed to fetch product data");
        }

        // Load emission traces
        try {
          const emissionData = await productApi.getProductEmissionTrace(companyId, productId);
          setEmissions(emissionData);
        } catch (err) {
          console.error("Error fetching emission traces:", err);
          setError("Failed to load emission traces");
          announceError("Failed to load emission traces");
        }

        // Load audit log items
        try {
          const auditLogItems = await auditLogApi.getProductAuditLogs(
            parseInt(companyId),
            parseInt(productId)
          );
          setLogItems(auditLogItems);
        } catch (err) {
          console.error("Error fetching audit logs:", err);
        }

        if (statusRegion) {
          statusRegion.textContent = "Emission data loaded successfully";
          setTimeout(() => {
            statusRegion.textContent = "";
          }, 2000);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        announceError(errorMessage);
      } finally {
        setDataLoading(false);
      }
    };
    if (!isLoading) {
      fetchPageData();
    }
  }, [API_URL, router, isLoading, searchParams, productId]);

  if (isLoading || dataLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md" role="alert" aria-live="assertive">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Product</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Reload page"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {product?.name || "Product Emissions"}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Detailed carbon footprint breakdown and product overview
        </p>
      </div>
      
      {product && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product Details</h2>
          </div>
          <div className="grid md:grid-rows-4 md:grid-flow-col gap-y-2 gap-x-8">
            <div>
              <span className="font-semibold">SKU:</span> {product.sku || "—"}
            </div>
            <div>
              <span className="font-semibold">Manufacturer:</span>{" "}
              {product.manufacturer_name || "—"}
            </div>
            <div>
              <span className="font-semibold">Supplier:</span> {product.supplier_name || "—"}
            </div>
            <div>
              <span className="font-semibold">Total emissions:</span>{" "}
              <span aria-label={`${product.emission_total} kilograms CO2 equivalent`}>
                {product.emission_total || "—"} kg CO₂-eq
              </span>
            </div>
            <div>
              <span className="font-semibold">Biogenic emissions:</span>{" "}
              <span aria-label={`${product.emission_total_biogenic} kilograms CO2 equivalent biogenic`}>
                {product.emission_total_biogenic} kg CO₂-eq
              </span>
            </div>
            <div>
              <span className="font-semibold">Non-biogenic emissions:</span>{" "}
              <span aria-label={`${product.emission_total_non_biogenic} kilograms CO2 equivalent non-biogenic`}>
                {product.emission_total_non_biogenic} kg CO₂-eq
              </span>
            </div>
            <div>
              <span className="font-semibold">Public:</span> {product.is_public ? "Yes" : "No"}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Description:</span> {product.description}
            </div>
          </div>
        </Card>
      )}
      
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emissions Breakdown</h2>
        </div>

        {emissions && emissions.children.length > 0 ? (
          <EmissionsTable emissions={emissions} />
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No detailed emission data available for this product.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Emission data may still be processing or no breakdown data has been provided.
            </p>
          </div>
        )}
      </Card>

      {/* Audit log of product */}
      <AuditLog 
        caption="A table displaying the audit log of this product showing all changes and activities." 
        logItems={logItems} 
      />
    </div>
  );
}

export default function EmissionsTreePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton />
        </div>
      }
    >
      <EmissionsTreePageContent />
    </Suspense>
  );
}
