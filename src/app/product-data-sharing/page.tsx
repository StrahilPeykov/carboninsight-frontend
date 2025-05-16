"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash } from "lucide-react";

enum Status {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
}

interface DataSharingRequestAPI {
  id: number;
  product_name: string;
  status: Status;
  created_at: string; // Date-time format.
  product: number;
  requester: number; // Id of requesting company.
}

interface DataSharingRequestDisplay {
  id: number;
  product_name: string;
  requesting_company_name: string;
  status: Status;
  formatted_date: string;
}

export default function ProductDataSharing() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const [token, setToken] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Retrieve token.
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  const [requests, setRequests] = useState<DataSharingRequestDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    const getCompanyName = async (requesting_company_id: number): Promise<string> => {
      try {
        const response = await fetch(`${API_URL}/companies/${requesting_company_id}/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const companyData = await response.json();
        const companyName: string = companyData.name;

        return companyName as string;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setLoadingError(err.message);
        } else {
          setLoadingError("Something went wrong");
        }
        return "";
      }
    };

    const getRequests = async (): Promise<DataSharingRequestDisplay[]> => {
      try {
        const response = await fetch(
          `${API_URL}/companies/${companyId}/product_sharing_requests/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const APIdata = await response.json();

        const displayData: DataSharingRequestDisplay[] = APIdata.map(
          (request: DataSharingRequestAPI) => ({
            id: request.id,
            product_name: request.product_name,
            requesting_company_name: getCompanyName(request.requester),
            status: request.status,
            formatted_date: new Date(request.created_at).toLocaleString(),
          })
        );

        return displayData as DataSharingRequestDisplay[];
      } catch (err: unknown) {
        if (err instanceof Error) {
          setLoadingError(err.message);
        } else {
          setLoadingError("Something went wrong");
        }
        return [];
      }
    };

    if (token) {
      getRequests()
        .then(data => setRequests(data))
        .catch(err => setLoadingError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [API_URL, companyId, token, refreshKey]); // Rerun when either token or refreshkey updates.

  const [activeApprovingModal, setApprovingModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<string>("");
  const [isApprovingUser, setIsApprovingUser] = useState(false);
  const [approveMessage, setApproveMessage] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [activeDenyModal, setDenyModal] = useState(false);
  const [requestToDeny, setRequestToDeny] = useState<string>("");
  const [isDenyingRequest, setIsDenyingRequest] = useState(false);
  const [denyMessage, setDenyMessage] = useState<string | null>(null);
  const [denyError, setDenyError] = useState<string | null>(null);

  const handleApproveUser = async () => {
    if (!requestToApprove) return;
    if (isApprovingUser) return;

    setIsApprovingUser(true);
    setApproveError(null);
    setApproveMessage(null);
    setDenyError(null);
    setDenyMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/companies/${companyId}/product_sharing_requests/bulk_approve/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: [requestToApprove] }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await response.json(); // Should get a response if the api call was successfull.
      setApproveMessage(`Successfully approved request: ${requestToApprove}!`);
      setRefreshKey(prev => prev + 1);
      setRequestToApprove("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApproveError(err.message);
      } else {
        setApproveError("Something went wrong");
      }
    } finally {
      setIsApprovingUser(false);
    }
  };

  const handleDenyRequest = async () => {
    if (!requestToDeny) return;
    if (isDenyingRequest) return;

    setIsDenyingRequest(true);
    setApproveError(null);
    setApproveMessage(null);
    setDenyError(null);
    setDenyMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/companies/${companyId}/product_sharing_requests/bulk_deny/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: [requestToDeny] }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setDenyMessage(`Successfully denied request: ${requestToDeny}!`);
      setRefreshKey(prev => prev + 1);
      setRequestToDeny("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDenyError(err.message);
      } else {
        setDenyError("Something went wrong");
      }
    } finally {
      setIsDenyingRequest(false);
    }
  };

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
                  {" "}
                  Add User{" "}
                </div>
                <Button className="flex-none" onClick={() => setApprovingModal(false)}>
                  {" "}
                  X{" "}
                </Button>
              </div>
              <div className="w-100 max-w-full text-center">
                {" "}
                Are you sure you want to approve request: {requestToApprove}?{" "}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  handleApproveUser();
                  setApprovingModal(false);
                }}
              >
                {" "}
                Accept Request{" "}
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
                  {" "}
                  Remove User{" "}
                </div>
                <Button className="flex-none" onClick={() => setDenyModal(false)}>
                  {" "}
                  X{" "}
                </Button>
              </div>
              <div className="w-100 max-w-full text-center">
                {" "}
                Are you sure you want to deny request: {requestToDeny}?{" "}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  handleDenyRequest();
                  setDenyModal(false);
                }}
              >
                {" "}
                Deny Request{" "}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col justify-self-center items-center gap-8">
        <div className="font-bold text-4xl text-center w-auto"> Manage Data Requests </div>

        {/* Display Adding Message */}
        {approveMessage && <div className="text-green-500 rounded-md">{approveMessage}</div>}

        {/* Display Adding Error */}
        {approveError && <div className="text-red-500 rounded-md">{approveError}</div>}

        {/* Display Removal Message */}
        {denyMessage && <div className="text-green-500 rounded-md">{denyMessage}</div>}

        {/* Display Removing Error */}
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
                {/* Map all requests to an actual div */}
                {isLoading && (
                  <tr>
                    <td>Loading users...</td>
                  </tr>
                )}
                {loadingError && (
                  <tr>
                    <td className="text-red-500">Error: {loadingError} </td>
                  </tr>
                )}
                {!isLoading &&
                  !loadingError &&
                  requests.map(request => (
                    <tr key={request.id} className="border-b hover:bg-gray-500 transition">
                      <td className="py-3 px-6 text-left">{request.product_name}</td>
                      <td className="py-3 px-6 text-left">{request.requesting_company_name}</td>
                      <td
                        className={`py-3 px-6 text-left ${
                          request.status == "Accepted"
                            ? "text-green-500"
                            : request.status == "Pending"
                              ? "text-yellow-500"
                              : request.status == "Rejected"
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
            {!isLoading && !loadingError && requests.length == 0 ? (
              <div className="p-5"> This company currently has no data sharing requests. </div>
            ) : (
              <div></div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
