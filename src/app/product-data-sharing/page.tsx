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

      <div className="flex flex-col justify-self-center items-center gap-8">
        <div className="font-bold text-4xl text-center w-auto">Manage Data Requests</div>

        {/* Status messages */}
        {approveMessage && <div className="text-green-500 rounded-md">{approveMessage}</div>}
        {approveError && <div className="text-red-500 rounded-md">{approveError}</div>}
        {denyMessage && <div className="text-green-500 rounded-md">{denyMessage}</div>}
        {denyError && <div className="text-red-500 rounded-md">{denyError}</div>}

        {/* Table */}
        <Card className="max-w-[90vw]">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="border-b text-xl">
                <tr>
                  <th className="py-3 px-6 text-left">Product Name</th>
                  <th className="py-3 px-6 text-left">Requesting Company</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Request Date</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {dataLoading && (
                  <tr>
                    <td colSpan={5} className="py-3 px-6 text-center">
                      Loading requests...
                    </td>
                  </tr>
                )}
                {loadingError && (
                  <tr>
                    <td colSpan={5} className="py-3 px-6 text-center text-red-500">
                      Error: {loadingError}
                    </td>
                  </tr>
                )}
                {!dataLoading && !loadingError && requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-5 text-center">
                      This company currently has no data sharing requests.
                    </td>
                  </tr>
                )}
                {!dataLoading &&
                  !loadingError &&
                  requests.map(request => (
                    <tr key={request.id} className="border-b hover:bg-gray-500 transition">
                      <td className="py-3 px-6 text-left">{request.product_name}</td>
                      <td className="py-3 px-6 text-left">{request.requesting_company_name}</td>
                      <td
                        className={`py-3 px-6 text-left ${
                          request.status === "Accepted"
                            ? "text-green-500"
                            : request.status === "Pending"
                              ? "text-yellow-500"
                              : request.status === "Rejected"
                                ? "text-red-500"
                                : "text-gray-500"
                        }`}
                      >
                        {request.status}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {request.formatted_date ?? "No date found"}
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-center items-center gap-4">
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
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
