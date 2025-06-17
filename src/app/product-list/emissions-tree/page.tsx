"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ExportModal from "../../components/ui/ExportModal";
import { Edit, Trash, FileDown, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { EmissionsTable } from "./EmissionsTable";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { Suspense } from "react";
import AuditLog from "@/app/components/ui/AuditLog";
import { auditLogApi, LogItem } from "@/lib/api/auditLogApi";
import { productApi, EmissionTrace, Product } from "@/lib/api/productApi";
import * as Helpers from "./helpers";
import AIAdviceModal from "../components/AIAdviceModal";
import DeleteProductModal from "../components/DeleteProductModal";

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
  const [companyId, setCompanyId] = useState<string | null>(null);

  const productId = searchParams.get("id");

  // Export
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProductForExport, setSelectedProductForExport] = useState<Product | null>(null);

  // AI advice flow
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingProductName, setPendingProductName] = useState<string>("");
  const [aiModalStep, setAiModalStep] = useState<"confirm" | "loading" | "result" | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [userPromptInput, setUserPromptInput] = useState<string>("");

  // Deletion states
  const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

        setCompanyId(companyId);

        // Load emission traces
        if (companyId && productId) {
          try {
            const emissionData = await productApi.getProductEmissionTrace(companyId, productId);
            setEmissions(emissionData);
          } catch (err) {
            console.error("Error fetching emission traces:", err);
            setError("Failed to load emission traces");
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
        <div className="text-center py-6" role="alert" aria-live="assertive">
          <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">Error: {error}</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Failed to load product information.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {product?.name || "Product Emissions"}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Detailed carbon footprint analysis and emission breakdown
        </p>
      </header>

      {/* Product Details Card */}
      {product && (
        <Card className="mb-6" as="section" aria-labelledby="product-details-heading">
          <div className="flex justify-between items-center mb-4">
            <h2 id="product-details-heading" className="text-xl font-semibold">
              Product Details
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product information */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
              <div>
                <span className="font-semibold">SKU:</span>
                <span className="ml-1">{product.sku || "—"}</span>
              </div>
              <div>
                <span className="font-semibold">Manufacturer:</span>
                <span className="ml-1">{product.manufacturer_name || "—"}</span>
              </div>
              <div>
                <span className="font-semibold">Supplier:</span>
                <span className="ml-1">{product.supplier_name || "—"}</span>
              </div>
              <div>
                <span className="font-semibold">Total emissions:</span>
                <span className="ml-1" aria-label={`${product.emission_total} kilograms CO2 equivalent`}>
                  {product.emission_total || "—"} kg CO₂e
                </span>
              </div>
              <div>
                <span className="font-semibold">Biogenic emissions:</span>
                <span className="ml-1" aria-label={`${product.emission_total_biogenic} kilograms CO2 equivalent biogenic`}>
                  {product.emission_total_biogenic} kg CO₂e
                </span>
              </div>
              <div>
                <span className="font-semibold">Non-biogenic emissions:</span>
                <span className="ml-1" aria-label={`${product.emission_total_non_biogenic} kilograms CO2 equivalent non-biogenic`}>
                  {product.emission_total_non_biogenic} kg CO₂e
                </span>
              </div>
              <div>
                <span className="font-semibold">Public:</span>
                <span className="ml-1">{product.is_public ? "Yes" : "No"}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Description:</span>
                <span className="ml-1">{product.description}</span>
              </div>
            </div>

            {/* Action buttons in a column */}
            <div className="flex flex-row md:flex-col justify-start gap-2 md:min-w-[120px]">
              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs hover:cursor-pointer w-full"
                onClick={e => Helpers.handleProductExport({
                  product,
                  event: e,
                  setSelectedProductForExport,
                  setShowExportModal
                })}
                aria-label={`Export data for ${product.name}`}
              >
                <FileDown className="w-3 h-3" aria-hidden="true" />
                <span>Export</span>
              </Button>

              {/* Ask AI */}
              <Button
                variant="outline"
                size="sm"
                className="group flex items-center gap-1 text-xs hover:bg-gradient-to-r from-purple-500 to-blue-500 hover:text-white hover:cursor-pointer w-full"
                onClick={e => {
                  e.stopPropagation();
                  Helpers.initiateAIAdvice({
                    productId: product.id,
                    productName: product?.name ?? "",
                    setPendingProductId,
                    setPendingProductName,
                    setAiModalStep
                  });
                }}
                aria-label={`Get AI recommendations for ${product.name}`}
              >
                <Sparkles className="w-3 h-3 text-purple-500 group-hover:text-white" aria-hidden="true" />
                Ask AI
              </Button>

              {/* Edit */}
              <Button
                size="sm"
                className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer w-full"
                onClick={e => {
                  e.stopPropagation();
                  Helpers.navigateToProductEdit({
                    id: product.id,
                    router
                  });
                }}
                aria-label={`Edit ${product.name}`}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
                Edit
              </Button>

              {/* Delete */}
              <Button
                size="sm"
                className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer w-full"
                onClick={e => {
                  e.stopPropagation();
                  Helpers.setupProductDeletion({
                    product,
                    setToDeleteProduct,
                    setConfirmInput
                  });
                }}
                disabled={isDeleting}
                aria-label={`Delete ${product.name}`}
              >
                <Trash className="w-4 h-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Export modal */}
      {showExportModal && selectedProductForExport && companyId && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => Helpers.closeExportModal({
            setShowExportModal,
            setSelectedProductForExport
          })}
          product={selectedProductForExport}
          companyId={companyId}
        />
      )}

      {/* AI modal (confirm → loading → result) */}
      <AIAdviceModal
        isOpen={aiModalStep !== null}
        onClose={() => {
          setAiModalStep(null);
          setAiAdvice(null);
          setPendingProductId(null);
          setUserPromptInput("");
        }}
        step={aiModalStep}
        productName={pendingProductName}
        aiAdvice={aiAdvice}
        userPromptInput={userPromptInput}
        setUserPromptInput={setUserPromptInput}
        onRequestAdvice={async (prompt) => {
          if (pendingProductId !== null) {
            await Helpers.requestProductAdvice({
              productId: pendingProductId,
              prompt,
              product,
              setAiModalStep,
              setAiAdvice,
              setPendingProductName
            });
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={!!toDeleteProduct}
        toDeleteProduct={toDeleteProduct}
        deleteSuccess={deleteSuccess}
        deleteError={deleteError}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        setDeleteSuccess={setDeleteSuccess}
        setDeleteError={setDeleteError}
        setToDeleteProduct={setToDeleteProduct}
        setConfirmInput={setConfirmInput}
      />

      {/* Emissions Breakdown Card */}
      <Card className="mb-6" as="section" aria-labelledby="emissions-breakdown-heading">
        <div className="flex justify-between items-center mb-4">
          <h2 id="emissions-breakdown-heading" className="text-xl font-semibold">
            Emissions Breakdown
          </h2>
        </div>

        {emissions && emissions.children.length > 0 ? (
          <div role="region" aria-label="Interactive emissions breakdown table">
            <EmissionsTable emissions={emissions} />
          </div>
        ) : (
          <div className="text-center py-6" role="status">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No detailed emission data available.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Emission data may still be processing or unavailable for this product.
            </p>
          </div>
        )}
      </Card>

      {/* Audit Log Section */}
      <section aria-labelledby="audit-log-heading">
        <AuditLog
          caption="Audit log displaying all changes and access events for this product"
          logItems={logItems}
        />
      </section>
    </div>
  );
}

export default function EmissionsTreePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" role="status" aria-live="polite">
            <LoadingSkeleton />
            <span className="sr-only">Loading emissions data...</span>
          </div>
        </div>
      }
    >
      <EmissionsTreePageContent />
    </Suspense>
  );
}
