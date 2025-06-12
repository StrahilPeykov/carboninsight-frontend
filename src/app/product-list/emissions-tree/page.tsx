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

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setDataLoading(true);
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("No authentication token found");
          setDataLoading(false);
          return;
        }

        let companyId = searchParams.get("cid");

        if (!companyId) {
          companyId = localStorage.getItem("selected_company_id");
        }

        // Load emission traces
        if (companyId && productId) {
          try {
            const emissionData = await productApi.getProductEmissionTrace(companyId, productId);
            setEmissions(emissionData);
          } catch (err) {
            console.error("Error fetching emission traces:", err);
            setError("Failed to emission traces");
          }
        }

        // Load product data
        if (companyId && productId) {
          try {
            const productData = await productApi.getProduct(companyId, productId);
            setProduct(productData);
          } catch (err) {
            console.error("Error fetching product data:", err);
            setError("Failed to fetch product data");
          }
        }

        // Load audit log items
        if (companyId && productId) {
          try {
            const auditLogItems = await auditLogApi.getProductAuditLogs(
              parseInt(companyId),
              parseInt(productId)
            );
            setLogItems(auditLogItems);
          } catch (err) {
            console.error("Error fetching audit logs:", err);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setDataLoading(false);
      }
    };
    if (!isLoading) {
      fetchPageData();
    }
  }, [API_URL, router, isLoading]);

  if (isLoading || dataLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to fetch product.</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {product?.name}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Product overview</p>
      </div>
      {product && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product details</h2>
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
              {product.emission_total || "—"} kg CO₂-eq
            </div>
            <div>
              <span className="font-semibold">Biogenic emissions:</span>{" "}
              {product.emission_total_biogenic} kg CO₂-eq
            </div>
            <div>
              <span className="font-semibold">Non-biogenic emissions:</span>{" "}
              {product.emission_total_non_biogenic} kg CO₂-eq
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
              No detailed emission data available.
            </p>
          </div>
        )}
      </Card>

      {/* Audit log of company */}
      <AuditLog caption="A table displayingthe auditlog of a product." logItems={logItems} />
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
