"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Info, ArrowLeft, Download, Edit, Plus, Trash2, BarChart4, FileText } from "lucide-react";
import Modal from "../../components/ui/PopupModal";

// Using interfaces for our data models
interface CarbonEmission {
  id: string;
  type: string;
  value: number;
  unit: string;
  description?: string;
}

interface BoMLineItem {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  supplier: string;
  carbon_footprint: number | null;
  carbon_footprint_unit: string;
  is_self_estimated: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  manufacturer: string;
  status: "Imported" | "Estimated" | "Pending" | string;
  carbon_emissions: CarbonEmission[];
  bill_of_materials: BoMLineItem[];
  total_carbon_footprint: number;
  carbon_footprint_unit: string;
  dpp_available: boolean;
}

export default function ProductDetailsPage() {
  // Get params from the URL using useParams hook instead of props
  const params = useParams();
  const productId = params.productId as string;

  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Mock placeholder data
        const mockProduct: Product = {
          id: productId,
          name: "Electronic Component A",
          sku: "EC-001",
          manufacturer: "Acme Corp",
          status: "Imported",
          carbon_emissions: [
            {
              id: "1",
              type: "Manufacturing",
              value: 5.2,
              unit: "kg CO2e",
              description: "Energy used in production",
            },
            {
              id: "2",
              type: "Transport",
              value: 2.1,
              unit: "kg CO2e",
              description: "Shipping from factory to warehouse",
            },
          ],
          bill_of_materials: [
            {
              id: "1",
              product_name: "Resistor",
              quantity: 5,
              unit: "pcs",
              supplier: "Components Inc",
              carbon_footprint: 0.8,
              carbon_footprint_unit: "kg CO2e",
              is_self_estimated: false,
            },
            {
              id: "2",
              product_name: "PCB Board",
              quantity: 1,
              unit: "pcs",
              supplier: "Circuit Co",
              carbon_footprint: 3.5,
              carbon_footprint_unit: "kg CO2e",
              is_self_estimated: false,
            },
            {
              id: "3",
              product_name: "Casing",
              quantity: 1,
              unit: "pcs",
              supplier: "Unknown",
              carbon_footprint: 0.9,
              carbon_footprint_unit: "kg CO2e",
              is_self_estimated: true,
            },
          ],
          total_carbon_footprint: 12.5,
          carbon_footprint_unit: "kg CO2e",
          dpp_available: true,
        };

        setProduct(mockProduct);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProductDetails();
    }
  }, [API_URL, productId, router]);

  const handleDeleteProduct = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // TODO: This should delete the product
      // await fetch(`${API_URL}/products/${productId}`, {
      //   method: "DELETE",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push("/product-list");
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleGenerateDPP = () => {
    // this should trigger DPP generation
    alert("Digital Product Passport generation would be triggered here");
  };

  const handleDownloadDPP = () => {
    // this should download the DPP
    alert("Digital Product Passport download would be triggered here");
  };

  if (loading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-lg text-gray-500">{error || "Product not found"}</p>
          <div className="mt-6">
            <Link href="/product-list">
              <Button>Back to Product List</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with navigation and actions */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/product-list"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-500 mt-1">
              SKU: {product.sku} | Manufacturer: {product.manufacturer}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/product-list/edit/${product.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit size={16} />
                <span>Edit</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content in 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - PCF Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Carbon Footprint Summary</h2>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 text-center">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Total PCF</span>
              <span className="block text-3xl font-bold mt-1">
                {product.total_carbon_footprint}
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                {product.carbon_footprint_unit}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Status
                </span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === "Imported"
                      ? "bg-green-100 text-green-700"
                      : product.status === "Estimated"
                        ? "bg-red-100 text-red-700"
                        : product.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Digital Product Passport
                </span>
                {product.dpp_available ? (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleDownloadDPP}
                  >
                    <Download size={16} />
                    <span>Download DPP</span>
                  </Button>
                ) : (
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGenerateDPP}
                  >
                    <FileText size={16} />
                    <span>Generate DPP</span>
                  </Button>
                )}
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Carbon Reduction
                </span>
                <Link href={`/carbon-reduction/${product.id}`}>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <BarChart4 size={16} />
                    <span>Get AI Recommendations</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Carbon Emissions</h2>

            {product.carbon_emissions.length > 0 ? (
              <div className="space-y-4">
                {product.carbon_emissions.map(emission => (
                  <div
                    key={emission.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{emission.type} Emissions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {emission.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{emission.value}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          {emission.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No emission data available</p>
            )}

            <div className="mt-4">
              <Link href={`/product-list/emissions/${product.id}`}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Plus size={16} />
                  <span>Add Emission Data</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right column - Bill of Materials */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Bill of Materials</h2>
              <Link href={`/product-list/add-bom/${product.id}`}>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>Add Component</span>
                </Button>
              </Link>
            </div>

            {product.bill_of_materials.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        Component
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        Supplier
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        Carbon Footprint
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {product.bill_of_materials.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.supplier}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.is_self_estimated
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.is_self_estimated ? "Self-estimated" : "Imported"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.carbon_footprint !== null
                            ? `${item.carbon_footprint} ${item.carbon_footprint_unit}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/product-list/edit-bom/${product.id}/${item.id}`}>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" className="text-red-600">
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No components added yet</p>
                <Link href={`/product-list/add-bom/${product.id}`}>
                  <Button>Add First Component</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal title="Confirm Delete Product" onClose={() => setIsDeleteModalOpen(false)}>
          <p>
            Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
