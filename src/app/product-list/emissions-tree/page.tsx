"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { EmissionsTable } from "./EmissionsTable";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { Suspense } from "react";
import { companyApi } from "@/lib/api/companyApi";

interface CompanyData {
  id: string;
  name: string;
  vat_number: string;
  business_registration_number: string;
}

interface Mention {
  mention_class: MentionClass;
  message: string;
}

type MentionClass = "Information" | "Warning" | "Error";

export interface EmissionTrace {
  total: number;
  label: string;
  reference_impact_unit: "g" | "kg" | "t" | "ml" | "l" | "m3" | "m2" | "pc" | "kWh" | "Other";
  source:
    | "Product"
    | "ProductReference"
    | "TransportEmission"
    | "TransportEmissionReference"
    | "Material"
    | "MaterialReference"
    | "UserEnergy"
    | "UserEnergyReference"
    | "ProductionEnergy"
    | "ProductionEnergyReference"
    | "Other"
    | "OtherReference";
  methodology: string;
  emissions_subtotal: { [key: string]: number };
  children: {
    emission_trace: EmissionTrace;
    quantity: number;
  }[];
  mentions: Mention[];
}

interface Product {
  id: number;
  supplier: number;
  emission_total: number;
  name: string;
  description: string;
  manufacturer_name: string;
  manufacturer_country: string;
  manufacturer_city: string;
  manufacturer_street: string;
  manufacturer_zip_code: string;
  year_of_construction: number;
  family: string;
  sku: string;
  reference_impact_unit: string;
  pcf_calculation_method: string;
  is_public: boolean;
}

function EmissionsTreePageContent() {
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [emissions, setEmissions] = useState<EmissionTrace | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [manufacturer, setManufacturer] = useState("");
  const [supplier, setSupplier] = useState<CompanyData | null>(null);
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

        const companyId = localStorage.getItem("selected_company_id");

        const emissionTraceResponse = await fetch(
          `${API_URL}/companies/${companyId}/products/${productId}/emission_traces/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!emissionTraceResponse.ok) throw new Error("Failed to fetch emission trace");

        const emissionData = await emissionTraceResponse.json();
        setEmissions(emissionData);

        const productResponse = await fetch(
          `${API_URL}/companies/${companyId}/products/${productId}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!productResponse.ok) throw new Error("Failed to fetch product");

        const productData = await productResponse.json();

        let supplierData = null;
        let manufacturerData = null;

        if (productData.supplier) {
          supplierData = await companyApi.getCompany(productData.supplier);
        }
        if (productData.manufacturer_name) {
          setManufacturer(productData.manufacturer_name);
        }

        setSupplier(supplierData);
        setProduct(productData);
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
        <LoadingSkeleton count={3} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
            <div>
              <span className="font-semibold">Product Name:</span> {product.name}
            </div>
            <div>
              <span className="font-semibold">SKU:</span> {product.sku}
            </div>
            <div>
              <span className="font-semibold">Manufacturer:</span> {manufacturer}
            </div>
            <div>
              <span className="font-semibold">Supplier:</span> {supplier?.name}
            </div>
            <div>
              <span className="font-semibold">Emissions:</span> {product.emission_total} kg CO2e
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
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emissions Breakdown</h2>
        </div>

        {emissions && emissions.children.length > 0 ? (
          <EmissionsTable emissions={emissions} />
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No emission data found.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function EmissionsTreePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton count={3} />
        </div>
      }
    >
      <EmissionsTreePageContent />
    </Suspense>
  );
}
