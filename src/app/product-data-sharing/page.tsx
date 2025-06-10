"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash } from "lucide-react";
import { productApi, ProductSharingRequest } from "@/lib/api/productApi";
import { companyApi } from "@/lib/api/companyApi";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { TableRow } from "../components/ui/tableRow";
import { Column, OurTable } from "../components/ui/OurTable";

interface DataSharingRequestDisplay {
  id: number;
  product_name: string;
  requesting_company_name: string;
  status: "Pending" | "Accepted" | "Rejected";
  formatted_date: string;
}

export default function ProductDataSharing() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const [companyId, setCompanyId] = useState<string | null>(null);

  // Requests state
  const [requests, setRequests] = useState<DataSharingRequestDisplay[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal and form state
  const [activeApprovingModal, setApprovingModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<string>("");
  const [isApprovingRequest, setIsApprovingRequest] = useState(false);
  const [approveMessage, setApproveMessage] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const [activeDenyModal, setDenyModal] = useState(false);
  const [requestToDeny, setRequestToDeny] = useState<string>("");
  const [isDenyingRequest, setIsDenyingRequest] = useState(false);
  const [denyMessage, setDenyMessage] = useState<string | null>(null);
  const [denyError, setDenyError] = useState<string | null>(null);

  // Get company ID
  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  // Fetch sharing requests and company names when company ID changes or refresh is needed
  useEffect(() => {
    if (!companyId) return;

    const fetchRequests = async () => {
      try {
        setDataLoading(true);
        // Using productApi instead of direct fetch
        if (companyId) {
          // Explicit null check for TypeScript
          const sharingRequests = await productApi.getProductSharingRequests(companyId);

          // Process the requests to include company names
          const requestsWithCompanyNames: DataSharingRequestDisplay[] = await Promise.all(
            sharingRequests.map(async (request: ProductSharingRequest) => {
              let companyName = "Unknown Company";

              try {
                // Get the requesting company details
                const companyData = await companyApi.getCompany(request.requester.toString());
                companyName = companyData.name;
              } catch (err) {
                console.error("Error fetching company name:", err);
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

  const handleApproveRequest = async () => {
    if (!requestToApprove || !companyId || isApprovingRequest) return;

    setIsApprovingRequest(true);
    setApproveError(null);
    setApproveMessage(null);
    setDenyError(null);
    setDenyMessage(null);

    try {
      if (companyId) {
        // Explicit null check for TypeScript
        // Using productApi instead of direct fetch
        await productApi.approveProductSharingRequests(companyId, [requestToApprove]);

        setApproveMessage(`Successfully approved request: ${requestToApprove}!`);
        setRefreshKey(prev => prev + 1); // Trigger a refresh of the requests list
        setRequestToApprove("");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      setApproveError(err instanceof Error ? err.message : "Failed to approve sharing request");
    } finally {
      setIsApprovingRequest(false);
    }
  };

  const handleDenyRequest = async () => {
    if (!requestToDeny || !companyId || isDenyingRequest) return;

    setIsDenyingRequest(true);
    setApproveError(null);
    setApproveMessage(null);
    setDenyError(null);
    setDenyMessage(null);

    try {
      if (companyId) {
        // Explicit null check for TypeScript
        // Using productApi instead of direct fetch
        await productApi.denyProductSharingRequests(companyId, [requestToDeny]);

        setDenyMessage(`Successfully denied request: ${requestToDeny}!`);
        setRefreshKey(prev => prev + 1); // Trigger a refresh of the requests list
        setRequestToDeny("");
      }
    } catch (err) {
      console.error("Error denying request:", err);
      setDenyError(err instanceof Error ? err.message : "Failed to deny sharing request");
    } finally {
      setIsDenyingRequest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // We define the columns that will be used in the table.
  // key: is the key of the actual datatype.
  // label: the header label we will display.
  // render: modifications we will do to the rendering of the value.
  const columns: Column<DataSharingRequestDisplay>[] = [
    { key: "product_name", label: "Product Name" },
    { key: "requesting_company_name", label: "Requesting Company" },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
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
        <div className="flex justify-end items-center gap-4">
          <button
            className="text-green-500 hover:text-green-700"
            onClick={() => {
              setRequestToApprove(request.id.toString());
              setApprovingModal(true);
            }}
          >
            <Check size={24} />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setRequestToDeny(request.id.toString());
              setDenyModal(true);
            }}
          >
            <Trash size={24} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Confirmation modal for approving */}
      {activeApprovingModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex w-full">
                <Button className="invisible flex-none"> X </Button>
                <div className="grow flex justify-center items-center px-4 text-2xl font-bold">
                  Approve Request
                </div>
                <Button className="flex-none" onClick={() => setApprovingModal(false)}>
                  X
                </Button>
              </div>
              <div className="w-100 max-w-full text-center">
                Are you sure you want to approve request: {requestToApprove}?
              </div>

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

      {/* Confirmation modal for denying */}
      {activeDenyModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/75 z-50">
          <Card className="">
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex w-full">
                <Button className="invisible flex-none"> X </Button>
                <div className="grow flex justify-center items-center px-4 text-2xl font-bold">
                  Deny Request
                </div>
                <Button className="flex-none" onClick={() => setDenyModal(false)}>
                  X
                </Button>
              </div>
              <div className="w-100 max-w-full text-center">
                Are you sure you want to deny request: {requestToDeny}?
              </div>
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

      <div className="w-full flex flex-col justify-self-center">
        <h1 className="text-3xl font-semibold mb-2">Manage Data Sharing Requests</h1>
        <h2 className="text-md mb-4 dark:text-gray-400 mb-6">
          Approve or deny data sharing requests from other companies here. This gives them access to
          the emission data related to that product.
        </h2>

        {/* Status messages */}
        {approveMessage && <div className="text-green-500 rounded-md mb-6">{approveMessage}</div>}
        {approveError && <div className="text-red-500 rounded-md mb-6">{approveError}</div>}
        {denyMessage && <div className="text-green-500 rounded-md mb-6">{denyMessage}</div>}
        {denyError && <div className="text-red-500 rounded-md mb-6">{denyError}</div>}

        {/* Table */}
        {dataLoading ? (
          <div className="text-center py-6">Data loading...</div>
        ) : loadingError ? (
          <div className="text-red-500 text-center py-6">{loadingError}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-6">No data sharing requests found.</div>
        ) : (
          <OurTable
            caption="A table displaying the data sharing requests of this company."
            items={requests}
            columns={columns}
          />
        )}
      </div>
    </div>
  );
}
