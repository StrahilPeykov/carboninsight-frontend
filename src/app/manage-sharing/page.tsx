"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/PopupModal";
import { Building2, CheckCircle, XCircle, Clock, Search, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DataSharingRequest {
  id: string;
  requester_company: {
    id: string;
    name: string;
  };
  requested_product: {
    id: string;
    name: string;
    sku: string;
  };
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

interface OutgoingRequest {
  id: string;
  recipient_company: {
    id: string;
    name: string;
  };
  requested_product: {
    id: string;
    name: string;
    sku: string;
  };
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export default function ManageSharingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for incoming requests
  const [incomingRequests, setIncomingRequests] = useState<DataSharingRequest[]>([]);
  
  // State for outgoing requests
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);
  
  // State for new request modal
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; products: { id: string; name: string; sku: string }[] }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; sku: string } | null>(null);
  
  // State for company info
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  
  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
    
    // Fetch company details and data sharing requests
    fetchData(id);
  }, [router]);

  const fetchData = async (companyId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // In a real app, these would be actual API calls
      // For now, we'll use mock data
      
      // Mock company name
      setCompanyName("Acme Corp");
      
      // Mock incoming requests
      const mockIncomingRequests: DataSharingRequest[] = [
        {
          id: "1",
          requester_company: {
            id: "2",
            name: "Tech Innovations Ltd"
          },
          requested_product: {
            id: "101",
            name: "Electronic Component A",
            sku: "EC-001"
          },
          status: "pending",
          created_at: "2025-05-01T14:30:00Z"
        },
        {
          id: "2",
          requester_company: {
            id: "3",
            name: "Green Manufacturing Co"
          },
          requested_product: {
            id: "102",
            name: "Circuit Board X",
            sku: "CB-001"
          },
          status: "accepted",
          created_at: "2025-04-28T09:15:00Z"
        },
        {
          id: "3",
          requester_company: {
            id: "4",
            name: "Smart Devices Inc"
          },
          requested_product: {
            id: "103",
            name: "Electronic Component B",
            sku: "EC-002"
          },
          status: "rejected",
          created_at: "2025-04-20T16:45:00Z"
        }
      ];
      
      // Mock outgoing requests
      const mockOutgoingRequests: OutgoingRequest[] = [
        {
          id: "4",
          recipient_company: {
            id: "5",
            name: "Component Suppliers SA"
          },
          requested_product: {
            id: "201",
            name: "Resistor Pack",
            sku: "RP-100"
          },
          status: "pending",
          created_at: "2025-05-05T10:20:00Z"
        },
        {
          id: "5",
          recipient_company: {
            id: "6",
            name: "Precision Parts Ltd"
          },
          requested_product: {
            id: "202",
            name: "Metal Casing",
            sku: "MC-200"
          },
          status: "accepted",
          created_at: "2025-04-25T11:30:00Z"
        }
      ];
      
      setIncomingRequests(mockIncomingRequests);
      setOutgoingRequests(mockOutgoingRequests);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data sharing information");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // In a real app, this would be an actual API call
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults = [
        {
          id: "5",
          name: "Component Suppliers SA",
          products: [
            {
              id: "201",
              name: "Resistor Pack",
              sku: "RP-100"
            },
            {
              id: "203",
              name: "Capacitor Set",
              sku: "CS-300"
            }
          ]
        },
        {
          id: "7",
          name: "Electronic Components Co",
          products: [
            {
              id: "301",
              name: "PCB Board",
              sku: "PCB-100"
            },
            {
              id: "302",
              name: "Display Module",
              sku: "DM-200"
            }
          ]
        }
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error("Error searching companies:", err);
      setError("Failed to search for companies");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = (company: { id: string; name: string }) => {
    setSelectedCompany(company);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product: { id: string; name: string; sku: string }) => {
    setSelectedProduct(product);
  };

  const handleSendRequest = async () => {
    if (!selectedCompany || !selectedProduct) return;
    
    try {
      // In a real app, this would send the request to the API
      // For now, we'll just close the modal and refresh the data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new request to our state
      const newRequest: OutgoingRequest = {
        id: Math.random().toString(36).substring(7),
        recipient_company: selectedCompany,
        requested_product: selectedProduct,
        status: "pending",
        created_at: new Date().toISOString()
      };
      
      setOutgoingRequests([newRequest, ...outgoingRequests]);
      
      // Close the modal and reset selection
      setIsNewRequestModalOpen(false);
      setSelectedCompany(null);
      setSelectedProduct(null);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Error sending request:", err);
      setError("Failed to send data sharing request");
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: "accepted" | "rejected") => {
    try {
      // In a real app, this would send the status update to the API
      // For now, we'll just update our local state
      
      // Update the request in our state
      setIncomingRequests(
        incomingRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus } 
            : request
        )
      );
    } catch (err) {
      console.error("Error updating request status:", err);
      setError("Failed to update request status");
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to render status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </div>
        );
      case "accepted":
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading data sharing information...</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/list-companies" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Companies</span>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Data Sharing Management</h1>
            <p className="text-gray-500 mt-1">Manage product carbon footprint data sharing for {companyName}</p>
          </div>
          
          <Button 
            onClick={() => setIsNewRequestModalOpen(true)} 
            className="flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>New Data Request</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Incoming Requests */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Incoming Data Sharing Requests</h2>
          
          {incomingRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Requester
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {incomingRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {request.requester_company.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="block font-medium">{request.requested_product.name}</span>
                          <span className="block text-xs">SKU: {request.requested_product.sku}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {renderStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === "pending" && (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateRequestStatus(request.id, "accepted")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No incoming data sharing requests
            </p>
          )}
        </Card>
        
        {/* Outgoing Requests */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Outgoing Data Sharing Requests</h2>
          
          {outgoingRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Supplier
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {outgoingRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {request.recipient_company.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="block font-medium">{request.requested_product.name}</span>
                          <span className="block text-xs">SKU: {request.requested_product.sku}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {renderStatusBadge(request.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No outgoing data sharing requests
            </p>
          )}
        </Card>
      </div>
      
      {/* New Request Modal */}
      {isNewRequestModalOpen && (
        <Modal title="Request Supplier Data" onClose={() => setIsNewRequestModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search for supplier company
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Company name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="p-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a company
                </h3>
                <div className="border border-gray-200 rounded-md divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
                  {searchResults.map(company => (
                    <div 
                      key={company.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 
                        ${selectedCompany?.id === company.id ? 'bg-gray-100 dark:bg-gray-800' : ''}
                      `}
                      onClick={() => handleSelectCompany(company)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">{company.name}</span>
                        </div>
                        {selectedCompany?.id === company.id && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedCompany && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a product from {selectedCompany.name}
                </h3>
                <div className="border border-gray-200 rounded-md divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
                  {searchResults
                    .find(company => company.id === selectedCompany.id)
                    ?.products.map(product => (
                      <div 
                        key={product.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 
                          ${selectedProduct?.id === product.id ? 'bg-gray-100 dark:bg-gray-800' : ''}
                        `}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block font-medium">{product.name}</span>
                            <span className="block text-xs text-gray-500">SKU: {product.sku}</span>
                          </div>
                          {selectedProduct?.id === product.id && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsNewRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendRequest} 
                disabled={!selectedCompany || !selectedProduct}
              >
                Send Request
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}