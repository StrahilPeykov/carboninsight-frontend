"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { productApi, ProductSharingRequest } from "@/lib/api/productApi";
import { companyApi } from "@/lib/api/companyApi";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { Column, OurTable } from "../components/ui/OurTable";

/**
 * Enhanced data structure for display purposes
 * Extends the base ProductSharingRequest with formatted date and company name
 */
interface DataSharingRequestDisplay {
  id: number;
  product_name: string;
  requesting_company_name: string;
  status: "Pending" | "Accepted" | "Rejected";
  formatted_date: string;
}

/**
 * Product Data Sharing Management Page Component
 * 
 * This component provides a comprehensive interface for managing data sharing requests
 * within the CarbonInsight platform. Companies can view, approve, or deny requests
 * from other companies seeking access to their product emission data.
 * 
 * Key Features:
 * - Display all data sharing requests in a sortable table
 * - Approve or deny requests with confirmation modals
 * - Real-time status updates and feedback messages
 * - Company name resolution for requesters
 * - Color-coded status indicators
 * - Loading states and error handling
 * - Authentication and company selection validation
 * - Refresh mechanism for updated data display
 */
export default function ProductDataSharing() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page - redirect to login if not authenticated
  requireAuth();

  // Company identification state
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Data sharing requests management
  const [requests, setRequests] = useState<DataSharingRequestDisplay[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);  // Triggers data refresh when incremented

  // Approve Request Modal and State Management
  const [activeApprovingModal, setApprovingModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<string>("");
  const [isApprovingRequest, setIsApprovingRequest] = useState(false);
  const [approveMessage, setApproveMessage] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Deny Request Modal and State Management
  const [activeDenyModal, setDenyModal] = useState(false);
  const [requestToDeny, setRequestToDeny] = useState<string>("");
  const [isDenyingRequest, setIsDenyingRequest] = useState(false);
  const [denyMessage, setDenyMessage] = useState<string | null>(null);
  const [denyError, setDenyError] = useState<string | null>(null);

  // Context information for modal displays
  const [companyRequestingData, setCompanyRequestingData] = useState<string | null>(null);
  const [requestedProduct, setRequestedProduct] = useState<string | null>(null);

  /**
   * Extract and validate company ID from localStorage
   * Redirects to company list if no company is selected
   */
  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  /**
   * Fetch and process sharing requests when company ID changes or refresh is triggered
   * Loads requests and resolves company names for display
   */
  useEffect(() => {
    if (!companyId) return;

    const fetchRequests = async () => {
      try {
        setDataLoading(true);
        // Using centralized productApi instead of direct fetch
        if (companyId) {
          // Explicit null check for TypeScript safety
          const sharingRequests = await productApi.getProductSharingRequests(companyId);

          // Process the requests to include resolved company names for better UX
          const requestsWithCompanyNames: DataSharingRequestDisplay[] = await Promise.all(
            sharingRequests.map(async (request: ProductSharingRequest) => {
              let companyName = "Unknown Company";

              try {
                // Resolve the requesting company details for display
                const companyData = await companyApi.getCompany(request.requester.toString());
                companyName = companyData.name;
              } catch (err) {
                console.error("Error fetching company name:", err);
                // Continue with default name if company lookup fails
              }

              return {
                id: request.id,
                product_name: request.product_name,
                requesting_company_name: companyName,
                status: request.status,
                formatted_date: new Date(request.created_at).toLocaleString(),
              };
            })
          );

          setRequests(requestsWithCompanyNames);
          setLoadingError(null);
        }
      } catch (err) {
        console.error("Error fetching sharing requests:", err);
        setLoadingError(err instanceof Error ? err.message : "Failed to load sharing requests");
      } finally {
        setDataLoading(false);
      }
    };

    fetchRequests();
  }, [companyId, refreshKey]);

  /**
   * Handle approval of a data sharing request
   * Validates input, calls API, and provides user feedback
   */
  const handleApproveRequest = async () => {
    if (!requestToApprove || !companyId || isApprovingRequest) return;

    setIsApprovingRequest(true);
    // Clear all previous messages before starting operation
    setApproveError(null);
    setApproveMessage(null);
    setDenyError(null);
    setDenyMessage(null);

    try {
      if (companyId) {
        // Explicit null check for TypeScript safety
        // Using centralized productApi instead of direct fetch
        await productApi.approveProductSharingRequests(companyId, [requestToApprove]);

        setApproveMessage(`Successfully approved ${companyRequestingData}'s request for the emission data of ${requestedProduct}!`);
        
        // Trigger refresh of requests list to show updated status
        setRefreshKey(prev => prev + 1);
        
        // Clear modal state variables
        setRequestedProduct(null);
        setCompanyRequestingData(null);
        setRequestToApprove("");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      setApproveError(err instanceof Error ? err.message : "Failed to approve data sharing request");
    } finally {
      setIsApprovingRequest(false);
    }
  };

  /**
   * Handle denial of a data sharing request
   * Validates input, calls API, and provides user feedback
   */
  const handleDenyRequest = async () => {
    if (!requestToDeny || !companyId || isDenyingRequest) return;

    setIsDenyingRequest(true);
    // Clear all previous messages before starting operation
    setApproveError(null);
    setApproveMessage(null);
    setDenyError(null);
    setDenyMessage(null);

    try {
      if (companyId) {
        // Explicit null check for TypeScript safety
        // Using centralized productApi instead of direct fetch
        await productApi.denyProductSharingRequests(companyId, [requestToDeny]);

        setApproveMessage(`Successfully denied ${companyRequestingData}'s request for the emission data of ${requestedProduct}!`);
        
        // Trigger refresh of requests list to show updated status
        setRefreshKey(prev => prev + 1);
        
        // Clear modal state variables
        setRequestedProduct(null);
        setCompanyRequestingData(null);
        setRequestToDeny("");
      }
    } catch (err) {
      console.error("Error denying request:", err);
      setDenyError(err instanceof Error ? err.message : "Failed to deny sharing request");
    } finally {
      setIsDenyingRequest(false);
    }
  };

  // Show loading skeleton while authentication state is being determined
  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  /**
   * Table column definitions for sharing requests display
   * Defines how request data should be displayed and what actions are available
   */
  const columns: Column<DataSharingRequestDisplay>[] = [
    { key: "product_name", label: "Product Name" },
    { key: "requesting_company_name", label: "Requesting Company" },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        // Color-coded status display for quick visual recognition
        const colorClass =
          value === "Accepted"
            ? "text-green-500"
            : value === "Pending"
              ? "text-yellow-500"
              : value === "Rejected"
                ? "text-red-500"
                : "text-gray-500";

        return <span className={colorClass}>{String(value)}</span>;
      },
    },
    { key: "formatted_date", label: "Request Date" },
    {
      key: "actions",
      label: "Actions",
      render: (_value, request) => (
        // Action buttons for approve and deny operations
        <div className="flex justify-end items-center gap-2">
          {/* Approve button */}
          <Button
            size="sm"
            className="flex items-center gap-1 text-xs !bg-green-500 !border-green-500 !text-white hover:cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              setRequestToApprove(request.id.toString());
              setCompanyRequestingData(request.requesting_company_name);
              setRequestedProduct(request.product_name);
              setApprovingModal(true);
            }}
          >
            <Check className="w-4 h-4 text-white" />
          </Button>
          
          {/* Deny button */}
          <Button
            size="sm"
            className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer"
            onClick={e => {
              e.stopPropagation();
              setRequestToDeny(request.id.toString());
              setCompanyRequestingData(request.requesting_company_name);
              setRequestedProduct(request.product_name);
              setDenyModal(true);
            }}
          >
            <X className="w-4 h-4 text-white" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Approve Request Confirmation Modal */}
      {activeApprovingModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              {/* Modal header with invisible spacer for centering */}
              <div className="flex w-full">
                <Button className="invisible flex-none"> X </Button>
                <div className="grow flex justify-center items-center px-4 text-2xl font-bold">
                  Approve Request
                </div>
                <Button className="flex-none" onClick={() => setApprovingModal(false)}>
                  X
                </Button>
              </div>
              
              {/* Confirmation message with context */}
              <div className="w-100 max-w-full text-center">
                Are you sure you want to give {companyRequestingData} access to the emission data of {requestedProduct}?
              </div>

              {/* Approve action button */}
              <Button
                className="w-full"
                onClick={() => {
                  handleApproveRequest();
                  setApprovingModal(false);
                }}
              >
                Accept Request
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Deny Request Confirmation Modal */}
      {activeDenyModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              {/* Modal header with invisible spacer for centering */}
              <div className="flex w-full">
                <Button className="invisible flex-none"> X </Button>
                <div className="grow flex justify-center items-center px-4 text-2xl font-bold">
                  Deny Request
                </div>
                <Button className="flex-none" onClick={() => setDenyModal(false)}>
                  X
                </Button>
              </div>
              
              {/* Confirmation message with context */}
              <div className="w-100 max-w-full text-center">
                Are you sure you want to deny {companyRequestingData} access to the emission data of {requestedProduct}?
              </div>
              
              {/* Deny action button */}
              <Button
                className="w-full"
                onClick={() => {
                  handleDenyRequest();
                  setDenyModal(false);
                }}
              >
                Deny Request
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Page Content */}
      <div className="w-full flex flex-col justify-self-center">
        {/* Page header with title and description */}
        <h1 className="text-3xl font-semibold mb-2">Manage Data Sharing Requests</h1>
        <h2 className="text-md mb-4 dark:text-gray-400 mb-6">
          Approve or deny data sharing requests from other companies here. This gives them access to
          the emission data related to that product.
        </h2>

        {/* Status Messages Display */}
        {approveMessage && <div className="text-green-500 rounded-md mb-6">{approveMessage}</div>}
        {approveError && <div className="text-red-500 rounded-md mb-6">{approveError}</div>}
        {denyMessage && <div className="text-green-500 rounded-md mb-6">{denyMessage}</div>}
        {denyError && <div className="text-red-500 rounded-md mb-6">{denyError}</div>}

        {/* Sharing Requests Table with Loading and Error States */}
        {dataLoading ? (
          <div className="text-center py-6">Data loading...</div>
        ) : loadingError ? (
          <div className="text-red-500 text-center py-6">{loadingError}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-6">No data sharing requests found.</div>
        ) : (
          // Requests table with our custom table component
          <Card>
            <OurTable
              caption="A table displaying the data sharing requests of this company."
              items={requests}
              columns={columns}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
